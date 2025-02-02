import { useState } from 'react'
import FaceDetection from './components/Face.jsx'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (

      <div className="App">
      <h1>Reconocimiento Facial</h1>
      <FaceDetection />
    </div>
    
  )
}

export default App
