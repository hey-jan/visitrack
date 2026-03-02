# Technologies Used

## Core Libraries

- **Python** - Programming language
- **OpenCV (cv2)** - Computer vision library for image capture, processing, and real-time video streaming
- **NumPy** - Numerical computing for embedding operations and array manipulation

## Face Recognition

- **InsightFace** - Face recognition framework for face detection and embedding generation
- **FaceAnalysis** - Component from InsightFace for extracting face embeddings and bounding boxes

## Models

- **ONNX Models (buffalo_l series)** - Pre-trained deep learning models in Open Neural Network Exchange format:
  - **det_10g.onnx** - Face detection model
  - **2d106det.onnx** - Face landmark detection
  - **w600k_r50.onnx** - Face embedding/recognition model
  - **genderage.onnx** - Gender and age estimation
  - **1k3d68.onnx** - 3D face reconstruction

## Runtime

- **ONNX Runtime** - Executes the ONNX models using CPUExecutionProvider

## Hardware

- **Webcam** - Real-time video capture device (cv2.VideoCapture)
