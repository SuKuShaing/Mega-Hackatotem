from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import mediapipe as mp
import os
import json
import math

app = Flask(__name__)
CORS(app)

# Configuración de Face Mesh (API clásica de Mediapipe)
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True,    # Procesa cada imagen de forma independiente
    max_num_faces=1,           # Detecta solo un rostro
    refine_landmarks=True,     # Mejora la precisión de los landmarks
    min_detection_confidence=0.5
)

# Archivo para almacenar los usuarios registrados (JSON)
DATA_FILE = 'registered_users.json'

def compute_distance(landmarks1, landmarks2):
    """Calcula la distancia promedio Euclidiana entre dos listas de puntos.
       Cada punto es un diccionario con keys 'x' y 'y' (se ignora 'z')."""
    if len(landmarks1) != len(landmarks2):
        return float('inf')
    total_distance = 0.0
    for p1, p2 in zip(landmarks1, landmarks2):
        dx = p1['x'] - p2['x']
        dy = p1['y'] - p2['y']
        total_distance += math.sqrt(dx * dx + dy * dy)
    return total_distance / len(landmarks1)

@app.route('/detect', methods=['POST'])
def detect():
    # Endpoint para registrar un usuario
    if 'image' not in request.files:
        return jsonify({'error': 'No se ha proporcionado imagen'}), 400

    file = request.files['image']
    file_bytes = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    
    # Procesar la imagen con Face Mesh (convertir de BGR a RGB)
    results = face_mesh.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    
    landmarks = []
    if results.multi_face_landmarks:
        face_landmarks = results.multi_face_landmarks[0]
        for lm in face_landmarks.landmark:
            landmarks.append({
                'x': lm.x,
                'y': lm.y,
                'z': lm.z
            })
    
    # Recoger los datos del formulario; el RUT se usará como id
    name = request.form.get('name', '')
    rut = request.form.get('rut', '')
    
    usuario = {
        'id': rut,
        'name': name,
        'rut': rut,
        # Para comparación usamos solo x e y
        'landmarks': [{'x': pt['x'], 'y': pt['y']} for pt in landmarks]
    }
    
    # Cargar los usuarios existentes o inicializar una lista vacía
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            try:
                users = json.load(f)
            except json.JSONDecodeError:
                users = []
    else:
        users = []
    
    # Agregar el usuario y guardar
    users.append(usuario)
    with open(DATA_FILE, 'w') as f:
        json.dump(users, f, indent=2)
    
    return jsonify(usuario)

@app.route('/recognize', methods=['POST'])
def recognize():
    # Endpoint para reconocer un usuario a partir de una imagen
    if 'image' not in request.files:
        return jsonify({'error': 'No se ha proporcionado imagen'}), 400

    file = request.files['image']
    file_bytes = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    
    results = face_mesh.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    
    new_landmarks = []
    if results.multi_face_landmarks:
        for lm in results.multi_face_landmarks[0].landmark:
            new_landmarks.append({'x': lm.x, 'y': lm.y})
    else:
        return jsonify({'message': 'No se detectó ningún rostro'}), 200
    
    # Cargar usuarios registrados
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            try:
                users = json.load(f)
            except json.JSONDecodeError:
                users = []
    else:
        users = []
    
    THRESHOLD = 0.02  # Umbral para determinar coincidencia
    recognized_user = None
    min_distance = float('inf')
    
    for user in users:
        user_landmarks = user.get('landmarks', [])
        if len(user_landmarks) != len(new_landmarks):
            continue
        dist = compute_distance(user_landmarks, new_landmarks)
        if dist < THRESHOLD and dist < min_distance:
            min_distance = dist
            recognized_user = user
    
    if recognized_user:
        return jsonify({
            'message': f"Usuario reconocido: {recognized_user['name']} (RUT: {recognized_user['rut']})",
            'user': recognized_user
        })
    else:
        return jsonify({'message': 'No se reconoció ningún usuario registrado.'})

@app.route('/')
def hello():
    return "¡Hola, Flask! API de Face Mesh"

if __name__ == '__main__':
    app.run(debug=True)
