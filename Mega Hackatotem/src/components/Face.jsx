import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';

const FaceDetection = () => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  // Cargar los modelos al montar el componente
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + '/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
    };
    loadModels();
  }, []);

  // Función para activar la cámara al presionar el botón
  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      })
      .catch(err => console.error("Error al acceder a la cámara:", err));
  };

  // Función que se ejecuta cuando el video empieza a reproducirse
  const handleVideoOnPlay = () => {
    const interval = setInterval(async () => {
      if (videoRef.current && canvasRef.current) {
        const displaySize = {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        };
        faceapi.matchDimensions(canvasRef.current, displaySize);
        const detections = await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks().withFaceExpressions();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const context = canvasRef.current.getContext('2d');
        context.clearRect(0, 0, displaySize.width, displaySize.height);
        faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
      }
    }, 100);

    return () => clearInterval(interval);
  };

  return (
    <div>
      {/* Si los modelos están cargados pero la cámara no está activa, muestra el botón */}
      {modelsLoaded && !cameraActive && (
        <button onClick={startCamera}>Activar Cámara</button>
      )}
      <div style={{ position: 'relative', width: '720px', height: '560px' }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          width="720"
          height="560"
          onPlay={handleVideoOnPlay}
          style={{ position: 'absolute' }}
        />
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute' }}
        />
      </div>
    </div>
  );
};

export default FaceDetection;
