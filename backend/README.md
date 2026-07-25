# Enterprise AI Medical Diagnosis Assistant Backend

This is the production-grade FastAPI backend for the **Enterprise AI Medical Diagnosis Assistant**.

## Architecture & Layout

The backend follows **Clean Architecture** patterns, splitting the application into distinct modular layers:

- **Core (`app/core/`)**: Application bootstrap, DB connections, JWT security mechanisms, logger configurations, and system-wide constants.
- **Models (`app/models/`)**: SQLAlchemy domain objects representing the database structure.
- **Schemas (`app/schemas/`)**: Pydantic data schemas for request input validation and structured API responses.
- **Repositories (`app/repositories/`)**: Abstract database access functions (Repository Pattern) isolating data queries from business logic.
- **Services (`app/services/`)**: High-level orchestrators containing business logic (Authentication, Predictor Engine wrapping the ML pipeline, and Chatbot state machine).
- **API (`app/api/`)**: REST controllers executing HTTP verbs and injecting dependencies (routes under `v1/`).
- **ML Adapter (`app/ml/`)**: Connective interface referencing the pre-trained models.

---

## Getting Started

### Prerequisites
- Python 3.12+
- PostgreSQL (or SQLite local fallback database)

### Installation
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Running the App
Start the development server with:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive documentation will be available at `http://localhost:8000/docs` or `http://localhost:8000/redoc`.
