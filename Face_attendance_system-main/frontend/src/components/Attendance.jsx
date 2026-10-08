import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { Camera, UserCheck, Cpu, ShieldCheck } from 'lucide-react'

const Attendance = () => {
  const [recognitions, setRecognitions] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    startCamera()
    const interval = setInterval(processCurrentFrame, 600)
    return () => {
      stopCamera()
      clearInterval(interval)
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch (err) {
      console.error('Sensor error')
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop())
    }
  }

  const processCurrentFrame = async () => {
    if (isProcessing || !videoRef.current || !canvasRef.current) return
    
    setIsProcessing(true)
    const canvas = canvasRef.current
    const video = videoRef.current
    
    if (video.readyState === 4) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)
      
      const imgData = canvas.toDataURL('image/jpeg', 0.6)
      
      try {
        const formData = new FormData()
        formData.append('image', imgData)
        const response = await axios.post('http://localhost:8000/process-frame', formData)
        if (response.data.status === 'success') {
          setRecognitions(response.data.results)
        }
      } catch (err) {
        console.error('Sequence error')
      }
    }
    setIsProcessing(false)
  }

  return (
    <div className="animate-fade-up">
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '400', color: 'var(--text-primary)' }}>
          Active <span className="shimmer-gold">Scanner</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '300' }}>Real-time neural recognition engine monitoring biometric stream.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '0.75rem', position: 'relative', minHeight: '400px' }}>
          <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', minHeight: '400px', objectFit: 'cover', borderRadius: '0.75rem', background: '#050505' }} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {recognitions.map((res, i) => {
            const [x, y, w, h] = res.box
            const videoEl = videoRef.current
            if (!videoEl) return null
            const scaleX = videoEl.clientWidth / videoEl.videoWidth
            const scaleY = videoEl.clientHeight / videoEl.videoHeight
            
            return (
              <div key={i} style={{
                position: 'absolute',
                left: x * scaleX + 12,
                top: y * scaleY + 12,
                width: w * scaleX,
                height: h * scaleY,
                border: `1px solid ${res.name === 'Unknown' ? 'var(--danger)' : 'var(--primary-gold)'}`,
                boxShadow: `0 0 20px ${res.name === 'Unknown' ? 'rgba(192, 57, 43, 0.3)' : 'rgba(201, 168, 76, 0.3)'}`,
                borderRadius: '4px',
                pointerEvents: 'none'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-24px',
                  left: '-1px',
                  background: res.name === 'Unknown' ? 'var(--danger)' : 'var(--primary-gold)',
                  color: '#0A0A0A',
                  padding: '2px 8px',
                  fontSize: '0.6rem',
                  fontWeight: '700',
                  borderRadius: '4px 4px 0 0',
                  whiteSpace: 'nowrap',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {res.name} {res.attendance_marked ? '• VERIFIED' : ''}
                </div>
              </div>
            )
          })}
        </div>

        <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ marginBottom: '2rem', fontSize: '1.75rem', fontWeight: '400', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Cpu size={24} color="var(--primary-gold)" /> Live Feed
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto', maxHeight: '300px', paddingRight: '0.5rem' }}>
            {recognitions.filter(r => r.name !== 'Unknown').length === 0 ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', opacity: 0.3 }}>
                <Camera size={40} style={{ marginBottom: '1rem' }} />
                <p style={{ fontSize: '0.8rem', letterSpacing: '0.1em' }}>WAITING FOR DATA...</p>
              </div>
            ) : (
              recognitions.filter(r => r.name !== 'Unknown').map((res, i) => (
                <div key={i} className="animate-fade-up" style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  padding: '1.2rem', 
                  borderRadius: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid var(--glass-border)'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '1.2rem', fontFamily: "'Cormorant Garamond', serif" }}>{res.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--primary-gold)', marginTop: '0.2rem', letterSpacing: '0.1em' }}>S-ID: {res.student_id}</div>
                  </div>
                  <div style={{ color: 'var(--primary-gold)', background: 'rgba(201, 168, 76, 0.1)', padding: '0.4rem', borderRadius: '0.4rem' }}>
                     <UserCheck size={18} />
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div style={{ marginTop: '2.5rem' }}>
             <div style={{ background: '#1A1A1A', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--glass-border)' }}>
                <h4 style={{ fontSize: '0.75rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-gold)' }}>
                   <ShieldCheck size={16} /> NEURAL VERIFICATION ACTIVE
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                   Matches are cryptographically logged against the SQL obsidian vault.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Attendance
