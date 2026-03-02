# How to Run Visitrack

This project consists of two main parts that must be running simultaneously:
1.  **Frontend**: A Next.js application (Port 3000).
2.  **Face Recognition Service**: A Python FastAPI backend (Port 8001).

---

## 1. Running the Next.js Frontend

The frontend handles the user interface, student management, and webcam display.

1.  **Open a terminal** at the project root (`C:\visitrack`).
2.  **Install dependencies** (only if you haven't already):
    ```powershell
    npm install
    ```
3.  **Start the development server**:
    ```powershell
    npm run dev
    ```
4.  **Access the app**: Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. Running the Face Recognition Service

The Python service handles the actual "brain" work of identifying faces.

1.  **Open a NEW terminal** (don't close the first one).
2.  **Navigate to the face recognition directory**:
    ```powershell
    cd face-recognition
    ```
3.  **Activate the Virtual Environment (`.venv`)**:
    The `.venv` folder contains the specific Python libraries (like `insightface` and `opencv`) needed for this project.
    ```powershell
    .venv\Scripts\activate
    ```
    *(You should see `(.venv)` appear at the start of your command prompt line.)*
4.  **Start the Python API**:
    ```powershell
    python app.py
    ```
    The service will start on `http://localhost:8001`.

---

## 3. How It Works Together

-   When you use the webcam in the browser (at Port 3000), the frontend captures images.
-   These images are sent to the Python service (at Port 8001).
-   The Python service compares the image against the student data stored in `prisma/dev.db`.
-   It sends back the name of the recognized student to the browser.

---

## 4. How to Stop the Services

To stop either the Next.js frontend or the Python face recognition service:

1.  **Go to the terminal** where the service is running.
2.  **Press `Ctrl + C`** on your keyboard.
3.  When asked "Terminate batch job (Y/N)?", type **`Y`** and press **Enter**.

If you were running a script that opened a webcam window (like `face_recognition.py`), you can also press the **'q'** key while that window is in focus to close it.


-   **Database Error**: If the Python service says "Database not found," ensure you are running it from the `face-recognition` directory.
-   **Port Conflict**: If port 8001 is busy, ensure you don't have another instance of `app.py` running.
-   **Camera Not Loading**: Ensure no other application (like Zoom or Teams) is using your webcam.
