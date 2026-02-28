# VisiTrack: System Architecture & Technologies

VisiTrack is a modern, real-time attendance system that integrates a Next.js frontend with a specialized Python-based facial recognition engine.

---

## 1. Overall Tech Stack

### **Frontend (Web Application)**
-   **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/) for type safety.
-   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (Utility-first styling).
-   **Webcam Integration**: `react-webcam` for capturing real-time student photos.
-   **Reporting**: `jspdf` for PDF exports and `xlsx` for Excel reports.

### **Backend & Database**
-   **API Framework**: Next.js API Routes (Serverless functions).
-   **ORM**: [Prisma](https://www.prisma.io/) to interact with the database.
-   **Database**: [SQLite](https://www.sqlite.org/) (Stored locally as `prisma/dev.db`).
-   **Authentication**: Custom session-based auth using `bcrypt` and HTTP-only `cookies`.
-   **Storage**: Local filesystem (`public/uploads/`) for student photos and snapshots.

### **Face Recognition Engine (Python)**
-   **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (High-performance web API).
-   **Computer Vision**: [OpenCV](https://opencv.org/) for image processing.
-   **Deep Learning**: [InsightFace](https://insightface.ai/) for face analysis.
-   **Runtime**: [ONNX Runtime](https://onnxruntime.ai/) for optimized model execution.
-   **Environment**: Python `.venv` for isolated dependency management.

---

## 2. Facial Recognition Specifics

The engine uses a sophisticated model pack and algorithm to ensure high-accuracy identification.

| Feature | Specification |
| :--- | :--- |
| **Model Pack** | `buffalo_l` (L = Large, highest accuracy pack) |
| **Architecture** | **ResNet50** (50-layer deep neural network backbone) |
| **Algorithm** | **ArcFace** (State-of-the-art training for facial distance) |
| **Detection** | **RetinaFace** (SCRFD-10GF model) |
| **Embedding Size**| 512 Dimensions (Numerical "face fingerprint") |
| **Similarity Score**| Cosine Similarity (Threshold: 0.50) |

---

## 3. System Architecture & Flow

### **How Components Communicate**
VisiTrack uses a dual-backend approach:
1.  **Next.js API**: Handles logins, student registration, and attendance reports.
2.  **Python API**: The browser captures a webcam frame and sends it directly to the Python service (`:8001/recognize`).
3.  **Shared Database**: The Python engine reads student embeddings directly from the shared `prisma/dev.db` to identify the person in the frame.

### **The Recognition Loop**
1.  **Capture**: The frontend captures a webcam frame every 2 seconds.
2.  **Transmission**: The frame is sent as a `POST` request to the Python backend.
3.  **Processing**:
    *   The engine detects faces and scales the area to `320x320` for speed.
    *   It generates a 512D vector for each detected face.
    *   It calculates the similarity between this vector and all known student vectors in the database.
4.  **Identification**:
    *   If similarity $\ge$ **0.50**, the student is identified.
    *   If below, it is labeled as "Unknown".
5.  **Logging**: Identified students are added to a local list. Once the session is finished, the list is sent to the Next.js API to be saved as "Present".

---

## 4. API Endpoints (Python Service)

*   `GET /health`: Checks if the recognition engine is alive.
*   `POST /sync`: Forces the engine to reload student data from the database.
*   `POST /recognize`: Accepts an image file and returns detection/identification results.

---

## Summary of Key Dependencies
| Category | Technology |
| :--- | :--- |
| **Frontend** | React 19, Next.js 15, Tailwind CSS 4 |
| **Backend** | Node.js, Next.js API, Prisma |
| **Database** | SQLite |
| **AI/ML** | Python 3.8+, InsightFace, ONNX, OpenCV |
| **Auth** | Bcrypt, HTTP-only Cookies |
