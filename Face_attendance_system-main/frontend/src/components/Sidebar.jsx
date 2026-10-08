import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, UserPlus, Camera, FileText, Users, LogOut, Shield } from 'lucide-react'

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate()

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <UserPlus size={18} />, label: 'Registration', path: '/registration' },
    { icon: <Camera size={18} />, label: 'Attendance', path: '/attendance' },
    { icon: <FileText size={18} />, label: 'Reports', path: '/reports' },
    { icon: <Users size={18} />, label: 'Manage Students', path: '/manage-students' },
  ]

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3.5rem', padding: '0 0.5rem' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #C9A84C, #F0C040)', 
          padding: '0.6rem', 
          borderRadius: '0.6rem',
          boxShadow: '0 5px 15px rgba(201, 168, 76, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Shield color="#0A0A0A" size={20} fill="#0A0A0A" />
        </div>
        <h1 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '700', 
          letterSpacing: '0.05em', 
          color: 'var(--text-primary)',
          fontFamily: "'Cormorant Garamond', serif"
        }}>
          FACE <span style={{ color: 'var(--primary-gold)' }}>ATTND</span>
        </h1>
      </div>

      <nav>
        {navItems.map((item, index) => (
          <NavLink 
            key={index} 
            to={item.path} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span style={{ fontSize: '0.85rem', letterSpacing: '0.03em' }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ position: 'absolute', bottom: '2rem', left: '1.5rem', right: '1.5rem' }}>
        <button 
          onClick={handleLogout}
          className="nav-item" 
          style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <LogOut size={18} />
          <span style={{ fontSize: '0.85rem' }}>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
