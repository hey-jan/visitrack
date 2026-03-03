# Face Recognition Service (Python)

This is the AI-powered backend service for VisiTrack. It uses **InsightFace** and **FastAPI** to identify students from webcam images.

## Features
- **FastAPI**: High-performance web API for real-time recognition.
- **InsightFace**: State-of-the-art face detection (RetinaFace) and recognition (ArcFace).
- **SQLite Integration**: Directly reads student facial embeddings from `prisma/dev.db`.
- **ONNX Runtime**: Optimized for CPU inference.

## Directory Structure
- `app.py`: The main FastAPI server.
- `.venv/`: Python virtual environment with all dependencies.
- `models/`: Bundled Buffalo_L models (no runtime downloads needed).
- `embeddings_cache.pkl`: Local cache for faster startup.

## Setup & Running
1.  **Activate Environment**: `.venv\Scripts\activate`
2.  **Start Service**: `python app.py`

## API Endpoints
- `GET /health`: Health check.
- `POST /sync`: Reload student embeddings from the database.
- `POST /recognize`: Recognize faces in an uploaded image.
