"""
Feature Engineering & Vectorization Module for Enterprise AI Medical Diagnosis Assistant.

This module implements vectorization strategies (TF-IDF Vectorizer and Bag-of-Words CountVectorizer)
to transform clean medical symptom text into numerical feature matrices suitable for machine learning algorithms.

Author: AI Medical Diagnosis Engineering Team
Language: Python 3.12+
Style Standard: PEP8, Type Hints, Robust Exception Handling
"""

import os
import logging
from typing import List, Union, Dict, Any, Tuple, Optional
import pandas as pd
import numpy as np
import joblib
from scipy.sparse import csr_matrix
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer

# Setup module logger
logger = logging.getLogger(__name__)
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


class SymptomFeatureExtractor:
    """Production Feature Extractor for transforming medical text into numeric sparse matrices.
    
    Supports both TF-IDF (Term Frequency-Inverse Document Frequency) and 
    Bag-of-Words (CountVectorizer) algorithms with configurable n-grams and vocabulary limits.
    """

    def __init__(
        self,
        method: str = "tfidf",
        max_features: Optional[int] = 5000,
        ngram_range: Tuple[int, int] = (1, 2),
        min_df: int = 2,
        max_df: float = 0.95,
        sublinear_tf: bool = True
    ) -> None:
        """Initialize SymptomFeatureExtractor.
        
        Args:
            method (str): Vectorization technique ('tfidf' or 'bow').
            max_features (Optional[int]): Maximum number of top features to retain.
            ngram_range (Tuple[int, int]): Lower and upper boundary for n-gram extraction.
            min_df (int): Minimum document frequency for terms.
            max_df (float): Maximum document frequency proportion for terms.
            sublinear_tf (bool): Apply sublinear TF scaling (1 + log(tf)) for TF-IDF.
        """
        self.method = method.lower()
        self.max_features = max_features
        self.ngram_range = ngram_range
        self.min_df = min_df
        self.max_df = max_df
        self.sublinear_tf = sublinear_tf
        self.is_fitted = False

        if self.method == "tfidf":
            self.vectorizer = TfidfVectorizer(
                max_features=self.max_features,
                ngram_range=self.ngram_range,
                min_df=self.min_df,
                max_df=self.max_df,
                sublinear_tf=self.sublinear_tf,
                token_pattern=r'\b[a-zA-Z_]\w+\b'  # Preserve underscores (e.g. not_fever)
            )
        elif self.method in ["bow", "count"]:
            self.vectorizer = CountVectorizer(
                max_features=self.max_features,
                ngram_range=self.ngram_range,
                min_df=self.min_df,
                max_df=self.max_df,
                token_pattern=r'\b[a-zA-Z_]\w+\b'
            )
        else:
            raise ValueError(f"Unsupported feature extraction method: '{method}'. Choose 'tfidf' or 'bow'.")

        logger.info(
            f"Initialized SymptomFeatureExtractor (method={self.method}, "
            f"max_features={max_features}, ngram_range={ngram_range})"
        )

    def fit(self, raw_documents: Union[List[str], pd.Series]) -> "SymptomFeatureExtractor":
        """Fit the vectorizer on preprocessed text documents.
        
        Args:
            raw_documents (Union[List[str], pd.Series]): Corpus of preprocessed symptom strings.
            
        Returns:
            SymptomFeatureExtractor: Fitted extractor instance.
        """
        try:
            logger.info(f"Fitting {self.method.upper()} vectorizer on {len(raw_documents)} documents...")
            self.vectorizer.fit(raw_documents)
            self.is_fitted = True
            logger.info(f"Successfully fitted. Learned vocabulary size: {len(self.vectorizer.vocabulary_)}")
            return self
        except Exception as e:
            logger.error(f"Error during vectorizer fit: {e}", exc_info=True)
            raise

    def transform(self, raw_documents: Union[List[str], pd.Series]) -> csr_matrix:
        """Transform raw preprocessed text documents into sparse matrix representation.
        
        Args:
            raw_documents (Union[List[str], pd.Series]): Corpus of symptom strings.
            
        Returns:
            csr_matrix: Transformed sparse feature matrix.
        """
        if not self.is_fitted:
            raise RuntimeError("Vectorization model is not fitted yet. Call 'fit' or 'fit_transform' first.")

        try:
            matrix = self.vectorizer.transform(raw_documents)
            return matrix
        except Exception as e:
            logger.error(f"Error during vectorizer transform: {e}", exc_info=True)
            raise

    def fit_transform(self, raw_documents: Union[List[str], pd.Series]) -> csr_matrix:
        """Fit vectorizer and transform documents in a single optimized pass.
        
        Args:
            raw_documents (Union[List[str], pd.Series]): Corpus of symptom strings.
            
        Returns:
            csr_matrix: Transformed sparse feature matrix.
        """
        try:
            logger.info(f"Executing fit_transform with {self.method.upper()} vectorizer...")
            matrix = self.vectorizer.fit_transform(raw_documents)
            self.is_fitted = True
            logger.info(
                f"Completed fit_transform. Shape: {matrix.shape}, "
                f"Sparsity: {100.0 * (1 - matrix.nnz / np.prod(matrix.shape)):.2f}%"
            )
            return matrix
        except Exception as e:
            logger.error(f"Error during fit_transform: {e}", exc_info=True)
            raise

    def get_feature_names(self) -> List[str]:
        """Retrieve learned vocabulary feature names.
        
        Returns:
            List[str]: List of feature name strings.
        """
        if not self.is_fitted:
            raise RuntimeError("Vectorizer is not fitted. Cannot retrieve feature names.")
        return list(self.vectorizer.get_feature_names_out())

    @staticmethod
    def compare_representations(
        raw_documents: Union[List[str], pd.Series],
        max_features: int = 5000
    ) -> Dict[str, Dict[str, Any]]:
        """Compare Bag-of-Words vs. TF-IDF feature representations side-by-side.
        
        Args:
            raw_documents (Union[List[str], pd.Series]): Corpus of symptom documents.
            max_features (int): Vocabulary limit for comparison.
            
        Returns:
            Dict[str, Dict[str, Any]]: Summary dictionary comparing sparsity, shape, non-zero entries.
        """
        logger.info("Performing feature extraction comparison (Bag-of-Words vs. TF-IDF)...")
        
        bow_extractor = SymptomFeatureExtractor(method="bow", max_features=max_features)
        tfidf_extractor = SymptomFeatureExtractor(method="tfidf", max_features=max_features)

        bow_matrix = bow_extractor.fit_transform(raw_documents)
        tfidf_matrix = tfidf_extractor.fit_transform(raw_documents)

        bow_total_elements = np.prod(bow_matrix.shape)
        tfidf_total_elements = np.prod(tfidf_matrix.shape)

        results = {
            "bag_of_words": {
                "shape": bow_matrix.shape,
                "vocab_size": len(bow_extractor.get_feature_names()),
                "non_zero_elements": bow_matrix.nnz,
                "sparsity_percent": round(100.0 * (1 - bow_matrix.nnz / bow_total_elements), 2),
                "mean_value": round(float(np.mean(bow_matrix.data)), 4) if bow_matrix.nnz > 0 else 0.0
            },
            "tfidf": {
                "shape": tfidf_matrix.shape,
                "vocab_size": len(tfidf_extractor.get_feature_names()),
                "non_zero_elements": tfidf_matrix.nnz,
                "sparsity_percent": round(100.0 * (1 - tfidf_matrix.nnz / tfidf_total_elements), 2),
                "mean_value": round(float(np.mean(tfidf_matrix.data)), 4) if tfidf_matrix.nnz > 0 else 0.0
            }
        }
        
        logger.info(f"Feature Comparison Complete:\nBoW  : {results['bag_of_words']}\nTFIDF: {results['tfidf']}")
        return results

    def save(self, filepath: str) -> None:
        """Save the fitted vectorizer object to a file.
        
        Args:
            filepath (str): Destination file path (e.g., 'models/vectorizer.pkl').
        """
        if not self.is_fitted:
            raise RuntimeError("Cannot save an unfitted vectorizer.")
            
        try:
            os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
            joblib.dump(self.vectorizer, filepath)
            logger.info(f"Successfully saved vectorizer artifact to '{filepath}'.")
        except Exception as e:
            logger.error(f"Failed to save vectorizer to '{filepath}': {e}", exc_info=True)
            raise

    @classmethod
    def load(cls, filepath: str, method: str = "tfidf") -> "SymptomFeatureExtractor":
        """Load a saved vectorizer instance from a file.
        
        Args:
            filepath (str): Source pickle file path.
            method (str): Vectorizer method label ('tfidf' or 'bow').
            
        Returns:
            SymptomFeatureExtractor: Loaded and fitted extractor.
        """
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Vectorizer file not found at '{filepath}'.")

        try:
            vectorizer_obj = joblib.load(filepath)
            extractor = cls(method=method)
            extractor.vectorizer = vectorizer_obj
            extractor.is_fitted = True
            logger.info(f"Successfully loaded vectorizer artifact from '{filepath}'.")
            return extractor
        except Exception as e:
            logger.error(f"Failed to load vectorizer from '{filepath}': {e}", exc_info=True)
            raise


# Smoke test execution when run as main module
if __name__ == "__main__":
    logger.info("Executing SymptomFeatureExtractor smoke test...")
    
    sample_corpus = [
        "patient present hypertension sob severe headache vomit patient deny not_chest not_pain no not_fever",
        "dizziness insomnia palpitation shortness breath anxiety nervousness",
        "abnormal involuntary movement breathing fast depression insomnia",
        "chest pain dyspnea fever cough infection"
    ]
    
    # Compare representations
    comparison = SymptomFeatureExtractor.compare_representations(sample_corpus)
    
    # Test TF-IDF vectorization & persistence
    extractor = SymptomFeatureExtractor(method="tfidf", max_features=100)
    matrix = extractor.fit_transform(sample_corpus)
    
    test_filepath = os.path.join("models", "vectorizer_test.pkl")
    extractor.save(test_filepath)
    
    # Reload and transform single text
    loaded_extractor = SymptomFeatureExtractor.load(test_filepath)
    transformed = loaded_extractor.transform(["fever cough chest pain"])
    
    print("\n" + "="*60)
    print(f"SMOKE TEST FEATURE MATRIX SHAPE: {matrix.shape}")
    print(f"SAMPLE TRANSFORMED SHAPE       : {transformed.shape}")
    print(f"VOCABULARY PREVIEW (FIRST 5)   : {loaded_extractor.get_feature_names()[:5]}")
    print("="*60 + "\n")
    
    # Cleanup test file
    if os.path.exists(test_filepath):
        os.remove(test_filepath)
        
    logger.info("SymptomFeatureExtractor smoke test completed successfully.")
