# Face Attendance System

A Python-based automated attendance system that uses facial recognition to mark attendance in real-time. This project uses OpenCV for face detection and scikit-learn's K-Nearest Neighbors (KNN) classifier for face recognition.

## Features

- **User Registration**: Capture and store face data for new users.
- **Real-time Recognition**: Detects and identifies registered users via webcam.
- **Automated Attendance**: Logs attendance with timestamp in a CSV file (e.g., `Attendance_DD-MM-YYYY.csv`).
- **Voice Feedback**: Text-to-speech confirmation when attendance is recorded.
- **Duplicate Prevention**: Prevents multiple entries for the same user in a single session.

## Prerequisites

- Python 3.x
- A working webcam

## Installation

1. Clone or download this repository.
2. Install the required Python packages:

   ```bash
   pip install opencv-python numpy scikit-learn pywin32
   ```

## Usage

Navigate to the `face attendance system` directory:

```bash
cd "face attendance system"
```

### 1. Register a New User

Run the `add_faces.py` script to register a new face in the database.

```bash
python add_faces.py
```

- Enter the name of the user when prompted.
- Look at the webcam until 100 face samples are captured.
- The script will save the data to `data/names.pkl` and `data/faces_data.pkl`.

### 2. Take Attendance

Run the `test.py` script to start the recognition system.

```bash
python test.py
```

- The webcam will open and start detecting faces.
- When a registered face is recognized, it will draw a box around the face and display the name.
- Attendance will be marked in a CSV file in the `Attendance` folder.
- You will hear a voice confirmation: "Attendance recorded for [Name]".
- Press `q` to quit the application.

## Project Structure

```
face attendance system/
├── add_faces.py    # Script to capture and save user face data
├── test.py         # Main script for recognition and attendance marking
├── data/           # Stores face embeddings (faces_data.pkl) and names (names.pkl)
├── Attendance/     # Stores daily attendance CSV records
└── background.png  # UI background image
```

## Troubleshooting

- **Camera not opening**: Ensure no other application is using the webcam.
- **"Module not found" errors**: Make sure you have installed all dependencies listed in the Installation section.
