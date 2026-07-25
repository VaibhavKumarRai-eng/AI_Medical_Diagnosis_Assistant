# Enterprise AI Medical Diagnosis Assistant - ML Module

A production-ready, scalable, and modular disease prediction engine that accepts symptom descriptions in natural language and predicts the most probable medical conditions using Natural Language Processing (NLP) and Machine Learning (ML).

---

## Technical Stack & Dependencies

- **Language**: Python 3.12+
- **Data & Numeric Processing**: `pandas`, `numpy`, `scipy`
- **Machine Learning & Modeling**: `scikit-learn`, `xgboost`
- **Natural Language Processing**: `nltk`, `spacy`, `re`
- **Model Serialization**: `joblib`
- **Visualization & Reporting**: `matplotlib`, `seaborn`
- **Coding Standards**: PEP8, Explicit Type Hints, Docstrings, Structured Logging (`logging`), Exception Handling

---

## Architectural Pipeline

```mermaid
flowchart TD
    RawInput[Patient Symptom Free Text] --> Preproc[MedicalTextPreprocessor\n(ml/preprocessing.py)]
    Preproc --> CleanedText[Cleaned & Normalized Text]
    CleanedText --> FeatEng[SymptomFeatureExtractor\n(ml/feature_engineering.py)]
    FeatEng --> TFIDF[TF-IDF Feature Matrix]
    TFIDF --> Trainer[DiseaseModelTrainer\n(ml/train_model.py)]
    Trainer --> Models[6 Evaluated Classifiers:\nLogistic Regression, Naive Bayes,\nRandom Forest, Decision Tree, SVM, XGBoost]
    Models --> StratCV[5-Fold Stratified K-Fold CV]
    StratCV --> BestModel[Top Model + GridSearchCV Tuning]
    BestModel --> Artifacts[Artifact Persistence:\nmodels/model.pkl, vectorizer.pkl,\nlabel_encoder.pkl, config.json]
    Artifacts --> Engine[DiseasePredictor Inference Engine\n(ml/predict.py)]
    Engine --> Prediction[Top Predicted Disease,\nConfidence Score, Top 5 Candidates]
```

---

## Project Structure

```text
ml/
├── config.py             # Centralized configuration dataclass and hyperparameter grids
├── logger.py             # Enterprise logging setup (Console & 10MB Rotating File Handler)
├── utils.py              # Serialization helpers (joblib/json) and metric tables
├── preprocessing.py      # Production Clinical NLP text sanitization & negation engine
├── feature_engineering.py# TF-IDF & Bag-of-Words feature extraction pipeline
├── train_model.py        # Multi-model Stratified K-Fold CV training & GridSearchCV tuning
├── evaluation.py         # Evaluation metrics, confusion matrix, ROC AUC, & plot generation
├── predict.py            # High-performance production inference engine
└── README.md             # Technical module documentation
```

---

## Quick Start & Usage

### 1. Installation

Install the required Python dependencies:

```bash
pip install -r requirements.txt
```

### 2. Clinical Text Preprocessing (`ml/preprocessing.py`)

```python
from ml.preprocessing import MedicalTextPreprocessor

preprocessor = MedicalTextPreprocessor(lemmatize=True)
cleaned_symptoms = preprocessor.preprocess_text(
    "Patient presents with severe chest pain, shortness of breath, and no fever!"
)
print(cleaned_symptoms)
# Output: "patient present severe chest pain shortness breath no not_fever"
```

### 3. Feature Extraction (`ml/feature_engineering.py`)

```python
from ml.feature_engineering import SymptomFeatureExtractor

extractor = SymptomFeatureExtractor(method="tfidf", max_features=5000)
X_tfidf = extractor.fit_transform([cleaned_symptoms])
```

### 4. Model Training (`ml/train_model.py`)

Run end-to-end multi-model benchmarking and artifact generation:

```bash
python ml/train_model.py
```

### 5. Prediction Inference (`ml/predict.py`)

Run disease prediction on new natural language symptom descriptions:

```python
from ml.predict import predict_disease

result = predict_disease("Patient experiences high blood pressure, dizziness, and palpitations.")
print("Predicted Disease :", result["predicted_disease"])
print("Confidence Score  :", result["confidence_score"])
print("Top 5 Candidates  :", result["top_5_predictions"])
```

---

## Enterprise Production Features

1. **Medical Term Normalization**: Automatically converts clinical acronyms (`sob` $\rightarrow$ `shortness of breath`, `bp` $\rightarrow$ `blood pressure`).
2. **Clinical Negation Handling**: Appends `not_` prefixes to symptom tokens following negation words (`no fever` $\rightarrow$ `not_fever`) to ensure ML models accurately learn inverse symptom presence.
3. **Zero-Fail Pure-Python Fallbacks**: Resilient to environment constraints (such as OS DLL blocking policies) by maintaining pure-Python fallback tokenization and lemmatization routines.
4. **Structured MLOps Logging**: Logs latency (ms), prediction queries, training execution duration, and artifact loading events into `logs/medical_assistant.log`.
