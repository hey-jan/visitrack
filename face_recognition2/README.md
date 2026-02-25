# Real-Time Face Recognition System

This project is a real-time face recognition system that uses a webcam to identify known individuals. It is built with Python, leveraging the `opencv-python` library for video capture and the `insightface` library for high-accuracy face detection and recognition.

The system is designed to be self-contained and deployment-ready, with bundled models to ensure it runs without needing to download assets at runtime.

## Directory Structure

```
C:\face_recognition2
├─── .venv\              # Directory for the Python virtual environment
├─── known_faces\        # Directory to store images of known individuals
│    └─── [Person_Name]\ # Each subdirectory is named after a person
│         └─── image.jpg # One or more images of the person
├─── models\             # Contains the pre-trained InsightFace recognition models
│    └─── buffalo_l
├─── face_recognition.py # The main application script
└─── README.md           # This documentation file
```

## How It Works

The application performs the following steps in a continuous loop:

1.  **Model Loading**: On startup, the script loads the pre-trained `insightface` models from the local `/models/buffalo_l` directory.
2.  **Load Known Faces**: It scans the `known_faces` directory. For each person's subfolder, it loads the images, detects the face, and computes a facial embedding (a unique numerical representation of the face). These embeddings are stored in memory.
3.  **Webcam Capture**: The script captures video frames from the default webcam.
4.  **Face Detection**: For each frame, it detects all visible faces.
5.  **Face Recognition**: For each detected face, it computes a new facial embedding. This new embedding is then compared against all the "known" embeddings loaded earlier.
6.  **Similarity Check**: It calculates a similarity score (cosine similarity) between the new face and the known faces. If the score for any known face is above the `SIMILARITY_THRESHOLD` (currently 0.6), the face is identified. Otherwise, it is labeled as "Unknown".
7.  **Display Overlay**: The script draws a bounding box around each detected face on the video feed. It labels the box with the person's name and the similarity score if recognized, or "Unknown" if not.
8.  **Real-Time Feed**: The processed video feed is displayed in a window titled "Face Recognition".

The loop can be terminated by pressing the 'q' key.

## Setup Instructions

Follow these steps to set up and run the project.

### 1. Prerequisites

-   Python 3.8+ installed on your system.
-   A webcam connected to your computer.

### 2. Create a Virtual Environment

It is highly recommended to use a Python virtual environment to manage project dependencies and avoid conflicts with other Python projects.

From the project's root directory (`C:\face_recognition2`), run the following command to create a virtual environment named `.venv`:

```sh
python -m venv .venv
```

### 3. Install Dependencies

The required Python libraries are listed in the script's imports. Install them using `pip`.

**Important**: Make sure you are using the Python interpreter from your virtual environment.

```sh
C:\face_recognition2\.venv\Scripts\python.exe -m pip install opencv-python numpy insightface onnxruntime
```

### 4. Add Known Faces

To enable the system to recognize people, you must add their pictures to the `known_faces` directory.

1.  Inside the `known_faces` folder, create a new subfolder for each person you want to recognize (e.g., `known_faces/john`).
2.  Place one or more clear, well-lit images of that person inside their respective folder.
3.  The system works best with one clear face per image.

## How to Run the Application

Once the setup is complete, you can run the face recognition system with the following command from the project's root directory (`C:\face_recognition2`):

```sh
C:\face_recognition2\.venv\Scripts\python.exe face_recognition.py
```

A window titled "Face Recognition" will appear, showing your webcam feed with faces being identified in real time.

To stop the application, press the **'q'** key while the "Face Recognition" window is in focus.
