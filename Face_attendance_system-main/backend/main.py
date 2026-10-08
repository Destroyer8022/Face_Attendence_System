from fastapi import FastAPI, Form, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import cv2
import numpy as np
import base64
from database import save_student_data, mark_attendance, get_attendance_reports, get_all_students, delete_student, update_student_name, get_student_name
from recognition import FaceRecognizer

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

recognizer = FaceRecognizer()

@app.post("/login")
async def login(username: str = Form(...), password: str = Form(...)):
    if username == "admin" and password == "admin123":
        return {"status": "success", "message": "Login successful"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/register")
async def register_student(name: str = Form(...), student_id: str = Form(...), images: list[str] = Form(...)):
    # Step 1: Process captured images to extract face vectors
    processed_faces = []
    failed_detections = 0
    
    for img_data in images:
        try:
            header, encoded = img_data.split(",", 1)
            data = base64.b64decode(encoded)
            nparr = np.frombuffer(data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            faces = recognizer.detect_faces(frame)
            if len(faces) > 0:
                x, y, w, h = faces[0]
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                face_roi = gray[y:y+h, x:x+w]
                face_roi = cv2.equalizeHist(face_roi)          # normalize lighting
                resized_face = cv2.resize(face_roi, (100, 100)) # 2D grayscale
                processed_faces.append(resized_face)
            else:
                failed_detections += 1
        except Exception:
            failed_detections += 1
    
    if len(processed_faces) < 10:
        raise HTTPException(
            status_code=400, 
            detail=f"Not enough faces detected ({len(processed_faces)} detected, {failed_detections} failed). Please keep your face still and ensure good lighting."
        )
    
    # Step 2: Check if this FACE already exists in the database (biometric check)
    duplicate_sid = recognizer.check_duplicate_face(processed_faces)
    if duplicate_sid:
        duplicate_name = get_student_name(duplicate_sid)
        # Face is already registered — mark attendance and return info
        already_marked = mark_attendance(duplicate_sid, duplicate_name)
        if already_marked:
            return {
                "status": "success",
                "message": f"Welcome back, {duplicate_name}! Your face is already registered (ID: {duplicate_sid}). Attendance has been marked for today."
            }
        else:
            return {
                "status": "success",
                "message": f"Welcome back, {duplicate_name}! Your attendance was already marked earlier today."
            }
    
    # Step 3: New face — now check if the Student ID is already taken by someone else
    existing_name = get_student_name(student_id.strip())
    if existing_name != "Unknown":
        raise HTTPException(
            status_code=400,
            detail=f"ID Conflict: Student ID '{student_id}' is already assigned to '{existing_name}'. Please use a different ID."
        )
    
    # Step 4: All clear — register the new student
    save_student_data(student_id, name, np.array(processed_faces))
    recognizer.train()
    return {"status": "success", "message": f"Student {name} successfully registered with {len(processed_faces)} face samples."}

@app.post("/process-frame")
async def process_frame(image: str = Form(...)):
    try:
        header, encoded = image.split(",", 1)
        data = base64.b64decode(encoded)
        nparr = np.frombuffer(data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        results = recognizer.process_frame(frame)
        
        for res in results:
            if res["student_id"] != "Unknown":
                marked = mark_attendance(res["student_id"], res["name"])
                res["attendance_marked"] = marked
                
        return {"status": "success", "results": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/reports")
async def get_reports():
    reports = get_attendance_reports()
    return {"status": "success", "reports": reports}

@app.get("/students")
async def list_students():
    students = get_all_students()
    return {"status": "success", "students": students}

@app.delete("/students/{student_id}")
async def remove_student(student_id: str):
    success = delete_student(student_id.strip())
    if success:
        recognizer.train()
        return {"status": "success", "message": "Student deleted"}
    raise HTTPException(status_code=500, detail="Failed to delete student")

@app.put("/students/{student_id}")
async def update_student(student_id: str, name: str = Body(..., embed=True)):
    success = update_student_name(student_id.strip(), name.strip())
    if success:
        return {"status": "success", "message": "Student name updated"}
    raise HTTPException(status_code=500, detail="Failed to update student")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

