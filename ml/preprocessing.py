"""
Medical Text Preprocessing Module for Enterprise AI Medical Diagnosis Assistant.

This module provides a production-grade, scalable NLP preprocessing pipeline
tailored for clinical and patient-reported symptom descriptions. It performs
text sanitization, contraction expansion, medical term normalization, negation
handling, tokenization, stopword filtering, and lemmatization.

Author: AI Medical Diagnosis Engineering Team
Language: Python 3.12+
Style Standard: PEP8, Type Hints, Robust Fallbacks
"""

import os
import re
import logging
from typing import List, Union, Optional, Set
import pandas as pd

# Setup module logger
logger = logging.getLogger(__name__)
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

# Robust NLTK import with graceful pure-python fallback
NLTK_AVAILABLE = False
try:
    import nltk
    from nltk.corpus import stopwords, wordnet
    from nltk.stem import WordNetLemmatizer, PorterStemmer, SnowballStemmer
    from nltk.tokenize import word_tokenize

    def _download_nltk_resources() -> None:
        """Download required NLTK data resources if not present."""
        resources = ['punkt', 'stopwords', 'wordnet', 'omw-1.4']
        for resource in resources:
            try:
                nltk.data.find(f'tokenizers/{resource}' if resource == 'punkt' else f'corpora/{resource}')
            except Exception:
                nltk.download(resource, quiet=True)

    _download_nltk_resources()
    NLTK_AVAILABLE = True
    logger.info("NLTK successfully initialized.")
except Exception as err:
    logger.warning(f"NLTK initialization failed ({err}). Operating with built-in pure-Python NLP fallback.")
    NLTK_AVAILABLE = False


# Pure Python Fallback Stopwords
DEFAULT_ENGLISH_STOPWORDS: Set[str] = {
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've",
    "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his',
    'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's", 'its', 'itself',
    'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom',
    'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a',
    'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at',
    'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on',
    'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
    'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
    'some', 'such', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can',
    'will', 'just', 'should', 'now'
}


class MedicalTextPreprocessor:
    """Production NLP Preprocessing pipeline for medical symptom text.
    
    Attributes:
        lemmatize (bool): Whether to perform lemmatization.
        use_stemming (bool): Whether to perform stemming.
        custom_stopwords (Optional[List[str]]): Additional stopwords to remove.
    """

    # Comprehensive contraction dictionary
    CONTRACTION_MAP = {
        "can't": "cannot",
        "won't": "will not",
        "don't": "do not",
        "doesn't": "does not",
        "didn't": "did not",
        "haven't": "have not",
        "hasn't": "has not",
        "hadn't": "had not",
        "isn't": "is not",
        "aren't": "are not",
        "wasn't": "was not",
        "weren't": "were not",
        "couldn't": "could not",
        "shouldn't": "should not",
        "wouldn't": "would not",
        "patient's": "patient",
        "patients'": "patients",
        "it's": "it is",
        "that's": "that is",
        "there's": "there is",
        "what's": "what is",
        "who's": "who is",
        "i'm": "i am",
        "you're": "you are",
        "he's": "he is",
        "she's": "she is",
        "we're": "we are",
        "they're": "they are"
    }

    # Common medical term & abbreviation normalizations
    MEDICAL_TERM_MAP = {
        "sob": "shortness of breath",
        "hr": "heart rate",
        "bp": "blood pressure",
        "temp": "temperature",
        "n/v": "nausea vomiting",
        "gi": "gastrointestinal",
        "uri": "upper respiratory infection",
        "uti": "urinary tract infection",
        "abdo": "abdominal",
        "abdom": "abdominal",
        "palp": "palpitations",
        "head ache": "headache",
        "chest pain": "chest pain",
        "short breath": "shortness of breath",
        "stomach ache": "stomachache",
        "high bp": "hypertension",
        "low bp": "hypotension",
        "high sugar": "hyperglycemia",
        "low sugar": "hypoglycemia"
    }

    # Negation words preserved for medical context
    NEGATION_WORDS = {"no", "not", "nor", "neither", "never", "without", "denies", "absent"}

    def __init__(
        self,
        lemmatize: bool = True,
        use_stemming: bool = False,
        stemmer_type: str = "snowball",
        custom_stopwords: Optional[List[str]] = None
    ) -> None:
        """Initialize the MedicalTextPreprocessor with configurable components."""
        self.lemmatize = lemmatize
        self.use_stemming = use_stemming
        self.stemmer_type = stemmer_type.lower()
        
        # Build stopword list excluding negation words
        if NLTK_AVAILABLE:
            try:
                base_stopwords = set(stopwords.words('english'))
            except Exception:
                base_stopwords = DEFAULT_ENGLISH_STOPWORDS.copy()
        else:
            base_stopwords = DEFAULT_ENGLISH_STOPWORDS.copy()

        self.stopwords = base_stopwords - self.NEGATION_WORDS
        if custom_stopwords:
            self.stopwords.update(custom_stopwords)

        # Setup NLTK processors if available
        if NLTK_AVAILABLE:
            try:
                self.lemmatizer = WordNetLemmatizer()
                if self.stemmer_type == "porter":
                    self.stemmer = PorterStemmer()
                else:
                    self.stemmer = SnowballStemmer("english")
            except Exception as e:
                logger.warning(f"Error setting up NLTK processors: {e}. Reverting to basic NLP.")
                self.lemmatizer = None
                self.stemmer = None
        else:
            self.lemmatizer = None
            self.stemmer = None

        logger.info(
            f"Initialized MedicalTextPreprocessor (lemmatize={lemmatize}, "
            f"use_stemming={use_stemming}, nltk_active={NLTK_AVAILABLE})"
        )

    def expand_contractions(self, text: str) -> str:
        """Expand standard English contractions in text.
        
        Args:
            text (str): Input text string.
            
        Returns:
            str: Text with expanded contractions.
        """
        pattern = re.compile(r'\b(' + '|'.join(re.escape(k) for k in self.CONTRACTION_MAP.keys()) + r')\b', re.IGNORECASE)
        def replace(match):
            word = match.group(0).lower()
            return self.CONTRACTION_MAP.get(word, word)
        return pattern.sub(replace, text)

    def normalize_medical_terms(self, text: str) -> str:
        """Normalize common medical acronyms and symptom phrases.
        
        Args:
            text (str): Input text string.
            
        Returns:
            str: Text with expanded medical acronyms/synonyms.
        """
        words = text.split()
        normalized_words = [self.MEDICAL_TERM_MAP.get(w.lower(), w) for w in words]
        normalized_text = " ".join(normalized_words)
        
        # Phrase level replacement
        for key, val in self.MEDICAL_TERM_MAP.items():
            if ' ' in key and key in normalized_text.lower():
                pattern = re.compile(re.escape(key), re.IGNORECASE)
                normalized_text = pattern.sub(val, normalized_text)
                
        return normalized_text

    def handle_negation(self, text: str) -> str:
        """Transform negated symptoms to prefix 'not_' to tokens following negation words.
        
        Example:
            "patient has fever but no chest pain"
            -> "patient has fever but no not_chest not_pain"
            
        Args:
            text (str): Input text string.
            
        Returns:
            str: Text with negation prefixes applied.
        """
        words = text.split()
        negated = False
        result = []
        
        clause_break_words = {"but", "however", "although", "except", "and", "."}
        
        for word in words:
            clean_w = word.strip(".,;:!?").lower()
            
            if clean_w in clause_break_words:
                negated = False
                result.append(word)
                continue
                
            if clean_w in self.NEGATION_WORDS:
                negated = True
                result.append(word)
                continue
                
            if negated:
                result.append(f"not_{word}")
            else:
                result.append(word)
                
        return " ".join(result)

    def clean_text(self, text: str) -> str:
        """Perform basic cleaning: remove HTML, URLs, digits, punctuation, and extra spaces.
        
        Args:
            text (str): Raw input text string.
            
        Returns:
            str: Sanitized text.
        """
        if not isinstance(text, str):
            logger.warning(f"Non-string input encountered: {type(text)}. Converting to string.")
            text = str(text) if text is not None else ""

        # Remove HTML tags
        text = re.sub(r'<[^>]+>', ' ', text)
        
        # Remove URLs
        text = re.sub(r'http[s]?://\S+|www\.\S+', ' ', text)
        
        # Expand contractions
        text = self.expand_contractions(text)
        
        # Lowercase
        text = text.lower()
        
        # Normalize medical terms
        text = self.normalize_medical_terms(text)
        
        # Handle negation before stripping punctuation
        text = self.handle_negation(text)
        
        # Remove punctuation except underscores (to retain not_ prefix)
        text = re.sub(r'[^\w\s_]', ' ', text)
        
        # Remove numbers/digits
        text = re.sub(r'\d+', ' ', text)
        
        # Remove multiple spaces & trailing/leading whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text

    def _fallback_lemmatize(self, word: str) -> str:
        """Pure Python fallback lemmatizer/stemmer rule base."""
        if word.endswith('ies') and len(word) > 4:
            return word[:-3] + 'y'
        if word.endswith('es') and len(word) > 3:
            return word[:-2]
        if word.endswith('s') and not word.endswith('ss') and len(word) > 3:
            return word[:-1]
        if word.endswith('ing') and len(word) > 4:
            return word[:-3]
        if word.endswith('ed') and len(word) > 4:
            return word[:-2]
        return word

    def tokenize_and_lemmatize(self, text: str) -> List[str]:
        """Tokenize text, remove stopwords, and apply lemmatization or stemming.
        
        Args:
            text (str): Cleaned input text.
            
        Returns:
            List[str]: List of processed tokens.
        """
        # Tokenization step
        if NLTK_AVAILABLE:
            try:
                tokens = word_tokenize(text)
            except Exception:
                tokens = text.split()
        else:
            tokens = text.split()
            
        processed_tokens = []
        for token in tokens:
            # Skip short tokens and non-negated stopwords
            if len(token) <= 1 or (token in self.stopwords and not token.startswith("not_")):
                continue
                
            if NLTK_AVAILABLE and self.lemmatizer and self.lemmatize:
                try:
                    if token.startswith("not_"):
                        root = token[4:]
                        lem_root = self.lemmatizer.lemmatize(root, pos=wordnet.NOUN)
                        lem_root = self.lemmatizer.lemmatize(lem_root, pos=wordnet.VERB)
                        processed_tokens.append(f"not_{lem_root}")
                    else:
                        lem = self.lemmatizer.lemmatize(token, pos=wordnet.NOUN)
                        lem = self.lemmatizer.lemmatize(lem, pos=wordnet.VERB)
                        processed_tokens.append(lem)
                    continue
                except Exception:
                    pass
            
            if NLTK_AVAILABLE and self.stemmer and self.use_stemming:
                try:
                    if token.startswith("not_"):
                        root = token[4:]
                        processed_tokens.append(f"not_{self.stemmer.stem(root)}")
                    else:
                        processed_tokens.append(self.stemmer.stem(token))
                    continue
                except Exception:
                    pass

            # Pure Python Fallback
            if token.startswith("not_"):
                root = token[4:]
                processed_tokens.append(f"not_{self._fallback_lemmatize(root)}")
            else:
                processed_tokens.append(self._fallback_lemmatize(token))
                
        return processed_tokens

    def preprocess_text(self, text: str) -> str:
        """Main entry point to execute full preprocessing pipeline on a single text string.
        
        Args:
            text (str): Raw symptom text string.
            
        Returns:
            str: Preprocessed, normalized, and lemmatized space-separated token string.
        """
        try:
            if not text or not isinstance(text, str) or not text.strip():
                return ""
                
            cleaned = self.clean_text(text)
            tokens = self.tokenize_and_lemmatize(cleaned)
            return " ".join(tokens)
        except Exception as e:
            logger.error(f"Error during preprocessing text: '{text}'. Error: {e}", exc_info=True)
            return ""

    def transform_batch(
        self,
        data: Union[List[str], pd.Series]
    ) -> List[str]:
        """Apply preprocessing across a batch/list/Series of symptom strings.
        
        Args:
            data (Union[List[str], pd.Series]): Batch of raw text descriptions.
            
        Returns:
            List[str]: List of preprocessed text strings.
        """
        logger.info(f"Preprocessing batch of {len(data)} items...")
        if isinstance(data, pd.Series):
            return data.apply(self.preprocess_text).tolist()
        return [self.preprocess_text(doc) for doc in data]


# Smoke test execution when run as main module
if __name__ == "__main__":
    logger.info("Executing MedicalTextPreprocessor smoke test...")
    sample_text = (
        "Patient presents with high BP, SOB, severe head ache, and vomiting. "
        "Patient denies chest pain and has no fever!"
    )
    
    preprocessor = MedicalTextPreprocessor(lemmatize=True)
    cleaned_result = preprocessor.preprocess_text(sample_text)
    
    print("\n" + "="*60)
    print(f"RAW INPUT     : {sample_text}")
    print(f"CLEANED OUTPUT: {cleaned_result}")
    print("="*60 + "\n")
    logger.info("Preprocessing smoke test completed successfully.")
