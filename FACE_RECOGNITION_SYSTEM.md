# Face Recognition System Documentation

This document provides a detailed technical overview of the real-time face recognition system integrated into **VisiTrack**.

## 1. Tech Stack

### **Backend (Recognition Engine)**
*   **Python 3.8+**: The core language for facial analysis and machine learning.
*   **InsightFace**: A high-performance deep face analysis library.
    *   **Model**: `buffalo_l` (Large-scale model for high accuracy).
    *   **Detection**: RetinaFace for robust face localization.
    *   **Recognition**: ArcFace for generating 512-dimensional facial embeddings.
*   **FastAPI**: A modern, fast web framework for building the recognition API.
*   **ONNX Runtime**: Used for optimized model inference (supports CPU and GPU/CUDA).
*   **OpenCV**: Used for image decoding, preprocessing, and manipulation.
*   **NumPy**: For efficient vector operations and cosine similarity calculations.
*   **SQLite (via sqlite3)**: Direct connection to the Prisma database for loading facial data.

### **Frontend (Client Interface)**
*   **Next.js (React)**: The web framework for the instructor dashboard.
*   **React-Webcam**: For capturing real-time video frames from the browser.
*   **HTML5 Canvas**: For drawing real-time bounding boxes and identification labels over the video feed.

---

## 2. System Architecture & Flow

The system operates on a **Request-Response** cycle between the Next.js frontend and the Python backend.

### **A. Startup & Initialization**
1.  **Model Loading**: The Python server loads the InsightFace `buffalo_l` models into memory.
2.  **Known Faces Sync**: 
    *   The system queries the `Student` and `FacialData` tables in `dev.db`.
    *   It fetches registration thumbnails and generates facial embeddings.
    *   These embeddings are cached in memory (and as a `.pkl` file) to ensure sub-millisecond comparisons.

### **B. The Recognition Loop**
1.  **Capture**: The frontend captures a frame from the webcam every 2 seconds.
2.  **Transmission**: The frame is sent as a `multipart/form-data` POST request to `http://localhost:8001/recognize`.
3.  **Processing**:
    *   **Decoding**: OpenCV decodes the image.
    *   **Detection**: The engine detects all faces and scales the search area to `320x320` for speed.
    *   **Embedding**: For each detected face, a unique 512D numerical vector is generated.
    *   **Comparison**: The system calculates the **Cosine Similarity** between the new face and all known student embeddings.
4.  **Identification**:
    *   If similarity $\ge$ **0.50** (Threshold), the student is identified.
    *   If below the threshold, the face is labeled as "Unknown".
5.  **Response**: The backend returns a JSON object containing:
    *   `name`: Student Name or "Unknown"
    *   `confidence`: The similarity score (0.0 to 1.0)
    *   `bbox`: Coordinates `[x1, y1, x2, y2]` for the bounding box.

### **C. Attendance Logging**
1.  **UI Feedback**: The frontend draws a green (Success) or red (Unknown) box on the canvas.
2.  **State Management**: If a student is identified, they are marked as "Detected" in the local UI state.
3.  **Persistence**: Once the instructor clicks "Finish & Save", the detected list is sent to the main Next.js API to be saved in the database as "Present".

---

## 3. Key Specifications

| Feature | Specification |
| :--- | :--- |
| **Detection Resolution** | 320 x 320 px |
| **Display Resolution** | 640 x 480 px |
| **Similarity Threshold** | 0.50 (Configurable in `app.py`) |
| **Embedding Size** | 512 Dimensions |
| **Inference Interval** | ~2000ms (Frontend controlled) |
| **Database** | SQLite (`prisma/dev.db`) |

---

## 4. API Endpoints

*   `GET /health`: Checks if the recognition engine is alive.
*   `POST /sync`: Forces the engine to reload student data from the database.
*   `POST /recognize`: Accepts an image file and returns detection/identification results.
