import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { Camera, Loader2, Sparkles, AlertCircle, Scan } from 'lucide-react'

const Registration = () => {
  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [capturing, setCapturing] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const capturedImages = useRef([])

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch (err) {
      setError('Neural sensor offline. Verify camera connection.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop())
    }
  }

  const startRegistrationProcess = () => {
    if (!name || !studentId) {
      setError('Please provide identity credentials.')
      return
    }
    setError('')
    setSuccess('')
    setCountdown(3)
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleCapture()
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleCapture = async () => {
    setCapturing(true)
    capturedImages.current = []
    
    const totalSamples = 50
    for (let i = 0; i < totalSamples; i++) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)
      
      const imgData = canvas.toDataURL('image/jpeg', 0.8)
      capturedImages.current.push(imgData)
      setProgress(Math.round(((i + 1) / totalSamples) * 100))
      
      await new Promise(r => setTimeout(r, 60))
    }

    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('student_id', studentId.trim())
      capturedImages.current.forEach(img => formData.append('images', img))
      
      const response = await axios.post('http://localhost:8000/register', formData)
      if (response.data.status === 'success') {
        setSuccess(response.data.message)
        setName('')
        setStudentId('')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration sequence interrupted.')
    } finally {
      setCapturing(false)
      setProgress(0)
    }
  }

  return (
    <div className="animate-fade-up">
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '400', color: 'var(--text-primary)' }}>
          Biometric <span className="shimmer-gold">Enrollment</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '300' }}>Register neural identity signatures in the obsidian database.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <div className="input-group" style={{ marginBottom: '1.5rem' }}>
            <label>IDENTITY NAME</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full legal name" disabled={capturing} />
          </div>
          <div className="input-group" style={{ marginBottom: '2.5rem' }}>
            <label>SYSTEM IDENTIFIER</label>
            <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e.g. ID-2024-001" disabled={capturing} />
          </div>
          
          {error && <div style={{ 
            color: 'var(--danger)', 
            marginBottom: '1.5rem', 
            fontSize: '0.8rem', 
            padding: '1rem', 
            background: 'rgba(192, 57, 43, 0.05)', 
            borderRadius: '0.75rem',
            border: '1px solid rgba(192, 57, 43, 0.2)',
            display: 'flex', gap: '0.75rem'
          }}>
            <AlertCircle size={16} /> {error}
          </div>}
          
          {success && <div style={{ 
            color: 'var(--primary-gold)', 
            marginBottom: '1.5rem', 
            fontSize: '0.8rem', 
            padding: '1rem', 
            background: 'rgba(201, 168, 76, 0.05)', 
            borderRadius: '0.75rem',
            border: '1px solid var(--glass-border)',
            display: 'flex', gap: '0.75rem'
          }}>
            <Sparkles size={16} /> {success}
          </div>}

          <button className="btn btn-primary" style={{ width: '100%', height: '3.5rem' }} onClick={startRegistrationProcess} disabled={capturing || countdown !== null}>
            {capturing ? <><Loader2 className="spin" size={18} /> PROCESSING {progress}%</> : countdown ? `INITIALIZING IN ${countdown}...` : <><Scan size={18} /> INITIALIZE SCAN</>}
          </button>
        </div>

        <div className="glass-card" style={{ padding: '0.75rem', position: 'relative', minHeight: '400px' }}>
          <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', minHeight: '400px', objectFit: 'cover', borderRadius: '0.75rem', background: '#050505', border: '1px solid #1A1A1A' }} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {countdown && (
             <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '8rem', fontWeight: '700', color: 'white', textShadow: '0 0 40px rgba(201, 168, 76, 0.5)', fontFamily: "'Cormorant Garamond', serif" }}>
                {countdown}
             </div>
          )}
          
          {capturing && (
            <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', right: '0.75rem', bottom: '0.75rem', pointerEvents: 'none' }}>
               <div style={{ position: 'absolute', top: `${progress}%`, left: '0', right: '0', height: '3px', background: 'var(--primary-gold)', boxShadow: '0 0 25px var(--primary-gold)', transition: 'top 0.1s linear' }} />
               <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '1px solid var(--primary-gold)', opacity: 0.2, borderRadius: '0.75rem' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Registration
