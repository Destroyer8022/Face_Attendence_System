import React from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Camera, FileText, Users, Sparkles } from 'lucide-react'

const Dashboard = () => {
  const navigate = useNavigate()

  const modules = [
    { title: 'Enrollment', desc: 'Neural biometric registration system', icon: <UserPlus size={24} />, path: '/registration' },
    { title: 'Scanner', desc: 'Active real-time recognition engine', icon: <Camera size={24} />, path: '/attendance' },
    { title: 'Analytics', desc: 'Secure database logs and reports', icon: <FileText size={24} />, path: '/reports' },
    { title: 'System', desc: 'Administrative record management', icon: <Users size={24} />, path: '/manage-students' }
  ]

  return (
    <div className="animate-fade-up">
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary-gold)', boxShadow: '0 0 10px var(--primary-gold)' }} />
          <span style={{ color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.7rem', letterSpacing: '0.2em' }}>SYSTEM OVERVIEW</span>
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '400', color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Welcome to <span className="shimmer-gold">Face Attnd</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', fontWeight: '300', lineHeight: '1.6' }}>
          Precision biometric security and attendance tracking for elite institutional management.
        </p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '2rem' 
      }}>
        {modules.map((m, i) => (
          <div 
            key={i} 
            className="glass-card" 
            style={{ padding: '2.5rem', cursor: 'pointer' }}
            onClick={() => navigate(m.path)}
          >
            <div style={{ 
              background: 'rgba(255,255,255,0.02)', 
              width: '48px', 
              height: '48px', 
              borderRadius: '0.75rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '1.5rem',
              color: 'var(--primary-gold)',
              border: '1px solid var(--glass-border)'
            }}>
              {m.icon}
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '400', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>{m.title}</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>{m.desc}</p>
            
            <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-gold)', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.1em' }}>
               OPEN MODULE <Sparkles size={14} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
