import cv2
import numpy as np
from database import load_recognition_data, get_student_name

CASCADE_PATH = "data/haarcascade_frontalface_default.xml"
FACE_SIZE = (100, 100)

# LBPH confidence threshold — LOWER = more strict (better match)
# In LBPH, confidence of 0 is perfect. >80 is likely a wrong match.
CONFIDENCE_THRESHOLD = 80


class FaceRecognizer:
    def __init__(self):
        self.face_cascade = cv2.CascadeClassifier(CASCADE_PATH)
        self.lbph = cv2.face.LBPHFaceRecognizer_create()
        self.id_to_sid = {}   # int label → student_id string
        self.is_trained = False
        self.train()

    def train(self):
        ids, faces = load_recognition_data()
        if ids is not None and len(ids) > 0:
            # Map string student IDs → integer labels for LBPH
            unique_sids = list(dict.fromkeys(ids))   # unique, order-preserved
            self.id_to_sid = {i: sid for i, sid in enumerate(unique_sids)}
            sid_to_int = {sid: i for i, sid in self.id_to_sid.items()}

            int_labels = np.array([sid_to_int[sid] for sid in ids], dtype=np.int32)

            # faces shape: (total_samples, 100, 100) — grayscale 2D images
            face_list = [faces[i] for i in range(len(faces))]

            self.lbph.train(face_list, int_labels)
            self.is_trained = True
        else:
            self.lbph = cv2.face.LBPHFaceRecognizer_create()  # reset
            self.id_to_sid = {}
            self.is_trained = False

    def detect_faces(self, frame):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        # Equalize histogram to handle lighting differences
        gray = cv2.equalizeHist(gray)
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.2,
            minNeighbors=5,
            minSize=(60, 60)
        )
        return faces

    def _preprocess_face(self, frame, x, y, w, h):
        """Extract, convert to grayscale, equalize, and resize a face region."""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        face_roi = gray[y:y+h, x:x+w]
        face_roi = cv2.equalizeHist(face_roi)   # normalize lighting
        return cv2.resize(face_roi, FACE_SIZE)

    def recognize(self, frame, face_coords):
        if not self.is_trained:
            return "Unknown", "Unknown"

        x, y, w, h = face_coords
        face = self._preprocess_face(frame, x, y, w, h)

        label, confidence = self.lbph.predict(face)

        # Reject if confidence is too high (low confidence in match)
        if confidence > CONFIDENCE_THRESHOLD:
            return "Unknown", "Unknown"

        student_id = self.id_to_sid.get(label)
        if student_id is None:
            return "Unknown", "Unknown"

        name = get_student_name(student_id)
        return student_id, name

    def check_duplicate_face(self, processed_faces):
        """
        Voting-based duplicate detection using LBPH.
        If >50% of the captured face samples match an existing student
        with confidence < threshold, consider it a duplicate.
        """
        if not self.is_trained:
            return None

        vote_counts = {}
        total = len(processed_faces)

        for face in processed_faces:
            label, confidence = self.lbph.predict(face)
            if confidence <= CONFIDENCE_THRESHOLD:
                sid = self.id_to_sid.get(label)
                if sid:
                    vote_counts[sid] = vote_counts.get(sid, 0) + 1

        if not vote_counts:
            return None

        top_match = max(vote_counts, key=vote_counts.get)
        if vote_counts[top_match] / total >= 0.5:
            return top_match

        return None

    def process_frame(self, frame):
        faces = self.detect_faces(frame)
        results = []
        for (x, y, w, h) in faces:
            sid, name = self.recognize(frame, (x, y, w, h))
            results.append({
                "student_id": sid,
                "name": name,
                "box": [int(x), int(y), int(w), int(h)]
            })
        return results
