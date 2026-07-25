"""
Model Evaluation and Visualization Module for AI Medical Diagnosis Assistant.

This module computes performance metrics (Accuracy, Precision, Recall, F1 Score, ROC AUC)
and generates publication-ready visualization charts (Confusion Matrix, Model Comparison,
Feature Importance, Learning Curves) saved to the reports directory.

Author: AI Medical Diagnosis Engineering Team
Language: Python 3.12+
Style Standard: PEP8, Type Hints, Matplotlib & Seaborn Styling
"""

import os
import logging
from typing import Dict, Any, List, Optional, Tuple, Union
import numpy as np
import pandas as pd

import matplotlib
matplotlib.use('Agg')  # Headless backend for production servers
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)
from sklearn.model_selection import learning_curve

try:
    from ml.config import config
    from ml.logger import get_logger
except ImportError:
    from config import config
    from logger import get_logger

logger = get_logger(__name__)

# Apply modern aesthetic design theme
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
sns.set_palette("muted")


class ModelEvaluator:
    """Production Model Evaluation suite for clinical disease prediction models."""

    def __init__(self, output_dir: str = config.REPORTS_DIR) -> None:
        """Initialize ModelEvaluator with target reports directory."""
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        logger.info(f"Initialized ModelEvaluator with output directory '{self.output_dir}'")

    def compute_metrics(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        y_prob: Optional[np.ndarray] = None,
        average: str = "weighted"
    ) -> Dict[str, float]:
        """Compute core classification metrics.
        
        Args:
            y_true (np.ndarray): True target labels.
            y_pred (np.ndarray): Predicted target labels.
            y_prob (Optional[np.ndarray]): Predicted class probability matrix.
            average (str): Averaging method for multi-class ('weighted', 'macro').
            
        Returns:
            Dict[str, float]: Metrics dictionary.
        """
        metrics = {
            "accuracy": float(accuracy_score(y_true, y_pred)),
            "precision": float(precision_score(y_true, y_pred, average=average, zero_division=0)),
            "recall": float(recall_score(y_true, y_pred, average=average, zero_division=0)),
            "f1_score": float(f1_score(y_true, y_pred, average=average, zero_division=0))
        }

        # Calculate multi-class ROC AUC if probability matrix is supplied
        if y_prob is not None:
            try:
                metrics["roc_auc"] = float(roc_auc_score(y_true, y_prob, multi_class="ovr", average="macro"))
            except Exception as e:
                logger.warning(f"ROC AUC calculation skipped: {e}")
                metrics["roc_auc"] = 0.0

        return metrics

    def generate_classification_report_df(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        target_names: Optional[List[str]] = None
    ) -> pd.DataFrame:
        """Generate classification report formatted as pandas DataFrame.
        
        Args:
            y_true (np.ndarray): Ground truth labels.
            y_pred (np.ndarray): Predictions.
            target_names (Optional[List[str]]): Disease class labels.
            
        Returns:
            pd.DataFrame: Structured classification report dataframe.
        """
        report_dict = classification_report(
            y_true, y_pred, target_names=target_names, output_dict=True, zero_division=0
        )
        return pd.DataFrame(report_dict).transpose()

    def plot_confusion_matrix(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        class_names: List[str],
        top_n: int = 20,
        filename: str = "confusion_matrix.png"
    ) -> str:
        """Plot and save confusion matrix heatmap focusing on top N frequent classes.
        
        Args:
            y_true (np.ndarray): True labels.
            y_pred (np.ndarray): Predicted labels.
            class_names (List[str]): Full list of target class labels.
            top_n (int): Max classes to display in plot for visual clarity.
            filename (str): Output plot image filename.
            
        Returns:
            str: Saved image file path.
        """
        # Determine top N most frequent ground truth classes
        unique, counts = np.unique(y_true, return_counts=True)
        top_indices = unique[np.argsort(-counts)[:top_n]]
        
        # Mask inputs for top N classes
        mask = np.isin(y_true, top_indices)
        filtered_true = y_true[mask]
        filtered_pred = y_pred[mask]
        
        top_labels = [class_names[i] for i in top_indices]
        cm = confusion_matrix(filtered_true, filtered_pred, labels=top_indices)

        fig, ax = plt.subplots(figsize=(12, 10))
        sns.heatmap(
            cm,
            annot=True,
            fmt="d",
            cmap="Blues",
            xticklabels=top_labels,
            yticklabels=top_labels,
            ax=ax,
            cbar_kws={'label': 'Sample Count'}
        )
        
        ax.set_title(f"Confusion Matrix (Top {top_n} Diseases)", fontsize=14, fontweight="bold", pad=15)
        ax.set_xlabel("Predicted Disease Label", fontsize=12, labelpad=10)
        ax.set_ylabel("True Disease Label", fontsize=12, labelpad=10)
        plt.xticks(rotation=45, ha="right", fontsize=9)
        plt.yticks(rotation=0, fontsize=9)
        plt.tight_layout()

        save_path = os.path.join(self.output_dir, filename)
        plt.savefig(save_path, dpi=300)
        plt.close()
        logger.info(f"Saved confusion matrix plot to '{save_path}'")
        return save_path

    def plot_model_comparison(
        self,
        results_dict: Dict[str, Dict[str, float]],
        filename: str = "model_comparison.png"
    ) -> str:
        """Generate side-by-side comparative bar chart for multiple models.
        
        Args:
            results_dict (Dict[str, Dict[str, float]]): Mapping model names to metrics.
            filename (str): Output filename.
            
        Returns:
            str: Saved image file path.
        """
        df = pd.DataFrame.from_dict(results_dict, orient="index").reset_index()
        df = df.rename(columns={"index": "Model"})
        
        melted_df = pd.melt(
            df, id_vars=["Model"], value_vars=["accuracy", "precision", "recall", "f1_score"],
            var_name="Metric", value_name="Score"
        )
        melted_df["Metric"] = melted_df["Metric"].str.title()

        fig, ax = plt.subplots(figsize=(14, 7))
        sns.barplot(
            data=melted_df,
            x="Model",
            y="Score",
            hue="Metric",
            palette="viridis",
            ax=ax
        )

        ax.set_title("Machine Learning Model Performance Comparison", fontsize=16, fontweight="bold", pad=15)
        ax.set_ylabel("Score (0.0 - 1.0)", fontsize=12)
        ax.set_ylim(0.0, 1.05)
        plt.xticks(rotation=25, ha="right", fontsize=11)
        plt.legend(title="Metrics", loc="lower right")
        plt.tight_layout()

        save_path = os.path.join(self.output_dir, filename)
        plt.savefig(save_path, dpi=300)
        plt.close()
        logger.info(f"Saved model comparison plot to '{save_path}'")
        return save_path

    def plot_feature_importance(
        self,
        model: Any,
        feature_names: List[str],
        top_n: int = 20,
        filename: str = "feature_importance.png"
    ) -> Optional[str]:
        """Extract and plot top important symptom features from fitted model.
        
        Args:
            model (Any): Fitted scikit-learn estimator.
            feature_names (List[str]): List of feature token names.
            top_n (int): Number of top features to plot.
            filename (str): Output image filename.
            
        Returns:
            Optional[str]: Image path if feature importances exist, else None.
        """
        importances = None
        if hasattr(model, "feature_importances_"):
            importances = model.feature_importances_
        elif hasattr(model, "coef_"):
            # Average coefficients across classes for multi-class linear models
            importances = np.mean(np.abs(model.coef_), axis=0)

        if importances is None:
            logger.warning(f"Model '{type(model).__name__}' does not expose feature importances.")
            return None

        top_indices = np.argsort(importances)[-top_n:]
        top_features = [feature_names[i] for i in top_indices]
        top_scores = importances[top_indices]

        fig, ax = plt.subplots(figsize=(10, 8))
        ax.barh(range(top_n), top_scores, color="#2b5c8f", align="center")
        ax.set_yticks(range(top_n))
        ax.set_yticklabels(top_features, fontsize=10)
        ax.set_xlabel("Relative Feature Importance Score", fontsize=12)
        ax.set_title(f"Top {top_n} Diagnostic Symptom Features", fontsize=14, fontweight="bold", pad=15)
        plt.tight_layout()

        save_path = os.path.join(self.output_dir, filename)
        plt.savefig(save_path, dpi=300)
        plt.close()
        logger.info(f"Saved feature importance plot to '{save_path}'")
        return save_path

    def plot_learning_curve(
        self,
        estimator: Any,
        X: Any,
        y: np.ndarray,
        cv_splits: int = 3,
        filename: str = "learning_curve.png"
    ) -> str:
        """Generate and plot learning curves showing score vs training sample size.
        
        Args:
            estimator (Any): Classifier estimator.
            X (Any): Feature matrix.
            y (np.ndarray): Target vector.
            cv_splits (int): Cross-validation folds.
            filename (str): Image filename.
            
        Returns:
            str: Saved image path.
        """
        train_sizes, train_scores, test_scores = learning_curve(
            estimator, X, y, cv=cv_splits, n_jobs=-1,
            train_sizes=np.linspace(0.1, 1.0, 5), scoring="f1_weighted"
        )

        train_mean = np.mean(train_scores, axis=1)
        train_std = np.std(train_scores, axis=1)
        test_mean = np.mean(test_scores, axis=1)
        test_std = np.std(test_scores, axis=1)

        fig, ax = plt.subplots(figsize=(10, 6))
        ax.plot(train_sizes, train_mean, 'o-', color='#e74c3c', label='Training F1 Score')
        ax.plot(train_sizes, test_mean, 'o-', color='#2ecc71', label='Validation F1 Score')

        ax.fill_between(train_sizes, train_mean - train_std, train_mean + train_std, alpha=0.15, color='#e74c3c')
        ax.fill_between(train_sizes, test_mean - test_std, test_mean + test_std, alpha=0.15, color='#2ecc71')

        ax.set_title("Model Learning Curve (F1 Score vs. Dataset Size)", fontsize=14, fontweight="bold", pad=15)
        ax.set_xlabel("Training Dataset Sample Count", fontsize=12)
        ax.set_ylabel("Weighted F1 Score", fontsize=12)
        ax.legend(loc="best")
        plt.tight_layout()

        save_path = os.path.join(self.output_dir, filename)
        plt.savefig(save_path, dpi=300)
        plt.close()
        logger.info(f"Saved learning curve plot to '{save_path}'")
        return save_path


if __name__ == "__main__":
    logger.info("Executing ModelEvaluator smoke test...")
    evaluator = ModelEvaluator()
    
    # Synthetic smoke test data
    y_true = np.array([0, 1, 2, 0, 1, 2, 0, 1, 2])
    y_pred = np.array([0, 1, 2, 0, 1, 1, 0, 1, 2])
    class_names = ["Disease A", "Disease B", "Disease C"]
    
    metrics = evaluator.compute_metrics(y_true, y_pred)
    cm_path = evaluator.plot_confusion_matrix(y_true, y_pred, class_names, top_n=3, filename="test_cm.png")
    
    mock_results = {
        "Logistic Regression": {"accuracy": 0.88, "precision": 0.89, "recall": 0.88, "f1_score": 0.88},
        "XGBoost": {"accuracy": 0.94, "precision": 0.95, "recall": 0.94, "f1_score": 0.94}
    }
    comp_path = evaluator.plot_model_comparison(mock_results, filename="test_comp.png")
    
    # Cleanup test images
    for p in [cm_path, comp_path]:
        if os.path.exists(p):
            os.remove(p)
            
    logger.info("ModelEvaluator smoke test completed successfully.")
