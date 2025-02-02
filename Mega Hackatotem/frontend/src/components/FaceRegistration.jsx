import React, { useRef, useState, useEffect } from 'react';

const FaceRegistration = () => {
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [name, setName] = useState('');
  const [rut, setRut] = useState('');
  const [recognizedUser, setRecognizedUser] = useState(null);

  // Activar la cámara al montar el componente
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err) {
        console.error("Error al acceder a la cámara:", err);
      }
    };
    startCamera();
  }, []);

  // Función para capturar un frame del video y convertirlo a un canvas
  const captureFrame = () => {
    if (!videoRef.current) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas;
  };

  // Función para registrar al usuario (llama al endpoint /detect)
  // En este flujo, el registro se realiza "detrás de escenas" sin mostrar la respuesta en pantalla.
  const registerUser = async () => {
    const canvas = captureFrame();
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('image', blob, 'frame.jpg');
      // El rut se usará como identificador
      formData.append('name', name);
      formData.append('rut', rut);
      try {
        await fetch('http://127.0.0.1:5000/detect', {
          method: 'POST',
          body: formData,
        });
        alert("Usuario registrado exitosamente (en backend).");
      } catch (err) {
        console.error("Error al registrar el usuario:", err);
      }
    }, 'image/jpeg');
  };

  // Función para reconocer al usuario (llama al endpoint /recognize)
  // La respuesta se mostrará en una sección separada.
  const recognizeUser = async () => {
    const canvas = captureFrame();
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('image', blob, 'frame.jpg');
      try {
        const response = await fetch('http://127.0.0.1:5000/recognize', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        setRecognizedUser(data);
      } catch (err) {
        console.error("Error al reconocer el usuario:", err);
      }
    }, 'image/jpeg');
  };

  return (
    <div>
      <h2>Registro y Reconocimiento Facial</h2>
      <div>
        <video
          ref={videoRef}
          autoPlay
          muted
          style={{ width: '640px', height: '480px', border: '1px solid black' }}
        />
      </div>
      <div style={{ marginTop: '20px' }}>
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <input
          type="text"
          placeholder="RUT"
          value={rut}
          onChange={(e) => setRut(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <button onClick={registerUser} style={{ marginRight: '10px' }}>
          Registrar Usuario
        </button>
        <button onClick={recognizeUser}>Reconocer Usuario</button>
      </div>
      {/* Sección separada para mostrar la información del usuario reconocido */}
      {recognizedUser && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid green' }}>
          <h3>Usuario Reconocido</h3>
          {recognizedUser.user ? (
            <div>
              <p><strong>Nombre:</strong> {recognizedUser.user.name}</p>
              <p><strong>RUT:</strong> {recognizedUser.user.rut}</p>
              <p><strong>Mensaje:</strong> {recognizedUser.message}</p>
            </div>
          ) : (
            <p>{recognizedUser.message}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FaceRegistration;
