# AI Medical Diagnosis Assistant

## Overview

AI Medical Diagnosis Assistant is a full-stack healthcare application that predicts possible diseases from symptoms entered in natural language. The project combines Natural Language Processing (NLP) and Machine Learning using the XGBoost algorithm to analyze user symptoms and provide possible disease predictions along with confidence scores and health recommendations.

This project is being developed as a B.Tech Major Capstone Project to demonstrate practical applications of Artificial Intelligence, Machine Learning, NLP, Backend Development, and Full Stack Web Development.

> **Disclaimer:** This application is developed for educational and research purposes only. It is not intended to replace professional medical advice, diagnosis, or treatment.

---

# Table of Contents

- Project Overview
- Problem Statement
- Objectives
- Features
- Technology Stack
- System Architecture
- Project Workflow
- Machine Learning Pipeline
- Folder Structure
- Installation
- Deployment
- Team Responsibilities
- Future Enhancements
- License

---

# Problem Statement

Many people search the internet to understand their symptoms, but the information they receive is often confusing, inaccurate, or unreliable.

This project aims to develop an AI-powered system capable of understanding natural language symptom descriptions and predicting possible diseases using Machine Learning techniques.

The application is designed to assist users by providing educational health information while encouraging consultation with qualified healthcare professionals.

---

# Objectives

The main objectives of this project are:

- Build a Natural Language Processing pipeline for symptom understanding.
- Train an XGBoost Machine Learning model for disease prediction.
- Develop REST APIs using FastAPI.
- Design a responsive user interface using React.
- Store user consultation history.
- Generate downloadable medical reports.
- Deploy the application on cloud platforms.

---

# Features

- User Registration and Login
- Secure JWT Authentication
- AI-Based Symptom Checker
- Natural Language Processing
- Disease Prediction using XGBoost
- Confidence Score for Predictions
- Consultation History
- Medical Report Generation
- Emergency Symptom Detection
- Analytics Dashboard
- Responsive User Interface

---

# Technology Stack

## Frontend

- React.js
- Tailwind CSS
- Axios
- Chart.js

## Backend

- FastAPI
- SQLAlchemy
- JWT Authentication

## Machine Learning

- Python
- Pandas
- NumPy
- Scikit-learn
- XGBoost
- NLTK
- TF-IDF
- Joblib

## Database

- PostgreSQL

## Version Control

- Git
- GitHub

## Deployment

- Vercel
- Render
- Supabase PostgreSQL

---

# System Architecture

```
User
        │
        ▼
React Frontend
        │
        ▼
FastAPI Backend
        │
        ▼
NLP Preprocessing
        │
        ▼
TF-IDF Vectorizer
        │
        ▼
XGBoost Model
        │
        ▼
Disease Prediction
        │
        ▼
PostgreSQL Database
```

---

# Project Workflow

The project follows the following workflow:

1. User enters symptoms in natural language.
2. The backend receives the request.
3. NLP preprocessing cleans and prepares the text.
4. TF-IDF converts the text into numerical features.
5. The trained XGBoost model predicts the disease.
6. The confidence score is calculated.
7. Results are returned to the frontend.
8. Consultation history is stored in PostgreSQL.

---

# Machine Learning Pipeline

The Machine Learning module consists of the following stages:

1. Dataset Collection
2. Data Cleaning
3. Exploratory Data Analysis
4. NLP Preprocessing
5. TF-IDF Vectorization
6. Train-Test Split
7. XGBoost Model Training
8. Model Evaluation
9. Model Serialization
10. API Integration

---

# Folder Structure

```
AI_Medical_Diagnosis_Assistant/

│── backend/
│── frontend/
│── ml/
│── dataset/
│── docs/
│── reports/
│── models/
│── notebooks/
│── requirements.txt
│── README.md
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/VaibhavKumarRai-eng/AI_Medical_Diagnosis_Assistant.git
```

```bash
cd AI_Medical_Diagnosis_Assistant
```

---

## Install Python Dependencies

```bash
pip install -r requirements.txt
```

---

## Run Backend

```bash
uvicorn main:app --reload
```

---

## Run Frontend

```bash
npm install
```

```bash
npm run dev
```

---

# Deployment

| Component | Platform |
|-----------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | Supabase PostgreSQL |
| Source Code | GitHub |

---

# Team Responsibilities

| Member | Responsibility |
|---------|----------------|
| Member 1 | Machine Learning, NLP, XGBoost |
| Member 2 | FastAPI Backend and APIs |
| Member 3 | React Frontend |
| Member 4 | Integration, Testing, Deployment and Documentation |

---

# Future Enhancements

The following features are planned for future versions of the project:

- Voice-Based Symptom Input
- AI Medical Chatbot
- Retrieval-Augmented Generation (RAG)
- Multilingual Support
- Medical Image Analysis
- Wearable Device Integration
- Appointment Booking
- Doctor Recommendation System

---

# License

This project has been developed for educational and research purposes as part of a Bachelor of Technology (B.Tech) Major Capstone Project.

The project is not intended to replace professional medical advice, diagnosis, or treatment.