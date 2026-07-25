"""
AI Medical Chatbot Service Module.

Manages stateful chatbot conversations, performs emergency screening,
orchestrates modular LLM invocations, and triggers symptom summaries
for prediction.
"""

import json
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.constants import (
    EMERGENCY_WORDS,
    CHATBOT_DISCLAIMER,
    CHATBOT_SYSTEM_PROMPT,
    DISEASE_METADATA,
    DEFAULT_PRECAUTIONS
)
from app.core.logger import get_logger
from app.models.conversation import Conversation, Message
from app.models.history import History
from app.repositories.conversation import conversation_repository
from app.repositories.history import history_repository
from app.services.predictor import predictor_service

logger = get_logger(__name__)


class LLMClient:
    """Client utility to perform raw API calls to LLM providers (Gemini, OpenAI)."""

    @staticmethod
    def call_gemini(messages: List[Dict[str, str]], api_key: str) -> str:
        """Call Gemini API using standard REST endpoints."""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        
        # Convert chatbot prompt structure to Gemini contents structure
        contents = []
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": msg["content"]}]
            })
            
        payload = {"contents": contents}
        
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                return res_data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            logger.error(f"Gemini API invocation failed: {e}")
            raise e

    @staticmethod
    def call_openai(messages: List[Dict[str, str]], api_key: str) -> str:
        """Call OpenAI API using standard completions endpoint."""
        url = "https://api.openai.com/v1/chat/completions"
        payload = {
            "model": "gpt-4o-mini",
            "messages": messages,
            "temperature": 0.5
        }
        
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}"
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                return res_data["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"OpenAI API invocation failed: {e}")
            raise e


class ChatbotService:
    """Service class for coordinating active medical diagnostic chat conversations."""

    def _screen_for_emergencies(self, text: str) -> bool:
        """Checks symptom text for high-risk warning flags.
        
        Args:
            text (str): Incoming text.
            
        Returns:
            bool: True if an emergency sign is detected.
        """
        cleaned = text.lower()
        for word in EMERGENCY_WORDS:
            if word in cleaned:
                logger.warning(f"Emergency indicator '{word}' flagged in user input.")
                return True
        return False

    def _generate_mock_reply(self, message_history: List[Message], user_input: str) -> Tuple[str, bool, Optional[str]]:
        """A stateful fallback conversational rule-engine for symptoms.
        
        Returns:
            Tuple[str, bool, str | None]: (reply, diagnosis_ready, symptoms_summary)
        """
        user_messages = [m for m in message_history if m.sender == "user"]
        msg_count = len(user_messages)

        # Build list of user symptom inputs
        inputs = " ".join([m.text for m in user_messages])

        if msg_count == 1:
            reply = (
                f"I have noted your symptoms: '{user_input}'. To help me understand better, "
                f"could you tell me how long you've had this and if it is accompanied by "
                f"fever, body aches, or any other pain?"
            )
            return reply, False, None
        
        elif msg_count == 2:
            reply = (
                "Thank you. Have you noticed any other issues, like nausea, fatigue, "
                "or changes in sleep? Please describe them."
            )
            return reply, False, None

        elif msg_count == 3:
            reply = (
                "Got it. Is there any specific trigger (like food, environment, or activities) "
                "that makes it feel worse, or does anything help relieve it?"
            )
            return reply, False, None

        else:
            # Gathered enough info (4 or more user inputs), request diagnosis
            # Summarize the inputs
            symptoms_summary = inputs
            reply = (
                f"I have collected your symptoms. Here is my summary:\n"
                f"'{symptoms_summary}'\n\n"
                f"Running the diagnostic prediction engine..."
            )
            return reply, True, symptoms_summary

    def process_chat(self, db: Session, *, user_id: str, message_text: str, conversation_id: Optional[str] = None) -> Dict[str, Any]:
        """Process conversational turns, handle LLM integrations, and perform symptom checks.
        
        Args:
            db (Session): Database transaction session.
            user_id (str): ID of the patient.
            message_text (str): Incoming conversational string.
            conversation_id (str, optional): Active chat session ID.
            
        Returns:
            Dict[str, Any]: Pydantic ChatResponse payload parameters.
        """
        # 1. Retrieve or create session
        conversation = None
        if conversation_id:
            conversation = conversation_repository.get(db, id=conversation_id)
        
        if not conversation or not conversation.is_active or conversation.user_id != user_id:
            # Fallback: look for any active session
            conversation = conversation_repository.get_active_by_user(db, user_id=user_id)

        if not conversation:
            # Initialize a new session
            conversation = Conversation(user_id=user_id, is_active=True)
            conversation = conversation_repository.create(db, obj_in=conversation)
            logger.info(f"Initialized new chatbot session. ID: {conversation.id}")

        # 2. Append User Message
        conversation_repository.create_message(
            db, 
            conversation_id=conversation.id, 
            sender="user", 
            text=message_text
        )

        # 3. Emergency Warning Interception
        if self._screen_for_emergencies(message_text):
            reply_text = (
                "EMERGENCY WARNING: The symptoms you described could indicate a serious or "
                "life-threatening condition. Please stop using this chat and call emergency "
                "services (911) or go to the nearest emergency room immediately.\n\n" + CHATBOT_DISCLAIMER
            )
            # Deactivate conversation immediately
            conversation_repository.deactivate(db, conversation_id=conversation.id)
            conversation_repository.create_message(
                db, 
                conversation_id=conversation.id, 
                sender="assistant", 
                text=reply_text
            )
            
            return {
                "conversation_id": conversation.id,
                "reply": reply_text,
                "symptoms_summarized": "Emergency condition detected.",
                "diagnosis_ready": False,
                "prediction": None
            }

        # 4. Refresh message list to capture the latest state
        db.refresh(conversation)
        all_messages = conversation.messages

        # 5. Execute conversational reasoning (LLM or Rules Fallback)
        reply = ""
        diagnosis_ready = False
        symptoms_summary = None

        if settings.LLM_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
            try:
                # Build context for LLM
                context_messages = [{"role": "system", "content": CHATBOT_SYSTEM_PROMPT}]
                for msg in all_messages:
                    role = "user" if msg.sender == "user" else "assistant"
                    context_messages.append({"role": role, "content": msg.text})
                
                reply = LLMClient.call_gemini(context_messages, settings.GEMINI_API_KEY)
                
                # Check if LLM indicates it is ready to diagnose (heuristics)
                user_messages = [m for m in all_messages if m.sender == "user"]
                if len(user_messages) >= 4 or "diagnos" in reply.lower() or "summar" in reply.lower():
                    diagnosis_ready = True
                    symptoms_summary = " ".join([m.text for m in user_messages])
            except Exception as e:
                logger.error(f"Fallback to rules engine due to LLM error: {e}")
                reply, diagnosis_ready, symptoms_summary = self._generate_mock_reply(all_messages, message_text)
                
        elif settings.LLM_PROVIDER == "openai" and settings.OPENAI_API_KEY:
            try:
                context_messages = [{"role": "system", "content": CHATBOT_SYSTEM_PROMPT}]
                for msg in all_messages:
                    role = "user" if msg.sender == "user" else "assistant"
                    context_messages.append({"role": role, "content": msg.text})
                
                reply = LLMClient.call_openai(context_messages, settings.OPENAI_API_KEY)
                
                user_messages = [m for m in all_messages if m.sender == "user"]
                if len(user_messages) >= 4 or "diagnos" in reply.lower() or "summar" in reply.lower():
                    diagnosis_ready = True
                    symptoms_summary = " ".join([m.text for m in user_messages])
            except Exception as e:
                logger.error(f"Fallback to rules engine due to LLM error: {e}")
                reply, diagnosis_ready, symptoms_summary = self._generate_mock_reply(all_messages, message_text)
                
        else:
            # Use stateful rule-engine fallback
            reply, diagnosis_ready, symptoms_summary = self._generate_mock_reply(all_messages, message_text)

        # 6. If Diagnosis Ready, run predictor & compile results
        saved_prediction = None
        if diagnosis_ready and symptoms_summary:
            # Run prediction
            saved_prediction = predictor_service.predict_and_persist(
                db, 
                symptom_text=symptoms_summary, 
                user_id=user_id
            )
            
            # Save prediction link to conversation
            conversation.prediction_id = saved_prediction.id
            conversation.summary = symptoms_summary
            conversation_repository.deactivate(db, conversation_id=conversation.id)
            
            # Format comprehensive chatbot reply explaining predictions
            meta = DISEASE_METADATA.get(saved_prediction.predicted_disease.lower())
            prec_text = "\n".join([f"- {p}" for p in (meta["precautions"] if meta else DEFAULT_PRECAUTIONS)])
            
            reply = (
                f"Diagnostic Summary:\n"
                f"Based on our dialogue, I have compiled your symptom details and queried the prediction engine.\n\n"
                f"• Predicted Condition: **{saved_prediction.predicted_disease.upper()}**\n"
                f"• Prediction Confidence: **{saved_prediction.confidence_score * 100:.2f}%**\n\n"
                f"Explanation:\n{saved_prediction.explanation}\n\n"
                f"Recommended Precautions:\n{prec_text}\n\n"
                f"Note: This assessment is based on machine learning classifications. "
                f"I recommend scheduling an appointment with a general practitioner to verify these indications.\n\n"
                + CHATBOT_DISCLAIMER
            )

        # Append Assistant Message to DB
        conversation_repository.create_message(
            db, 
            conversation_id=conversation.id, 
            sender="assistant", 
            text=reply
        )

        return {
            "conversation_id": conversation.id,
            "reply": reply,
            "symptoms_summarized": conversation.summary or symptoms_summary,
            "diagnosis_ready": diagnosis_ready,
            "prediction": saved_prediction
        }


# Singleton chatbot service instance
chatbot_service = ChatbotService()
