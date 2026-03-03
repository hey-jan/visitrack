import cv2
import numpy as np
import insightface
from insightface.app import FaceAnalysis
import os
import pickle
import sqlite3
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import List
import io

app = FastAPI()

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'prisma', 'dev.db')
UPLOADS_DIR = os.path.join(BASE_DIR, 'public')
EMBEDDINGS_CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'embeddings_cache.pkl')
SIMILARITY_THRESHOLD = 0.5
DET_SIZE = (320, 320)

# Initialize FaceAnalysis
providers = ['CPUExecutionProvider']
try:
    import onnxruntime as ort
    if 'CUDAExecutionProvider' in ort.get_available_providers():
        providers.insert(0, 'CUDAExecutionProvider')
        print("Using GPU acceleration (CUDA)")
except Exception:
    pass

face_app = FaceAnalysis(providers=providers)
face_app.prepare(ctx_id=0, det_size=DET_SIZE)

def load_known_faces():
    """Load facial data from the database and generate/cache embeddings."""
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return None, None

    print(f"Loading facial data from database: {DB_PATH}")
    all_embeddings = []
    all_ids = []
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT s.id, fd.thumbnailUrl, s.firstName, s.lastName
            FROM Student s 
            JOIN FacialData fd ON s.id = fd.studentId
        """)
        rows = cursor.fetchall()
        
        for student_id, thumbnailUrl, firstName, lastName in rows:
            if not thumbnailUrl:
                continue
            
            img_path = os.path.join(UPLOADS_DIR, thumbnailUrl.lstrip('/'))
            
            if os.path.exists(img_path):
                img = cv2.imread(img_path)
                if img is not None:
                    faces = face_app.get(img)
                    if faces:
                        best_face = max(faces, key=lambda x: (x.bbox[2]-x.bbox[0])*(x.bbox[3]-x.bbox[1]))
                        all_embeddings.append(best_face.normed_embedding)
                        all_ids.append(student_id)
                        print(f"SUCCESS: Learned face for {firstName} {lastName} ({student_id})")
                    else:
                        print(f"WARNING: No face detected in registration photo for {firstName} {lastName}")
                else:
                    print(f"ERROR: Could not read image file for {firstName}: {img_path}")
            else:
                print(f"ERROR: Image file missing for {firstName}: {img_path}")
        
        conn.close()
    except Exception as e:
        print(f"Error loading from DB: {e}")

    if not all_embeddings:
        print("Warning: No facial data found in database or images missing.")
        return None, None

    known_embeddings = np.array(all_embeddings)
    known_ids = np.array(all_ids)

    # Save to cache
    try:
        with open(EMBEDDINGS_CACHE, 'wb') as f:
            pickle.dump((known_embeddings, known_ids), f)
    except Exception:
        pass

    return known_embeddings, known_ids

# Initial load
known_embeddings, known_names = load_known_faces()

@app.post("/recognize")
async def recognize(file: UploadFile = File(...), allowed_ids: str = Form(None)):
    global known_embeddings, known_names
    
    # Reload if empty
    if known_embeddings is None or len(known_embeddings) == 0:
        known_embeddings, known_names = load_known_faces()

    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        return {"results": []}

    # Parse allowed_ids (comma-separated student IDs from frontend)
    target_ids = None
    if allowed_ids:
        target_ids = [id.strip() for id in allowed_ids.split(',')]

    faces = face_app.get(img)
    results = []

    if faces and known_embeddings is not None and len(known_embeddings) > 0:
        detected_embeddings = np.array([face.normed_embedding for face in faces])
        similarities = np.dot(detected_embeddings, known_embeddings.T)
        
        for i, face in enumerate(faces):
            best_match_idx = np.argmax(similarities[i])
            best_score = float(similarities[i][best_match_idx])
            
            matched_id = known_names[best_match_idx]
            
            # Filter by allowed_ids if provided
            is_allowed = True
            if target_ids is not None:
                is_allowed = matched_id in target_ids

            if is_allowed and best_score >= SIMILARITY_THRESHOLD:
                name = matched_id # Return the ID
            else:
                name = "Unknown"
            
            results.append({
                "name": name,
                "confidence": best_score,
                "bbox": face.bbox.tolist()
            })

    elif faces:
        for face in faces:
            results.append({
                "name": "Unknown",
                "confidence": 0.0,
                "bbox": face.bbox.tolist()
            })

    return {"results": results}

@app.post("/sync")
async def sync():
    """Manually trigger a sync with the database."""
    global known_embeddings, known_names
    known_embeddings, known_names = load_known_faces()
    return {"status": "synced", "count": len(known_names) if known_names is not None else 0}

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
