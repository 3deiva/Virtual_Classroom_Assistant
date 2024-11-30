import streamlit as st
import face_recognition
import cv2
import numpy as np
import pickle
import os
import time
from datetime import datetime
import csv


def load_data():
    faces_data, names, rollnos, roles = [], [], [], []
    
    for filename, target_list in zip(
        ['data/faces_encodings.pkl', 'data/names.pkl', 'data/rollnos.pkl', 'data/roles.pkl'],
        [faces_data, names, rollnos, roles]
    ):
        try:
            if os.path.exists(filename):
                with open(filename, 'rb') as f:
                    target_list.extend(pickle.load(f))
        except (EOFError, pickle.UnpicklingError):
            st.warning(f"Error loading data from {filename} or file is empty.")
    
    return faces_data, names, rollnos, roles

def capture_face_data(name, rollno, role):
    video = cv2.VideoCapture(0)
    known_face_encodings = []
    known_face_names = []

    st.write("Capturing face data...")

    while True:
        ret, frame = video.read()
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        for face_encoding in face_encodings:
            known_face_encodings.append(face_encoding)
            known_face_names.append(name)

        for (top, right, bottom, left) in face_locations:
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)

        cv2.imshow("Capture Face", frame)
        k = cv2.waitKey(1)
        if k == ord('q') or len(known_face_encodings) >= 100:
            break

    video.release()
    cv2.destroyAllWindows()

    if not os.path.exists('data'):
        os.makedirs('data')

    paths = {
        'faces_encodings.pkl': known_face_encodings,
        'names.pkl': [name] * len(known_face_encodings),
        'rollnos.pkl': [rollno] * len(known_face_encodings),
        'roles.pkl': [role] * len(known_face_encodings)
    }

    for filename, data in paths.items():
        file_path = f'data/{filename}'
        if os.path.isfile(file_path):
            try:
                with open(file_path, 'rb') as f:
                    existing_data = pickle.load(f)
                existing_data.extend(data)
            except (EOFError, pickle.UnpicklingError):
                existing_data = data
        else:
            existing_data = data

        with open(file_path, 'wb') as f:
            pickle.dump(existing_data, f)

    st.write(f"Data for {name} saved successfully!")

def track_attendance():
    faces_data, names, rollnos, roles = load_data()
    known_face_encodings = faces_data
    known_face_names = names

    video = cv2.VideoCapture(0)
    COL_NAMES = ['NAME', 'ROLLNO', 'ROLE', 'TIME']

    st.write("Press 'o' to start tracking attendance.")
    st.write("Press 'q' to stop tracking attendance.")

    tracking = False
    recorded_faces = set()
    last_attendance_time = 0

    while True:
        ret, frame = video.read()
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        if tracking:
            current_time = time.time()
            for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
                matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.6)
                name = "Unknown"

                if True in matches:
                    first_match_index = matches.index(True)
                    name = known_face_names[first_match_index]

                    if name not in recorded_faces and (current_time - last_attendance_time) > 2:
                        person_index = known_face_names.index(name)
                        recorded_faces.add(name)
                        last_attendance_time = current_time

                        date = datetime.fromtimestamp(current_time).strftime("%d-%m-%Y")
                        timestamp = datetime.fromtimestamp(current_time).strftime("%H:%M:%S")
                        file_path = f"Attendance/Attendance_{date}.csv"

                        cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)
                        cv2.rectangle(frame, (left, top), (right, bottom), (50, 50, 255), 2)
                        cv2.rectangle(frame, (left, top - 40), (right, top), (50, 50, 255), -1)
                        cv2.putText(frame, name, (left, top - 15), cv2.FONT_HERSHEY_COMPLEX, 1, (255, 255, 255), 1)

                        attendance = [name, rollnos[person_index], roles[person_index], str(timestamp)]
                        file_exists = os.path.isfile(file_path)
                        with open(file_path, "a", newline='') as csvfile:
                            writer = csv.writer(csvfile)
                            if not file_exists:
                                writer.writerow(COL_NAMES)
                            writer.writerow(attendance)
                        
                        message = f"Attendance marked for {name}"
                        cv2.putText(frame, message, (50, 50), cv2.FONT_HERSHEY_COMPLEX, 1, (0, 255, 0), 2)
                        cv2.imshow("Frame", frame)
                        cv2.waitKey(2000)

        cv2.imshow("Frame", frame)
        k = cv2.waitKey(1)

        if k == ord('o'):
            tracking = True
            st.write("Tracking started.")
        
        if k == ord('q'):
            tracking = False
            st.write("Stopping tracking...")
            break

    video.release()
    cv2.destroyAllWindows()
    st.write("Attendance tracking complete!")

# Streamlit UI
st.title('Attendance Management System')

role = st.selectbox("Select your role:", ["Teacher", "Student"])

if role:
    action = st.selectbox("Choose action:", ["New", "Track Attendance", "Cancel"])
    
    if action == "New":
        name = st.text_input("Enter your Name:")
        rollno = st.text_input("Enter your Roll Number:")
        if st.button("Add"):
            if name and rollno:
                capture_face_data(name, rollno, role)
            else:
                st.warning("Please enter both Name and Roll Number")
                
    elif action == "Track Attendance":
        if st.button("Start Tracking"):
            track_attendance()
