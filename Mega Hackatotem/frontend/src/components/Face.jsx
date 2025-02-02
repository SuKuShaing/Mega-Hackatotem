import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';

const FaceRecognition = () => {
  const videoRef = useRef();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [savedDescriptors, setSavedDescriptors] = useState({});
  const [cameraActive, setCameraActive] = useState(false);
  const [userName, setUserName] = useState('');

  // Cargar modelos
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '../models';
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Error al cargar modelos:", err);
      }
    };
    loadModels();
  }, []);

  // Activar cámara
  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: { width: 720, height: 560 } })
      .then(stream => {
        console.log('Stream obtenido:', stream);
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      })
      .catch(err => console.error("Error al acceder a la cámara:", err));
  };
  

  // Capturar descriptor de la persona actual y guardarlo
  const captureUser = async () => {
    if (!videoRef.current) return;
    const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (detection) {
      // Guardamos el descriptor en un objeto, por ejemplo:
      setSavedDescriptors(prev => ({
        ...prev,
        [userName]: detection.descriptor
      }));
      console.log(`Usuario ${userName} guardado`);
    } else {
      console.log("No se detectó ningún rostro.");
    }
  };

  // Reconocer rostro comparándolo con los guardados
  const recognizeUser = async () => {
    if (!videoRef.current || Object.keys(savedDescriptors).length === 0) return;
    const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (detection) {
      let bestMatch = { user: null, distance: Infinity };
      // Recorremos los descriptores guardados y comparamos
      for (const [user, descriptor] of Object.entries(savedDescriptors)) {
        const distance = faceapi.euclideanDistance(descriptor, detection.descriptor);
        if (distance < bestMatch.distance) {
          bestMatch = { user, distance };
        }
      }
      // Puedes definir un umbral, por ejemplo, 0.6 para considerar una buena coincidencia
      if (bestMatch.distance < 0.6) {
        console.log(`Rostro reconocido: ${bestMatch.user} (distancia: ${bestMatch.distance.toFixed(2)})`);
      } else {
        console.log("No se encontró coincidencia.");
      }
    } else {
      console.log("No se detectó ningún rostro para reconocer.");
    }
  };

  return (
    <div>
      <h2>Reconocimiento Facial basado en descriptores</h2>
      {modelsLoaded && !cameraActive && (
        <button onClick={startCamera}>Activar Cámara</button>
      )}
      {cameraActive && (
        <div>
          <div>
            <video
              ref={videoRef}
              autoPlay
              muted
              width="720"
              height="560"
              style={{ border: '1px solid black' }}
            />
          </div>
          <div>
            <input 
              type="text" 
              placeholder="Nombre de usuario" 
              value={userName}
              onChange={e => setUserName(e.target.value)}
            />
            <button onClick={captureUser}>Capturar y Guardar Rostro</button>
            <button onClick={recognizeUser}>Reconocer Rostro</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceRecognition;
