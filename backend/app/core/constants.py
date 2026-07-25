"""
Medical and system constants for the Enterprise AI Medical Diagnosis Assistant.

Includes clinical reference data, chatbot prompts, emergency indicators,
and standard precautions mappings.
"""

from typing import Dict, List, Any

# Clinical reference data for predictions and chatbot responses.
# Maps disease labels to explanations, precautions, and severity flags.
DISEASE_METADATA: Dict[str, Dict[str, Any]] = {
    "heart attack": {
        "explanation": "A heart attack (myocardial infarction) occurs when blood flow to a part of the heart is blocked, causing muscle damage.",
        "precautions": [
            "Call emergency services (911) immediately.",
            "Have the person sit down, rest, and try to remain calm.",
            "Chew and swallow an aspirin if not allergic and advised by a medical dispatcher.",
            "Begin CPR if the person is unconscious and not breathing."
        ],
        "is_emergency": True
    },
    "stroke": {
        "explanation": "A stroke occurs when blood flow to the brain is interrupted or reduced, depriving brain tissue of oxygen and nutrients.",
        "precautions": [
            "Call emergency services (911) immediately. Time is critical.",
            "Check for facial drooping, arm weakness, or speech difficulty (FAST).",
            "Do not give the person food, drink, or medication (especially aspirin).",
            "Keep the person lying down and monitor their breathing."
        ],
        "is_emergency": True
    },
    "pneumonia": {
        "explanation": "Pneumonia is an infection that inflames the air sacs in one or both lungs, which may fill with fluid or pus.",
        "precautions": [
            "Consult a physician promptly for diagnostic evaluation (X-ray, blood tests).",
            "Take prescribed antibiotics or antivirals exactly as directed.",
            "Get plenty of rest and stay well hydrated.",
            "Monitor oxygen levels and seek urgent care if breathing becomes difficult."
        ],
        "is_emergency": False
    },
    "appendicitis": {
        "explanation": "Appendicitis is an inflammation of the appendix, a finger-shaped pouch that projects from your colon on the lower right side.",
        "precautions": [
            "Seek emergency medical evaluation. Appendicitis usually requires surgical removal.",
            "Do not eat, drink, or use pain relievers or laxatives before evaluation (can mask symptoms or cause rupture).",
            "Avoid heavy physical exertion.",
            "Go to the emergency department if pain becomes severe and sudden."
        ],
        "is_emergency": True
    },
    "urinary tract infection": {
        "explanation": "A urinary tract infection (UTI) is an infection in any part of your urinary system, most commonly the bladder and urethra.",
        "precautions": [
            "Consult a healthcare professional to obtain antibiotics if indicated.",
            "Drink plenty of water to help flush out bacteria.",
            "Avoid drinks that may irritate your bladder (coffee, alcohol, citrus soda).",
            "Use a heating pad on your abdomen to reduce discomfort."
        ],
        "is_emergency": False
    },
    "allergy": {
        "explanation": "An allergy is an immune system reaction to a foreign substance (allergen) that is typically not harmful to your body.",
        "precautions": [
            "Identify and avoid triggers (pollen, dust mites, specific foods).",
            "Use over-the-counter antihistamines or nasal sprays for mild symptoms.",
            "Keep an epinephrine auto-injector (EpiPen) nearby if you have a history of severe reactions.",
            "Seek immediate medical attention if you experience swelling of the face, throat, or difficulty breathing."
        ],
        "is_emergency": False
    },
    "common cold": {
        "explanation": "The common cold is a viral infection of your nose and throat (upper respiratory tract). It is usually harmless.",
        "precautions": [
            "Get plenty of rest and sleep.",
            "Drink warm fluids like water, broth, or tea to stay hydrated.",
            "Use saline nasal drops or sprays to relieve congestion.",
            "Use over-the-counter pain relievers or throat lozenges for symptom relief."
        ],
        "is_emergency": False
    },
    "flu": {
        "explanation": "Influenza (flu) is a contagious respiratory illness caused by influenza viruses that infect the nose, throat, and lungs.",
        "precautions": [
            "Stay home and rest to avoid spreading the virus.",
            "Drink plenty of fluids (water, clear broths, herbal teas).",
            "Consider antiviral medications if prescribed by a doctor within the first 48 hours.",
            "Seek medical care if you experience chest pain, difficulty breathing, or high persistent fever."
        ],
        "is_emergency": False
    },
    "gastroesophageal reflux disease (gerd)": {
        "explanation": "GERD occurs when stomach acid frequently flows back into the tube connecting your mouth and stomach (esophagus), irritating its lining.",
        "precautions": [
            "Eat smaller, more frequent meals.",
            "Avoid lying down for at least 2 to 3 hours after eating.",
            "Avoid trigger foods such as fatty/fried foods, caffeine, alcohol, and chocolate.",
            "Elevate the head of your bed by 6 to 9 inches."
        ],
        "is_emergency": False
    },
    "asthma": {
        "explanation": "Asthma is a chronic condition in which your airways narrow and swell, producing extra mucus, which makes breathing difficult.",
        "precautions": [
            "Keep quick-relief inhalers (bronchodilators) easily accessible.",
            "Avoid known triggers such as smoke, pollen, dust, or pet dander.",
            "Monitor peak flow rates if recommended by your physician.",
            "Seek immediate medical care if rescue inhalers do not relieve severe shortness of breath."
        ],
        "is_emergency": False
    }
}

# Red flag symptoms indicating high severity or requiring immediate emergency care
EMERGENCY_WORDS: List[str] = [
    "chest pain", "difficulty breathing", "shortness of breath", "severe chest pressure",
    "loss of speech", "inability to move", "confusion", "slurred speech", "paralysis",
    "sudden numbness", "loss of vision", "unconscious", "passed out", "heavy bleeding",
    "poisoning", "suicidal thoughts", "severe abdominal pain", "appendix rupture"
]

DEFAULT_EXPLANATION = "A medical condition characterized by {disease_name}. A physician must evaluate these symptoms to confirm diagnosis."
DEFAULT_PRECAUTIONS = [
    "Schedule a consultation with a qualified primary care provider.",
    "Monitor symptoms closely and record any changes in frequency or severity.",
    "Get adequate rest and stay hydrated.",
    "Seek immediate emergency medical care if you develop red-flag symptoms (chest pain, shortness of breath, sudden numbness, or confusion)."
]

# Legal/medical disclaimer required for compliance
CHATBOT_DISCLAIMER = (
    "Disclaimer: I am an AI Medical Assistant, not a licensed healthcare professional. "
    "My suggestions are for educational purposes and initial guidance only. They do NOT "
    "substitute for professional medical advice, diagnosis, or treatment. If you are experiencing "
    "a medical emergency, please call your local emergency services (911) immediately."
)

# System prompt for LLM integrations
CHATBOT_SYSTEM_PROMPT = """
You are a highly capable, compassionate, and precise virtual medical assistant.
Your goal is to gather patient symptoms systematically, determine if there are emergency symptoms, and summarize symptoms for disease prediction.

Follow these clinical protocols:
1. Greet the user and ask for their primary complaint.
2. Gather symptoms step-by-step. Do not ask more than 1 or 2 clear questions at a time.
3. If they describe any red-flag symptoms (e.g., severe chest pain, extreme shortness of breath, sudden numbness, slurred speech), stop symptom collection and tell them clearly to contact emergency services (911). Include the standard disclaimer.
4. Once you have a clear picture (typically after 3-5 user interactions), summarize their symptoms into a concise clinical summary and provide standard guidance.
5. If the prediction is returned, explain it in simple, layman terms, outline the confidence level clearly, suggest precautions, and remind them that this is not a substitute for seeing a doctor.
6. Always append the standard disclaimer.
"""
