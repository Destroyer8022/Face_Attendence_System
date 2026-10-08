import React, { useState } from 'react'
import axios from 'axios'
import { LogIn, Shield, Loader2 } from 'lucide-react'

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const formData = new FormData()
      formData.append('username', username)
      formData.append('password', password)
      
      const response = await axios.post('http://localhost:8000/login', formData)
      if (response.data.status === 'success') {
        onLogin()
      }
    } catch (err) {
      setError('Access Denied: Invalid Authorization')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
      <div className="glass-card animate-fade-up" style={{ width: '100%', maxWidth: '480px', padding: '5rem 4rem', background: '#0F0F0F' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ 
            background: 'var(--gold-gradient)', 
            width: '80px', height: '80px', 
            borderRadius: '1.25rem', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '2rem',
            boxShadow: '0 10px 30px rgba(201, 168, 76, 0.3)'
          }}>
            <Shield color="#0A0A0A" size={40} fill="#0A0A0A" />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '400', letterSpacing: '0.02em' }}>FACE <span className="shimmer-gold">ATTND</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.75rem', fontWeight: '300', letterSpacing: '0.1em' }}>NEURAL IDENTITY PORTAL</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <label>IDENTIFIER</label>
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group" style={{ marginBottom: '3.5rem' }}>
            <label>SECRET ACCESS KEY</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: '0.9rem', marginBottom: '2rem', textAlign: 'center', fontWeight: '600' }}>{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '3.5rem' }} disabled={loading}>
            {loading ? <Loader2 className="spin" size={20} /> : <><LogIn size={18} /> AUTHORIZE ENTRY</>}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
