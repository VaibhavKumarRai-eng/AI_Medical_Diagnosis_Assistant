"""
Central Configuration Module for Enterprise AI Medical Diagnosis Assistant.

This module defines all environment paths, data directory configurations, random seeds,
feature vectorization settings, and hyperparameter tuning search spaces.

Author: AI Medical Diagnosis Engineering Team
Language: Python 3.12+
Style Standard: PEP8, Dataclass Type Annotations
"""

import os
from dataclasses import dataclass, field
from typing import Dict, Any, Tuple


@dataclass(frozen=True)
class Config:
    """Centralized Configuration dataclass for the Medical Assistant ML Pipeline."""

    # Project Root Directory
    PROJECT_ROOT: str = field(
        default_factory=lambda: os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..")
        )
    )

    # Data Directories & File Paths
    DATA_DIR: str = field(
        default_factory=lambda: os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "dataset")
        )
    )
    RAW_DATA_PATH: str = field(
        default_factory=lambda: os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "dataset", "data.csv")
        )
    )
    FINAL_SYMPTOMS_PATH: str = field(
        default_factory=lambda: os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "dataset", "final_symptoms_to_disease.csv")
        )
    )
    CLEANED_DATA_PATH: str = field(
        default_factory=lambda: os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "dataset", "cleaned_dataset.csv")
        )
    )

    # Output Artifact Directories
    MODEL_DIR: str = field(
        default_factory=lambda: os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "models")
        )
    )
    MODEL_PATH: str = field(
        default_factory=lambda: os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "models", "model.pkl")
        )
    )
    VECTORIZER_PATH: str = field(
        default_factory=lambda: os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "models", "vectorizer.pkl")
        )
    )
    LABEL_ENCODER_PATH: str = field(
        default_factory=lambda: os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "models", "label_encoder.pkl")
        )
    )
    CONFIG_JSON_PATH: str = field(
        default_factory=lambda: os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "models", "config.json")
        )
    )

    # Reports & Logging Directories
    REPORTS_DIR: str = field(
        default_factory=lambda: os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "reports")
        )
    )
    LOG_DIR: str = field(
        default_factory=lambda: os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "logs")
        )
    )
    LOG_FILE_PATH: str = field(
        default_factory=lambda: os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "logs", "medical_assistant.log")
        )
    )

    # Training & Reproducibility Parameters
    RANDOM_SEED: int = 42
    TEST_SIZE: float = 0.2
    N_SPLITS: int = 5

    # Feature Vectorization (TF-IDF) Parameters
    TFIDF_MAX_FEATURES: int = 5000
    TFIDF_NGRAM_RANGE: Tuple[int, int] = (1, 2)
    TFIDF_MIN_DF: int = 2
    TFIDF_MAX_DF: float = 0.95
    TFIDF_SUBLINEAR_TF: bool = True

    # Hyperparameter Search Grids for Model Selection
    PARAM_GRIDS: Dict[str, Dict[str, Any]] = field(
        default_factory=lambda: {
            "Logistic Regression": {
                "C": [0.1, 1.0, 10.0],
                "penalty": ["l2"],
                "solver": ["lbfgs"],
                "max_iter": [500]
            },
            "Naive Bayes": {
                "alpha": [0.01, 0.1, 0.5, 1.0]
            },
            "Random Forest": {
                "n_estimators": [100, 200],
                "max_depth": [10, 20, None],
                "min_samples_split": [2, 5]
            },
            "Decision Tree": {
                "max_depth": [10, 20, None],
                "criterion": ["gini", "entropy"]
            },
            "Support Vector Machine": {
                "C": [0.1, 1.0, 10.0],
                "kernel": ["linear", "rbf"],
                "probability": [True]
            },
            "XGBoost": {
                "n_estimators": [100, 200],
                "max_depth": [3, 6],
                "learning_rate": [0.01, 0.1]
            }
        }
    )

    def ensure_directories_exist(self) -> None:
        """Create output directories if they do not exist."""
        for directory in [self.MODEL_DIR, self.REPORTS_DIR, self.LOG_DIR]:
            os.makedirs(directory, exist_ok=True)


# Global Config Singleton
config = Config()


if __name__ == "__main__":
    config.ensure_directories_exist()
    print("="*60)
    print("MEDICAL DIAGNOSIS ASSISTANT CONFIGURATION:")
    print(f"Project Root    : {config.PROJECT_ROOT}")
    print(f"Raw Data Path   : {config.RAW_DATA_PATH}")
    print(f"Clean Data Path : {config.CLEANED_DATA_PATH}")
    print(f"Model Path      : {config.MODEL_PATH}")
    print(f"Random Seed     : {config.RANDOM_SEED}")
    print(f"TF-IDF Features : {config.TFIDF_MAX_FEATURES}")
    print("="*60)
