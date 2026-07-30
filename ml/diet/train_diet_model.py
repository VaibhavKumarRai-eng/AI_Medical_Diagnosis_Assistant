"""
AI Diet Planner - Model Training and Evaluation Engine.

Compares KNN, Decision Tree, Random Forest, and Gradient Boosting algorithms
to classify food items into diet suitability categories, evaluating performance
metrics and serializing the best model.
"""

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neighbors import KNeighborsClassifier

# Define paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROCESSED_DATA_PATH = os.path.join(BASE_DIR, "dataset", "processed", "cleaned_nutrition.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_OUTPUT_PATH = os.path.join(MODEL_DIR, "diet_recommendation_model.pkl")

os.makedirs(MODEL_DIR, exist_ok=True)


def train_and_evaluate() -> None:
    print("Loading preprocessed nutrition dataset...")
    if not os.path.exists(PROCESSED_DATA_PATH):
        raise FileNotFoundError(f"Cleaned dataset not found at {PROCESSED_DATA_PATH}. Run preprocessing first.")

    df = pd.read_csv(PROCESSED_DATA_PATH)
    
    # 1. Define Target Labels
    # We construct a multi-class classification target: 'diet_category'
    # Suitability categories: 0=Balanced, 1=Weight Loss, 2=Muscle Gain, 3=Diabetic Friendly
    conditions = [
        (df["muscle_gain_friendly"] == True),
        (df["diabetic_friendly"] == True) & (df["muscle_gain_friendly"] == False),
        (df["weight_loss_friendly"] == True) & (df["muscle_gain_friendly"] == False) & (df["diabetic_friendly"] == False)
    ]
    choices = ["muscle_gain", "diabetic", "weight_loss"]
    df["diet_category"] = np.select(conditions, choices, default="balanced")
    
    print("Class distribution in dataset:")
    print(df["diet_category"].value_counts())

    # 2. Features and Target Split
    features = ["calories", "protein", "carbs", "fat", "fiber", "sugar", "protein_ratio", "carb_ratio", "fat_ratio"]
    X = df[features].fillna(0.0)
    y = df["diet_category"]

    # Label Encode Target
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    # Train-test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.25, random_state=42, stratify=y_encoded)

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 3. Model Comparison
    models = {
        "Decision Tree": DecisionTreeClassifier(random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
        "KNN (k=5)": KNeighborsClassifier(n_neighbors=5),
        "Gradient Boosting": GradientBoostingClassifier(random_state=42)
    }

    best_model_name = None
    best_f1 = 0.0
    best_model = None
    evaluation_results = {}

    print("\n" + "="*50)
    print("ALGORITHM COMPARISON & EVALUATION REPORT")
    print("="*50)

    for name, model in models.items():
        # Train model
        model.fit(X_train_scaled, y_train)
        preds = model.predict(X_test_scaled)
        
        # Calculate metrics
        acc = accuracy_score(y_test, preds)
        precision, recall, f1, _ = precision_recall_fscore_support(y_test, preds, average="weighted")
        
        evaluation_results[name] = {
            "accuracy": acc,
            "precision": precision,
            "recall": recall,
            "f1_score": f1
        }
        
        print(f"\nModel: {name}")
        print(f" - Accuracy  : {acc*100:.2f}%")
        print(f" - Precision : {precision*100:.2f}%")
        print(f" - Recall    : {recall*100:.2f}%")
        print(f" - F1-Score  : {f1*100:.2f}%")

        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_model = model

    print("\n" + "="*50)
    print(f"Winner Model: {best_model_name} (F1 Score: {best_f1*100:.2f}%)")
    print("="*50)

    # 4. Save best pipeline elements
    model_payload = {
        "model": best_model,
        "scaler": scaler,
        "label_encoder": le,
        "features": features,
        "algorithm_used": best_model_name,
        "evaluation_metrics": evaluation_results
    }

    joblib.dump(model_payload, MODEL_OUTPUT_PATH)
    print(f"Best recommendation model saved to: {MODEL_OUTPUT_PATH}")


if __name__ == "__main__":
    train_and_evaluate()
