import React, { useState } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { useAuth } from '../../context/AuthContext';
import { Shield, Settings, Users, Sliders, Mail, CheckCircle2 } from 'lucide-react';

export const AdminDashboard = () => {
  const { systemConfig, updateConfig } = useClassroom();
  const { users } = useAuth();

  const [similarityDefault, setSimilarityDefault] = useState(systemConfig.globalDefaultSimilarityThreshold || 15);
  const [autoEmail, setAutoEmail] = useState(systemConfig.autoEmailParents ?? true);
  const [saved, setSaved] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateConfig({
      ...systemConfig,
      globalDefaultSimilarityThreshold: Number(similarityDefault),
      autoEmailParents: autoEmail
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Title */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield color="var(--accent-purple)" size={24} />
          System Administration & Governance Portal
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          System-level settings, academic integrity policies, and user role management.
        </p>
      </div>

      <div className="grid-2">
        
        {/* Global Policy Configuration Card */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Settings size={18} color="var(--accent-blue)" /> Academic Integrity & System Policies
          </h3>

          {saved && (
            <div className="badge badge-success" style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', textTransform: 'none', justifyContent: 'center' }}>
              <CheckCircle2 size={14} /> System Policy Configuration Saved!
            </div>
          )}

          <form onSubmit={handleSaveSettings}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sliders size={14} color="var(--status-warning)" /> Default Institution Similarity Threshold (%)
              </label>
              <input 
                type="number" 
                className="form-input" 
                value={similarityDefault} 
                onChange={e => setSimilarityDefault(e.target.value)}
                min="0"
                max="100"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Applied as initial default whenever a teacher creates a new assignment.
              </span>
            </div>

            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
              <input 
                type="checkbox" 
                id="autoEmail"
                checked={autoEmail} 
                onChange={e => setAutoEmail(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="autoEmail" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
                Automated Parent/Guardian Email Alerts (Low Score & Missed Work)
              </label>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">AI Grading Model Provider</label>
              <input type="text" className="form-input" value={systemConfig.aiModelProvider || 'Gemini 3.5 Pro'} disabled />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Save Policy Changes
            </button>
          </form>
        </div>

        {/* User Directory Table */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Users size={18} color="var(--accent-purple)" /> User Directory & Parent Associations
          </h3>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Parent / Guardian Link</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 700 }}>{u.name}</td>
                    <td>
                      <span className={`badge ${u.role === 'TEACHER' ? 'badge-purple' : u.role === 'ADMIN' ? 'badge-info' : 'badge-success'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{u.email}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {u.parentEmail ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-blue)' }}>
                          <Mail size={12} /> {u.parentEmail}
                        </span>
                      ) : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
