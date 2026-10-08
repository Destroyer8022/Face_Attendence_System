import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './styles/main.css'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Registration from './components/Registration'
import Attendance from './components/Attendance'
import Reports from './components/Reports'
import ManageStudents from './components/ManageStudents'
import Sidebar from './components/Sidebar'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const PrivateLayout = ({ children }) => (
    <div style={{ display: 'flex' }}>
      <Sidebar onLogout={() => setIsAuthenticated(false)} />
      <main className="main-content">
        {children}
      </main>
    </div>
  )

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={() => setIsAuthenticated(true)} />} 
          />
          
          <Route path="/dashboard" element={isAuthenticated ? <PrivateLayout><Dashboard /></PrivateLayout> : <Navigate to="/login" />} />
          <Route path="/registration" element={isAuthenticated ? <PrivateLayout><Registration /></PrivateLayout> : <Navigate to="/login" />} />
          <Route path="/attendance" element={isAuthenticated ? <PrivateLayout><Attendance /></PrivateLayout> : <Navigate to="/login" />} />
          <Route path="/reports" element={isAuthenticated ? <PrivateLayout><Reports /></PrivateLayout> : <Navigate to="/login" />} />
          <Route path="/manage-students" element={isAuthenticated ? <PrivateLayout><ManageStudents /></PrivateLayout> : <Navigate to="/login" />} />
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
