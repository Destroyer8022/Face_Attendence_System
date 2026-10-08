import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { User, Trash2, Edit3, Check, X, Search, Database, Users } from 'lucide-react'

const ManageStudents = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:8000/students')
      setStudents(response.data.students)
    } catch (err) {
      console.error('Database sync error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (sid) => {
    if (window.confirm('IRREVERSIBLE: Purge this identity from the obsidian database?')) {
      try {
        await axios.delete(`http://localhost:8000/students/${encodeURIComponent(sid)}`)
        setStudents(students.filter(s => s.student_id !== sid))
      } catch (err) {
        alert('Purge sequence failed')
      }
    }
  }

  const startEdit = (student) => {
    setEditingId(student.student_id)
    setEditName(student.name)
  }

  const saveEdit = async (sid) => {
    try {
      await axios.put(`http://localhost:8000/students/${encodeURIComponent(sid)}`, { name: editName })
      setStudents(students.map(s => s.student_id === sid ? { ...s, name: editName } : s))
      setEditingId(null)
    } catch (err) {
      alert('Credential update failed')
    }
  }

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="animate-fade-up">
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: '400', color: 'var(--text-primary)' }}>
            Manage <span className="shimmer-gold">Students</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '300', marginTop: '0.5rem' }}>
            Administrative oversight and identity record control.
          </p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-gold)' }} />
          <input 
            type="text" 
            placeholder="Search obsidian records..." 
            className="input-group input pill-search" 
            style={{ width: '100%', minWidth: '300px', maxWidth: '380px', paddingLeft: '3.5rem', background: '#0F0F0F', border: '1px solid var(--glass-border)', color: 'white', height: '3.5rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="glass-card table-container" style={{ background: '#0F0F0F' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
          <thead>
            <tr style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.2em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <th style={{ padding: '1.5rem 2rem' }}>IDENTIFIER</th>
              <th style={{ padding: '1.5rem 2rem' }}>FULL IDENTITY</th>
              <th style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>CONTROL</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '0.1em' }}>SYNCHRONIZING WITH SYSTEM...</td></tr>
            ) : filteredStudents.length === 0 ? (
              <tr><td colSpan="3" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>NO MATCHING RECORDS FOUND</td></tr>
            ) : filteredStudents.map((s) => (
              <tr key={s.student_id} className="razor-divider row-sweep">
                <td style={{ padding: '1.2rem 2rem', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}>{s.student_id}</td>
                <td style={{ padding: '1.2rem 2rem' }}>
                  {editingId === s.student_id ? (
                    <input 
                      type="text" 
                      className="input" 
                      style={{ background: '#1A1A1A', border: '1px solid var(--primary-gold)', color: 'white', padding: '0.5rem 1rem', width: '250px', borderRadius: '0.5rem' }}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <span style={{ fontWeight: '500', fontSize: '1.1rem', color: 'var(--text-primary)', fontFamily: "'Cormorant Garamond', serif" }}>{s.name}</span>
                  )}
                </td>
                <td style={{ padding: '1.2rem 2rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    {editingId === s.student_id ? (
                      <>
                        <button className="action-circle" onClick={() => saveEdit(s.student_id)} title="Save Changes">
                          <Check size={16} />
                        </button>
                        <button className="action-circle" onClick={() => setEditingId(null)} title="Cancel">
                          <X size={16} color="var(--text-muted)" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="action-circle" onClick={() => startEdit(s)} title="Edit Identity">
                          <Edit3 size={16} />
                        </button>
                        <button className="action-circle danger" onClick={() => handleDelete(s.student_id)} title="Purge Record">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '500' }}>
         <div style={{ color: 'var(--primary-gold)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <Users size={18} />
           <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{students.length}</span>
         </div>
         <span style={{ letterSpacing: '0.05em' }}>TOTAL IDENTITIES REGISTERED</span>
      </footer>
    </div>
  )
}

export default ManageStudents
