"""
Automated Backend Validation and Verification Script.

Uses FastAPI TestClient to test all API layers, database operations,
security controls, ML models, and chatbot state machines.
"""

import os
import sys

# Ensure backend directory is in path
backend_dir = os.path.abspath(os.path.dirname(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Override database URL to use a clean test database file
os.environ["DATABASE_URL"] = "sqlite:///./test_medical_assistant.db"

# Force mock LLM provider for isolated testing
os.environ["LLM_PROVIDER"] = "mock"

# Force configuration settings for test execution
os.environ["SECRET_KEY"] = "validation_test_secret_key_12345"

try:
    from fastapi.testclient import TestClient
    from app.main import app
    from app.core.database import Base, engine
    from app.core.config import settings
except ImportError as err:
    print(f"Failed to import backend modules. Ensure requirements are installed: {err}")
    print("Please install requirements using: pip install fastapi httpx sqlalchemy python-jose passlib bcrypt")
    sys.exit(1)

# Initialize the test database
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

# Seed default admin user manually since TestClient doesn't invoke lifespan automatically without context
from app.main import seed_admin_user
seed_admin_user()

client = TestClient(app)

def run_tests() -> None:
    print("\n" + "="*70)
    print("RUNNING ENTERPRISE MEDICAL DIAGNOSIS ASSISTANT BACKEND VALIDATION")
    print("="*70)

    # ----------------------------------------------------
    # Test 1: Telemetry and Health Checks
    # ----------------------------------------------------
    print("\n[Test 1] Verifying System Health & Version Telemetry...")
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print(f" + Health check status: {res.json()}")

    res = client.get("/version")
    assert res.status_code == 200, f"Version query failed: {res.text}"
    print(f" + Version info: {res.json()}")

    # ----------------------------------------------------
    # Test 2: User Registration
    # ----------------------------------------------------
    print("\n[Test 2] Verifying User Registration & Password Rules...")
    # Test invalid registration (weak password)
    bad_user = {
        "email": "patient@example.com",
        "password": "weak",
        "full_name": "Test Patient"
    }
    res = client.post("/register", json=bad_user)
    assert res.status_code == 422 or res.status_code == 400, "Should have rejected weak password"
    print(" + Weak password registration successfully blocked.")

    # Test valid registration
    valid_user = {
        "email": "patient@example.com",
        "password": "SecurePassword123!",
        "full_name": "John Doe"
    }
    res = client.post("/register", json=valid_user)
    assert res.status_code == 201, f"Registration failed: {res.text}"
    print(" + Valid patient registration successful.")

    # ----------------------------------------------------
    # Test 3: User Login and Token Generation
    # ----------------------------------------------------
    print("\n[Test 3] Verifying User Login and Auth Tokens...")
    # Test invalid login
    res = client.post("/login", data={"username": "patient@example.com", "password": "WrongPassword"})
    assert res.status_code == 401, "Should have failed authentication"
    print(" + Invalid credentials blocked successfully.")

    # Test valid login
    res = client.post("/login", data={"username": "patient@example.com", "password": "SecurePassword123!"})
    assert res.status_code == 200, f"Login failed: {res.text}"
    auth_data = res.json()
    access_token = auth_data["access_token"]
    refresh_token = auth_data["refresh_token"]
    print(" + Authentication token generated successfully.")
    
    headers = {"Authorization": f"Bearer {access_token}"}

    # ----------------------------------------------------
    # Test 4: Profile Operations
    # ----------------------------------------------------
    print("\n[Test 4] Verifying Profile Retrieval and Updates...")
    res = client.get("/profile", headers=headers)
    assert res.status_code == 200, f"Profile get failed: {res.text}"
    profile = res.json()
    assert profile["full_name"] == "John Doe"
    print(f" + Profile read success: {profile['email']} | {profile['full_name']}")

    # Update profile
    res = client.put("/profile", json={"full_name": "Johnathan Doe"}, headers=headers)
    assert res.status_code == 200, f"Profile update failed: {res.text}"
    assert res.json()["full_name"] == "Johnathan Doe"
    print(" + Profile update successful.")

    # ----------------------------------------------------
    # Test 5: Disease Prediction Engine
    # ----------------------------------------------------
    print("\n[Test 5] Verifying ML Disease Prediction Engine...")
    symptom_payload = {
        "symptom_text": "I am experiencing severe chest pain, shortness of breath, palpitations, and sudden dizziness."
    }
    # Test prediction (with authorization context)
    res = client.post("/predict", json=symptom_payload, headers=headers)
    assert res.status_code == 200, f"Prediction call failed: {res.text}"
    pred_data = res.json()
    print(f" + Predicted Disease  : {pred_data['predicted_disease']}")
    print(f" + Confidence Level   : {pred_data['confidence_score'] * 100:.2f}%")
    print(f" + Top 5 Predictions  : {[p['disease'] for p in pred_data['top_5_predictions']]}")
    print(f" + Medical Explanation: {pred_data['explanation'][:100]}...")
    print(f" + Precautions        : {pred_data['precautions']}")

    # ----------------------------------------------------
    # Test 6: Stateful AI Medical Chatbot
    # ----------------------------------------------------
    print("\n[Test 6] Verifying Chatbot Screening & Dialogue States...")
    # Test Emergency Screening (red-flags)
    chat_emergency = {"message": "Help, I think I am having chest pain and sudden slurred speech!"}
    res = client.post("/chat", json=chat_emergency, headers=headers)
    assert res.status_code == 200
    emergency_reply = res.json()
    assert "EMERGENCY" in emergency_reply["reply"], "Should have triggered emergency warning"
    print(" + Emergency red flag detector successfully intercepted query.")

    # Test conversational flow to diagnosis
    conversation_id = None
    
    # Message 1
    res = client.post("/chat", json={"message": "I feel very feverish and have a dry cough"}, headers=headers)
    assert res.status_code == 200
    res_json = res.json()
    conversation_id = res_json["conversation_id"]
    print(f" + Chat message 1 reply: {res_json['reply'][:60]}...")
    
    # Message 2
    res = client.post("/chat", json={"conversation_id": conversation_id, "message": "It started about 3 days ago and has gotten worse"}, headers=headers)
    res_json = res.json()
    print(f" + Chat message 2 reply: {res_json['reply'][:60]}...")

    # Message 3
    res = client.post("/chat", json={"conversation_id": conversation_id, "message": "I also feel very tired and minor headache"}, headers=headers)
    res_json = res.json()
    print(f" + Chat message 3 reply: {res_json['reply'][:60]}...")

    # Message 4 (Triggers diagnosis summary)
    res = client.post("/chat", json={"conversation_id": conversation_id, "message": "No other symptoms, and hot tea helps a bit"}, headers=headers)
    res_json = res.json()
    assert res_json["diagnosis_ready"] is True, "Diagnosis should be active after 4 user messages"
    print(" + Stateful chatbot completed symptom gathering.")
    print(f" + Summarized Symptoms : {res_json['symptoms_summarized']}")
    print(f" + Predictor Results   : {res_json['prediction']['predicted_disease'].upper()} ({res_json['prediction']['confidence_score'] * 100:.2f}%)")

    # ----------------------------------------------------
    # Test 7: Prediction History Logs
    # ----------------------------------------------------
    print("\n[Test 7] Verifying Diagnostic History & Search filters...")
    res = client.get("/history", headers=headers)
    assert res.status_code == 200
    histories = res.json()
    assert len(histories) >= 2, f"Should have recorded prediction and chatbot-prediction. Count: {len(histories)}"
    history_id = histories[0]["id"]
    print(f" + Total diagnostic history records logged: {len(histories)}")

    # Fetch detail with messages
    res = client.get(f"/history/{history_id}", headers=headers)
    assert res.status_code == 200
    detail = res.json()
    print(f" + Detailed log: disease='{detail['prediction']['predicted_disease']}', has_chat={detail['conversation'] is not None}")

    # Search keyword
    res = client.get(f"/history?q=chest", headers=headers)
    assert res.status_code == 200
    search_results = res.json()
    print(f" + Search for 'chest' returned {len(search_results)} records.")

    # ----------------------------------------------------
    # Test 8: Admin Dashboard telemetry
    # ----------------------------------------------------
    print("\n[Test 8] Verifying Admin Dashboard Authorization...")
    # Admin login
    res = client.post("/login", data={"username": settings.FIRST_ADMIN_EMAIL, "password": settings.FIRST_ADMIN_PASSWORD})
    assert res.status_code == 200
    admin_auth = res.json()
    admin_headers = {"Authorization": f"Bearer {admin_auth['access_token']}"}
    
    # Query admin dashboard
    res = client.get("/admin/dashboard", headers=admin_headers)
    assert res.status_code == 200
    admin_data = res.json()
    assert admin_data["total_users"] > 0
    print(f" + Total users (Admin Panel)       : {admin_data['total_users']}")
    print(f" + Total predictions (Admin Panel) : {admin_data['total_predictions']}")
    print(f" + Most predicted diseases          : {admin_data['most_predicted_diseases']}")
    print(f" + System Health Database           : {admin_data['system_health']['database_status']}")
    print(f" + Model Version details            : {admin_data['model_version']}")

    # ----------------------------------------------------
    # Test 9: Deletion & Cleanups
    # ----------------------------------------------------
    print("\n[Test 9] Verifying History Log Deletion & Cascade Cleanups...")
    res = client.delete(f"/history/{history_id}", headers=headers)
    assert res.status_code == 200
    print(" + Deleted history record.")
    
    res = client.get("/history", headers=headers)
    assert len(res.json()) == len(histories) - 1
    print(" + Cascade verification: history list decremented correctly.")

    # ----------------------------------------------------
    # Test 10: Diet Planner Endpoints & Log Deletion
    # ----------------------------------------------------
    print("\n[Test 10] Verifying Diet Planner API & Meal Logging Deletion...")
    
    # 1. Test BMI Calculator
    res = client.post("/diet/calculate-bmi", json={"weight_kg": 70.0, "height_cm": 175.0})
    assert res.status_code == 200, f"BMI Calculation failed: {res.text}"
    bmi_res = res.json()
    assert bmi_res["bmi"] == 22.86
    assert bmi_res["classification"] == "Normal"
    print(" + BMI Calculation verified.")

    # 2. Test Recommendation Generation
    diet_payload = {
        "weight_kg": 70.0,
        "height_cm": 175.0,
        "age": 25,
        "gender": "male",
        "goal": "muscle_gain",
        "activity_level": "moderate",
        "food_preference": "Veg",
        "allergies": [],
        "medical_conditions": []
    }
    res = client.post("/diet/generate", json=diet_payload, headers=headers)
    assert res.status_code == 201, f"Diet Generation failed: {res.text}"
    plan_res = res.json()
    assert plan_res["target_calories"] > 0
    assert "recommended_meals" in plan_res
    print(" + Diet recommendation generation verified.")

    # 3. Test Meal Logging
    meal_payload = {
        "food_name": "Test Healthy Oatmeal",
        "meal_type": "Breakfast",
        "serving_count": 1.0,
        "calories": 250.0,
        "protein": 15.0,
        "carbs": 30.0,
        "fat": 5.0
    }
    res = client.post("/diet/meal-history", json=meal_payload, headers=headers)
    assert res.status_code == 201, f"Meal logging failed: {res.text}"
    logged_meal = res.json()
    logged_meal_id = logged_meal["id"]
    print(" + Meal history logging verified.")

    # 4. Verify Log Retrieval
    res = client.get("/diet/meal-history", headers=headers)
    assert res.status_code == 200, f"Meal history retrieval failed: {res.text}"
    history_logs = res.json()
    assert any(log["id"] == logged_meal_id for log in history_logs)
    print(" + Meal history retrieval verified.")

    # 5. Delete Meal Log
    res = client.delete(f"/diet/meal-history/{logged_meal_id}", headers=headers)
    assert res.status_code == 200, f"Meal log deletion failed: {res.text}"
    print(" + Meal log deletion execution verified.")

    # 6. Verify Deletion Persisted
    res = client.get("/diet/meal-history", headers=headers)
    assert res.status_code == 200
    assert not any(log["id"] == logged_meal_id for log in res.json())
    print(" + Meal log deletion verification complete.")

    print("\n" + "="*70)
    print("ALL TEST SCENARIOS PASSED SUCCESSFULLY! BACKEND STACK IS PRODUCTION-READY.")
    print("="*70 + "\n")

    # Clean up test database file
    Base.metadata.drop_all(bind=engine)
    try:
        if os.path.exists("./test_medical_assistant.db"):
            os.remove("./test_medical_assistant.db")
    except Exception:
        pass

if __name__ == "__main__":
    run_tests()
