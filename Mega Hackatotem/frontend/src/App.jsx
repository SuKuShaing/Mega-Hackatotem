import React, { useState, useEffect } from 'react';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Asegúrate de que la URL corresponda a la dirección y puerto donde se ejecuta Flask
    fetch('http://127.0.0.1:5000/')
      .then(response => response.text())
      .then(data => {
        setMessage(data);
      })
      .catch(err => console.error("Error al conectar con Flask:", err));
  }, []);

  return (
    <div className="App">
      <h1>Mensaje desde Flask:</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
