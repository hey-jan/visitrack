# VisiTrack: Real-Time Face Recognition Attendance System

VisiTrack is a modern, real-time attendance system that integrates a Next.js frontend with a specialized Python-based facial recognition engine.

---

## 1. Quick Start Guide

This project consists of two main parts that must be running simultaneously:
1.  **Frontend**: A Next.js application (Port 3000).
2.  **Face Recognition Service**: A Python FastAPI backend (Port 8001).

### **Running the Next.js Frontend**
The frontend handles the user interface, student management, and webcam display.

1.  **Open a terminal** at the project root (`C:\visitrack`).
2.  **Install dependencies**: `npm install`
3.  **Start the development server**: `npm run dev`
4.  **Access the app**: [http://localhost:3000](http://localhost:3000)

### **Running the Face Recognition Service**
The Python service handles the actual "brain" work of identifying faces.

1.  **Open a NEW terminal**.
2.  **Navigate to the face recognition directory**: `cd face-recognition`
3.  **Activate the Virtual Environment**: `.venv\Scripts\activate`
4.  **Start the Python API**: `python app.py`
5.  **Access the API**: [http://localhost:8001](http://localhost:8001)

---

## 2. System Architecture & Tech Stack

### **How It Works Together**
- **Dual-Backend Approach**: Next.js API handles core data and logins, while the Python API handles specialized AI tasks.
- **Real-Time Recognition Loop**: The frontend captures a webcam frame every 2 seconds and sends it to the Python service (`:8001/recognize`).
- **Shared Database**: The Python engine reads student embeddings directly from the shared `prisma/dev.db` to identify the person in the frame.

### **Core Technologies**
| Category | Technology |
| :--- | :--- |
| **Frontend** | React 19, Next.js 16, Tailwind CSS 4, TypeScript |
| **Backend** | Node.js, Next.js API (Serverless), Prisma ORM |
| **Database** | SQLite (Stored locally as `prisma/dev.db`) |
| **AI Engine** | Python 3.8+, InsightFace (ArcFace/RetinaFace), ONNX, OpenCV |
| **Auth** | Custom session-based auth using Bcrypt & HTTP-only cookies |

---

## 3. Recognition Specifics

| Feature | Specification |
| :--- | :--- |
| **Model Pack** | `buffalo_l` (L = Large, highest accuracy pack) |
| **Architecture** | **ResNet50** (50-layer deep neural network backbone) |
| **Algorithm** | **ArcFace** (State-of-the-art training for facial distance) |
| **Detection** | **RetinaFace** (SCRFD-10GF model) |
| **Embedding Size**| 512 Dimensions (Numerical "face fingerprint") |
| **Similarity Score**| Cosine Similarity (Threshold: 0.50) |

---

## 4. Troubleshooting

- **Database Error**: Ensure you are running the Python service from the `face-recognition` directory.
- **Port Conflict**: If port 8001 is busy, ensure you don't have another instance of `app.py` running.
- **Camera Not Loading**: Ensure no other application (like Zoom or Teams) is using your webcam.
