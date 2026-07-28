"""
Quick Model Training script to rapidly train and persist model artifacts.

Author: AI Medical Diagnosis Engineering Team
Language: Python 3.12+
"""

import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.naive_bayes import MultinomialNB

try:
    from ml.config import config
    from ml.preprocessing import MedicalTextPreprocessor
    from ml.feature_engineering import SymptomFeatureExtractor
    from ml.utils import save_artifact, save_json
except ImportError as e:
    if getattr(e, 'name', None) == 'ml':
        from config import config
        from preprocessing import MedicalTextPreprocessor
        from feature_engineering import SymptomFeatureExtractor
        from utils import save_artifact, save_json
    else:
        raise

def run_quick_fit():
    print("Starting rapid model artifact fitting...")
    config.ensure_directories_exist()
    
    # Load dataset
    df = pd.read_csv(config.FINAL_SYMPTOMS_PATH)
    disease_col = "diseases" if "diseases" in df.columns else "disease"
    symptom_col = "symptom_text" if "symptom_text" in df.columns else "symptoms"
    
    df = df.dropna(subset=[disease_col, symptom_col]).drop_duplicates().reset_index(drop=True)
    
    # Preprocess
    preprocessor = MedicalTextPreprocessor(lemmatize=True)
    df["cleaned_symptoms"] = preprocessor.transform_batch(df[symptom_col])
    df = df[df["cleaned_symptoms"].str.strip() != ""].reset_index(drop=True)
    
    # Encode Target Labels
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(df[disease_col])
    
    # Extract TF-IDF
    extractor = SymptomFeatureExtractor(method="tfidf", max_features=config.TFIDF_MAX_FEATURES)
    X = extractor.fit_transform(df["cleaned_symptoms"])
    
    # Fit Fast Classifier
    model = MultinomialNB(alpha=0.1)
    model.fit(X, y)
    
    acc = float(model.score(X, y))
    print(f"Model fitted successfully! Sample count: {len(df)}, Classes: {len(label_encoder.classes_)}, Accuracy: {acc*100:.2f}%")
    
    # Save artifacts
    save_artifact(model, config.MODEL_PATH, "Trained Model")
    save_artifact(extractor.vectorizer, config.VECTORIZER_PATH, "TF-IDF Vectorizer")
    save_artifact(label_encoder, config.LABEL_ENCODER_PATH, "Label Encoder")
    
    metadata = {
        "best_model_name": "Multinomial Naive Bayes",
        "num_classes": len(label_encoder.classes_),
        "classes": label_encoder.classes_.tolist(),
        "train_accuracy": acc,
        "feature_count": extractor.vectorizer.max_features,
        "random_seed": config.RANDOM_SEED
    }
    save_json(metadata, config.CONFIG_JSON_PATH)
    print("All production model artifacts successfully saved!")

if __name__ == "__main__":
    run_quick_fit()
