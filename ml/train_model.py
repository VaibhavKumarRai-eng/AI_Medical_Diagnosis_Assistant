"""
Model Building and Training Pipeline for Enterprise AI Medical Diagnosis Assistant.

This module loads symptom text data, extracts TF-IDF features, encodes target disease labels,
trains and compares 6 machine learning models using Stratified K-Fold Cross Validation,
performs GridSearchCV hyperparameter tuning on the top architecture, and serializes
production artifacts (model.pkl, vectorizer.pkl, label_encoder.pkl, config.json).

Author: AI Medical Diagnosis Engineering Team
Language: Python 3.12+
Style Standard: PEP8, Type Hints, Structured Logging
"""

import os
import time
import logging
from typing import Dict, Any, Tuple, Optional, List
import pandas as pd
import numpy as np

from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import StratifiedKFold, cross_validate, GridSearchCV, train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier

try:
    from ml.config import config
    from ml.logger import get_logger, log_training_event, log_artifact_event
    from ml.preprocessing import MedicalTextPreprocessor
    from ml.feature_engineering import SymptomFeatureExtractor
    from ml.utils import save_artifact, save_json, format_metrics_table
except ImportError:
    from config import config
    from logger import get_logger, log_training_event, log_artifact_event
    from preprocessing import MedicalTextPreprocessor
    from feature_engineering import SymptomFeatureExtractor
    from utils import save_artifact, save_json, format_metrics_table

logger = get_logger(__name__)


class DiseaseModelTrainer:
    """Production Model Training and Hyperparameter Tuning Pipeline for Disease Prediction."""

    def __init__(self, random_state: int = config.RANDOM_SEED) -> None:
        """Initialize models and candidate hyperparameter grids."""
        self.random_state = random_state
        self.preprocessor = MedicalTextPreprocessor(lemmatize=True)
        self.feature_extractor: Optional[SymptomFeatureExtractor] = None
        self.label_encoder = LabelEncoder()
        self.best_model: Optional[Any] = None
        self.best_model_name: str = ""

        # Model zoo initialization
        self.models: Dict[str, Any] = {
            "Logistic Regression": LogisticRegression(
                max_iter=500, random_state=self.random_state, class_weight="balanced"
            ),
            "Naive Bayes": MultinomialNB(),
            "Random Forest": RandomForestClassifier(
                n_estimators=100, random_state=self.random_state, class_weight="balanced", n_jobs=-1
            ),
            "Decision Tree": DecisionTreeClassifier(
                random_state=self.random_state, class_weight="balanced"
            ),
            "Support Vector Machine": SVC(
                probability=True, random_state=self.random_state, class_weight="balanced"
            ),
            "XGBoost": XGBClassifier(
                eval_metric="mlogloss", random_state=self.random_state, n_jobs=-1
            )
        }

    def load_and_preprocess_dataset(
        self,
        filepath: Optional[str] = None
    ) -> pd.DataFrame:
        """Load data from CSV, validate schema, and clean symptom text if necessary.
        
        Args:
            filepath (Optional[str]): Source CSV path. Defaults to config.FINAL_SYMPTOMS_PATH.
            
        Returns:
            pd.DataFrame: DataFrame containing 'diseases' and 'symptom_text'.
        """
        target_path = filepath or config.FINAL_SYMPTOMS_PATH
        if not os.path.exists(target_path):
            # Fallback to cleaned_dataset.csv or raw data.csv
            if os.path.exists(config.CLEANED_DATA_PATH):
                target_path = config.CLEANED_DATA_PATH
            else:
                raise FileNotFoundError(f"Dataset file not found at '{target_path}'.")

        logger.info(f"Loading dataset from '{target_path}'...")
        df = pd.read_csv(target_path)

        # Validate required columns
        disease_col = "diseases" if "diseases" in df.columns else "disease"
        symptom_col = "symptom_text" if "symptom_text" in df.columns else "symptoms"

        if disease_col not in df.columns or symptom_col not in df.columns:
            raise KeyError(f"Expected dataset columns '{disease_col}' and '{symptom_col}'. Found: {df.columns.tolist()}")

        # Drop missing values
        initial_len = len(df)
        df = df.dropna(subset=[disease_col, symptom_col]).copy()
        df = df.drop_duplicates().reset_index(drop=True)
        logger.info(f"Dataset loaded. Initial rows: {initial_len}, Cleaned rows: {len(df)}, Unique diseases: {df[disease_col].nunique()}")

        # Ensure symptom text is preprocessed
        logger.info("Preprocessing symptom text documents...")
        df["cleaned_symptoms"] = self.preprocessor.transform_batch(df[symptom_col])
        
        # Remove any empty strings after preprocessing
        df = df[df["cleaned_symptoms"].str.strip() != ""].reset_index(drop=True)
        return df

    def evaluate_all_models(
        self,
        X: Any,
        y: np.ndarray,
        n_splits: int = config.N_SPLITS
    ) -> Dict[str, Dict[str, float]]:
        """Perform Stratified K-Fold Cross Validation across all 6 models.
        
        Args:
            X (Any): TF-IDF feature matrix.
            y (np.ndarray): Target encoded labels.
            n_splits (int): Number of Stratified CV folds.
            
        Returns:
            Dict[str, Dict[str, float]]: Metric results summary dictionary.
        """
        logger.info(f"Starting {n_splits}-Fold Stratified Cross Validation benchmark across {len(self.models)} models...")
        cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=self.random_state)
        scoring = ["accuracy", "precision_weighted", "recall_weighted", "f1_weighted"]

        results = {}
        for name, model in self.models.items():
            start_time = time.time()
            log_training_event(logger, name, "STARTED")
            
            try:
                cv_results = cross_validate(
                    model, X, y, cv=cv, scoring=scoring, n_jobs=-1, error_score="raise"
                )
                elapsed = time.time() - start_time
                
                metrics = {
                    "accuracy": float(np.mean(cv_results["test_accuracy"])),
                    "precision": float(np.mean(cv_results["test_precision_weighted"])),
                    "recall": float(np.mean(cv_results["test_recall_weighted"])),
                    "f1_score": float(np.mean(cv_results["test_f1_weighted"])),
                    "fit_time_sec": float(np.mean(cv_results["fit_time"]))
                }
                results[name] = metrics
                log_training_event(logger, name, "COMPLETED", elapsed, metrics)
            except Exception as e:
                logger.error(f"Cross-validation failed for model '{name}': {e}", exc_info=True)
                log_training_event(logger, name, "FAILED")

        # Select top architecture based on F1-score
        self.best_model_name = max(results, key=lambda k: results[k]["f1_score"])
        logger.info(
            f"Cross Validation Benchmark Complete!\nTop Model Selected: '{self.best_model_name}' "
            f"(F1 Score: {results[self.best_model_name]['f1_score']:.4f})"
        )
        return results

    def tune_hyperparameters(
        self,
        X_train: Any,
        y_train: np.ndarray,
        model_name: str
    ) -> Any:
        """Perform GridSearchCV hyperparameter tuning on the selected top model.
        
        Args:
            X_train (Any): Feature matrix.
            y_train (np.ndarray): Training labels.
            model_name (str): Name of model to tune.
            
        Returns:
            Any: Tuned best estimator.
        """
        param_grid = config.PARAM_GRIDS.get(model_name, {})
        base_model = self.models[model_name]

        if not param_grid:
            logger.info(f"No hyperparameter grid defined for '{model_name}'. Training base estimator.")
            base_model.fit(X_train, y_train)
            return base_model

        logger.info(f"Executing GridSearchCV tuning for '{model_name}' with grid: {param_grid}...")
        cv = StratifiedKFold(n_splits=config.N_SPLITS, shuffle=True, random_state=self.random_state)
        
        grid_search = GridSearchCV(
            estimator=base_model,
            param_grid=param_grid,
            cv=cv,
            scoring="f1_weighted",
            n_jobs=-1,
            verbose=1
        )
        
        start_time = time.time()
        grid_search.fit(X_train, y_train)
        elapsed = time.time() - start_time

        logger.info(
            f"Hyperparameter tuning completed in {elapsed:.2f}s.\n"
            f"Best Parameters: {grid_search.best_params_}\n"
            f"Best CV F1-Score: {grid_search.best_score_:.4f}"
        )
        return grid_search.best_estimator_

    def train_pipeline(
        self,
        dataset_path: Optional[str] = None,
        perform_tuning: bool = True
    ) -> Dict[str, Any]:
        """Execute full production training pipeline.
        
        Args:
            dataset_path (Optional[str]): Path to symptom CSV file.
            perform_tuning (bool): Whether to execute GridSearchCV hyperparameter tuning.
            
        Returns:
            Dict[str, Any]: Training pipeline summary dictionary.
        """
        logger.info("Initializing Disease Diagnosis Model Training Pipeline...")
        config.ensure_directories_exist()

        # 1. Load and preprocess dataset
        df = self.load_and_preprocess_dataset(dataset_path)
        disease_col = "diseases" if "diseases" in df.columns else "disease"

        # 2. Encode target disease labels
        logger.info("Encoding target disease classes...")
        y = self.label_encoder.fit_transform(df[disease_col])
        num_classes = len(self.label_encoder.classes_)
        logger.info(f"Encoded {num_classes} distinct disease categories.")

        # 3. Extract TF-IDF Features
        logger.info("Extracting TF-IDF text features...")
        self.feature_extractor = SymptomFeatureExtractor(
            method="tfidf",
            max_features=config.TFIDF_MAX_FEATURES,
            ngram_range=config.TFIDF_NGRAM_RANGE,
            min_df=config.TFIDF_MIN_DF,
            max_df=config.TFIDF_MAX_DF,
            sublinear_tf=config.TFIDF_SUBLINEAR_TF
        )
        X = self.feature_extractor.fit_transform(df["cleaned_symptoms"])

        # 4. Train/Test Split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=config.TEST_SIZE, random_state=self.random_state, stratify=y
        )

        # 5. Multi-Model Benchmark CV Evaluation
        benchmark_results = self.evaluate_all_models(X_train, y_train)
        metrics_table = format_metrics_table(benchmark_results)
        logger.info(f"\nModel Benchmark Results:\n{metrics_table.to_string()}\n")

        # 6. Hyperparameter Tuning on Best Model
        if perform_tuning:
            logger.info(f"Tuning hyperparameter search grid for best candidate '{self.best_model_name}'...")
            self.best_model = self.tune_hyperparameters(X_train, y_train, self.best_model_name)
        else:
            self.best_model = self.models[self.best_model_name]
            self.best_model.fit(X_train, y_train)

        # Final Evaluation on Held-Out Test Set
        final_acc = float(self.best_model.score(X_test, y_test))
        logger.info(f"Final Model Test Accuracy: {final_acc * 100:.2f}%")

        # 7. Save Production Artifacts (model.pkl, vectorizer.pkl, label_encoder.pkl, config.json)
        logger.info("Saving production model artifacts...")
        save_artifact(self.best_model, config.MODEL_PATH, "Trained Model")
        save_artifact(self.feature_extractor.vectorizer, config.VECTORIZER_PATH, "TF-IDF Vectorizer")
        save_artifact(self.label_encoder, config.LABEL_ENCODER_PATH, "Label Encoder")

        metadata = {
            "best_model_name": self.best_model_name,
            "num_classes": num_classes,
            "classes": self.label_encoder.classes_.tolist(),
            "test_accuracy": final_acc,
            "feature_count": self.feature_extractor.vectorizer.max_features,
            "random_seed": config.RANDOM_SEED,
            "benchmark_results": benchmark_results
        }
        save_json(metadata, config.CONFIG_JSON_PATH)

        logger.info("Disease Model Training Pipeline execution completed successfully!")
        return metadata


if __name__ == "__main__":
    logger.info("Executing DiseaseModelTrainer CLI pipeline...")
    trainer = DiseaseModelTrainer()
    trainer.train_pipeline(perform_tuning=False)  # Quick benchmark mode for verification
