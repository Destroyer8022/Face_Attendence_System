import mysql.connector
from mysql.connector import Error
import os
import numpy as np
import pickle
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

def save_student_data(student_id, name, faces):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Serialize faces numpy array to bytes
        face_blob = pickle.dumps(faces)
        
        query = "INSERT INTO students (student_id, name, face_data) VALUES (%s, %s, %s)"
        cursor.execute(query, (student_id, name, face_blob))
        conn.commit()
        return True
    except Error as e:
        print(f"Error saving student: {e}")
        return False
    finally:
        conn.close()

def get_all_students():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT student_id, name FROM students")
        return cursor.fetchall()
    finally:
        conn.close()

def delete_student(student_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM students WHERE student_id = %s", (student_id,))
        conn.commit()
        return True
    except Error as e:
        print(f"Error deleting student: {e}")
        return False
    finally:
        conn.close()

def update_student_name(student_id, new_name):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE students SET name = %s WHERE student_id = %s", (new_name, student_id))
        conn.commit()
        return True
    except Error as e:
        print(f"Error updating student: {e}")
        return False
    finally:
        conn.close()

def load_recognition_data():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT student_id, face_data FROM students")
        rows = cursor.fetchall()
        
        all_ids = []
        all_faces = []
        
        for sid, face_blob in rows:
            faces = pickle.loads(face_blob)
            all_faces.append(faces)
            all_ids += [sid] * len(faces)
            
        if not all_faces:
            return None, None
            
        return np.array(all_ids), np.vstack(all_faces)
    finally:
        conn.close()

def get_student_name(student_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT name FROM students WHERE student_id = %s", (student_id,))
        row = cursor.fetchone()
        return row[0] if row else "Unknown"
    finally:
        conn.close()

def mark_attendance(student_id, name):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        from datetime import datetime
        now = datetime.now()
        date = now.strftime("%Y-%m-%d")
        time = now.strftime("%H:%M:%S")
        
        # Check if already marked today
        cursor.execute("SELECT id FROM attendance WHERE student_id = %s AND date = %s", (student_id, date))
        if cursor.fetchone():
            return False # Already marked
            
        cursor.execute(
            "INSERT INTO attendance (student_id, name, date, time, status) VALUES (%s, %s, %s, %s, %s)",
            (student_id, name, date, time, "Present")
        )
        conn.commit()
        return True
    except Error as e:
        print(f"Error marking attendance: {e}")
        return False
    finally:
        conn.close()

def get_attendance_reports():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT name AS NAME, DATE_FORMAT(date, '%d-%m-%Y') AS DATE, TIME_FORMAT(time, '%H:%i:%s') AS TIME FROM attendance ORDER BY date DESC, time DESC")
        return cursor.fetchall()
    finally:
        conn.close()
