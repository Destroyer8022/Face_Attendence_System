import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, FileText, Calendar, Clock, ShieldCheck, Database } from 'lucide-react'

const Reports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await axios.get('http://localhost:8000/reports')
      if (response.data.status === 'success') {
        setReports(response.data.reports)
      }
    } catch (err) {
      console.error('Data retrieval failure')
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = reports.filter(r => 
    r.NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.DATE.includes(searchTerm)
  )

  return (
    <div className="animate-fade-up">
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: '400', color: 'var(--text-primary)' }}>
            System <span className="shimmer-gold">Analytics</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '300', marginTop: '0.5rem' }}>
            Historical audit logs from the obsidian biometric vault.
          </p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-gold)' }} />
          <input 
            type="text" 
            placeholder="Filter obsidian logs..." 
            className="input-group input pill-search" 
            style={{ width: '100%', minWidth: '300px', maxWidth: '380px', paddingLeft: '3.5rem', background: '#0F0F0F', border: '1px solid var(--glass-border)', color: 'white', height: '3.5rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
         {[
           { label: 'TOTAL LOGS', val: reports.length, icon: <Database size={20} /> },
           { label: 'IDENTITIES', val: new Set(reports.map(r => r.NAME)).size, icon: <ShieldCheck size={20} /> },
           { label: 'RELIABILITY', val: '99.9%', icon: <FileText size={20} /> }
         ].map((s, i) => (
           <div key={i} className="glass-card" style={{ padding: '1.5rem 2rem', background: '#0F0F0F', borderTop: '2px solid var(--primary-gold)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                {s.icon} {s.label}
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '400', fontFamily: "'Cormorant Garamond', serif" }}>{s.val}</div>
           </div>
         ))}
      </div>

      <div className="glass-card table-container" style={{ background: '#0F0F0F' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead>
            <tr style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.2em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <th style={{ padding: '1.5rem 2rem' }}>BIOMETRIC IDENTITY</th>
              <th style={{ padding: '1.5rem 2rem' }}>DATE</th>
              <th style={{ padding: '1.5rem 2rem' }}>TIMESTAMP</th>
              <th style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>VERIFICATION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '0.1em' }}>RETRIEVING AUDIT TRAIL...</td></tr>
            ) : filteredReports.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>NO RECORDS FOUND</td></tr>
            ) : filteredReports.map((r, i) => (
              <tr key={i} className="razor-divider row-sweep">
                <td style={{ padding: '1.2rem 2rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ background: 'rgba(201, 168, 76, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}><ShieldCheck size={16} color="var(--primary-gold)" /></div>
                      <span style={{ fontWeight: '500', fontSize: '1.1rem', color: 'var(--text-primary)', fontFamily: "'Cormorant Garamond', serif" }}>{r.NAME}</span>
                   </div>
                </td>
                <td style={{ padding: '1.2rem 2rem', color: 'var(--text-muted)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                      <Calendar size={14} /> {r.DATE}
                   </div>
                </td>
                <td style={{ padding: '1.2rem 2rem', color: 'var(--text-muted)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                      <Clock size={14} /> {r.TIME}
                   </div>
                </td>
                <td style={{ padding: '1.2rem 2rem', textAlign: 'right' }}>
                  <span style={{ 
                    border: '1px solid var(--primary-gold)', 
                    color: 'var(--primary-gold)', 
                    padding: '0.3rem 0.8rem', 
                    borderRadius: '0.4rem', 
                    fontSize: '0.65rem', 
                    fontWeight: '700',
                    letterSpacing: '0.1em',
                    background: 'rgba(201, 168, 76, 0.05)'
                  }}>VERIFIED</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Reports
