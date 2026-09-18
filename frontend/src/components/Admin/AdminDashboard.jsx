import React, { useState } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Shield, 
  Settings, 
  Users, 
  Sliders, 
  Mail, 
  CheckCircle2, 
  Building2, 
  TrendingUp, 
  Plus, 
  Ban, 
  Play, 
  Sparkles, 
  Globe, 
  Crown, 
  Cpu,
  Zap,
  DollarSign
} from 'lucide-react';

export const AdminDashboard = () => {
  const { systemConfig, updateConfig, licenses, addLicense, toggleLicense } = useClassroom();
  const { users } = useAuth();

  // Settings State
  const [similarityDefault, setSimilarityDefault] = useState(systemConfig.globalDefaultSimilarityThreshold || 15);
  const [autoEmail, setAutoEmail] = useState(systemConfig.autoEmailParents ?? true);
  const [saved, setSaved] = useState(false);

  // New License Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [instName, setInstName] = useState('');
  const [domainExt, setDomainExt] = useState('');
  const [priceInr, setPriceInr] = useState('49999');
  const [planType, setPlanType] = useState('Enterprise Tier');

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

  const handleCreateLicense = async (e) => {
    e.preventDefault();
    if (!instName || !domainExt) return;

    await addLicense({
      institutionName: instName,
      domainExtension: domainExt,
      planType: planType,
      priceInInr: Number(priceInr)
    });

    setInstName('');
    setDomainExt('');
    setPriceInr('49999');
    setShowAddModal(false);
  };

  // Calculations
  const activeLicensesCount = (licenses || []).filter(l => l.status === 'ACTIVE').length;
  const totalRevenueInr = (licenses || [])
    .filter(l => l.status === 'ACTIVE')
    .reduce((sum, l) => sum + (l.priceInInr || 0), 0);
  
  const mrrInr = Math.round(totalRevenueInr / 12);
  const teacherCount = users.filter(u => u.role === 'TEACHER').length;
  const studentCount = users.filter(u => u.role === 'STUDENT').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))', 
        padding: '1.75rem', 
        borderRadius: '16px',
        border: '1px solid rgba(168, 85, 247, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <Crown color="var(--accent-purple)" size={28} />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
              SaaS Business Management & Domain Licensing Hub
            </h2>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
            Institutional subscription metrics, B2B domain whitelist engine, and AI grading tier controls.
          </p>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={() => setShowAddModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.2rem', fontWeight: 700 }}
        >
          <Plus size={18} /> Add Institutional License
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-success)', fontWeight: 800, fontSize: '1.2rem' }}>
            ₹
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Annual Revenue (ARR)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-success)' }}>
              ₹{totalRevenueInr.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Est. MRR</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
              ₹{mrrInr.toLocaleString('en-IN')}/mo
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-purple)' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active B2B Subscriptions</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
              {activeLicensesCount} Institutions
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-warning)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Platform Users</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-warning)' }}>
              {users.length} ({teacherCount} Teachers, {studentCount} Students)
            </div>
          </div>
        </div>

      </div>

      {/* B2B Domain Whitelist Section */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe color="var(--accent-blue)" size={20} /> Institutional Domain License Whitelist
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
              Email domain registrations matching these active licenses automatically receive enterprise AI access.
            </p>
          </div>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowAddModal(true)}
            style={{ fontSize: '0.85rem' }}
          >
            + New Domain License
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Institution Name</th>
                <th>Domain Extension</th>
                <th>Pricing Tier</th>
                <th>Annual Fee (₹ INR)</th>
                <th>AI Services Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(licenses || []).map((lic) => {
                const isActive = lic.status === 'ACTIVE';
                return (
                  <tr key={lic.id || lic.domainExtension}>
                    <td style={{ fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Building2 size={16} color="var(--accent-purple)" />
                        {lic.institutionName}
                      </div>
                    </td>
                    <td>
                      <code style={{ 
                        background: 'rgba(99, 102, 241, 0.1)', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '6px', 
                        color: 'var(--accent-blue)',
                        fontWeight: 600 
                      }}>
                        @{lic.domainExtension.replace('@', '')}
                      </code>
                    </td>
                    <td>
                      <span className="badge badge-info">{lic.planType || 'Enterprise Tier'}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--status-success)' }}>
                      ₹{(lic.priceInInr || 49999).toLocaleString('en-IN')}/yr
                    </td>
                    <td>
                      {isActive ? (
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle2 size={12} /> AI Unlocked
                        </span>
                      ) : (
                        <span className="badge badge-error" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Ban size={12} /> Suspended
                        </span>
                      )}
                    </td>
                    <td>
                      <button 
                        className={`btn ${isActive ? 'btn-danger' : 'btn-primary'}`}
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        onClick={() => toggleLicense(lic.id)}
                      >
                        {isActive ? <><Ban size={12} /> Suspend</> : <><Play size={12} /> Activate</>}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {(licenses || []).length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No institutional domain licenses configured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Pricing Tiers Showcase */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles color="var(--accent-purple)" size={20} /> SaaS Monetization & Subscription Tiers
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          
          {/* Tier 1 */}
          <div className="glass-card" style={{ borderTop: '4px solid var(--text-muted)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Basic Tier</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0' }}>₹0 <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/ month</span></div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minHeight: '40px' }}>
              Free standard LMS access for individual tutors and students.
            </p>
            <hr style={{ borderColor: 'var(--border-color)', margin: '1rem 0' }} />
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Up to 2 active classrooms</li>
              <li>Standard assignment submission</li>
              <li>Manual teacher grading only</li>
              <li>Basic performance analytics</li>
            </ul>
          </div>

          {/* Tier 2 */}
          <div className="glass-card" style={{ borderTop: '4px solid var(--accent-blue)', position: 'relative' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-blue)' }}>Pro Teacher Tier</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0' }}>₹999 <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/ month</span></div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minHeight: '40px' }}>
              For power educators wanting automated AI grading & integrity scans.
            </p>
            <hr style={{ borderColor: 'var(--border-color)', margin: '1rem 0' }} />
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Unlimited classrooms & students</li>
              <li>AI Automated Essay & Code Grading</li>
              <li>Plagiarism similarity analysis</li>
              <li>Individual student deadline extensions</li>
            </ul>
          </div>

          {/* Tier 3 */}
          <div className="glass-card" style={{ borderTop: '4px solid var(--accent-purple)', background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.08), transparent)' }}>
            <div className="badge badge-purple" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>POPULAR</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-purple)' }}>Enterprise Institution</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0', color: 'var(--accent-purple)' }}>₹49,999 <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/ year</span></div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minHeight: '40px' }}>
              Full institutional site-wide license with auto domain verification.
            </p>
            <hr style={{ borderColor: 'var(--border-color)', margin: '1rem 0' }} />
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Whole-campus `@domain.edu` auto-unlock</li>
              <li>Unlimited Gemini 3.5 Pro AI Grading Tokens</li>
              <li>Parent Guardian Notification engine</li>
              <li>Dedicated SLA & Custom Integration</li>
            </ul>
          </div>

        </div>
      </div>

      {/* Global AI Policy & User Directory Grid */}
      <div className="grid-2">
        
        {/* Global Policy Configuration Card */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Settings size={18} color="var(--accent-blue)" /> Academic Integrity & AI Policy Controls
          </h3>

          {saved && (
            <div className="badge badge-success" style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', textTransform: 'none', justifyContent: 'center' }}>
              <CheckCircle2 size={14} /> System Policy Saved!
            </div>
          )}

          <form onSubmit={handleSaveSettings}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sliders size={14} color="var(--status-warning)" /> Default Similarity Threshold (%)
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
                Applied as initial default for similarity detection.
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
                Automated Parent Email Alerts (Low Score & Missed Work)
              </label>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">AI Grading Model Allocation</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.8rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 600 }}>
                <Cpu size={16} color="var(--accent-purple)" />
                {systemConfig.aiModelProvider || 'Gemini 3.5 Pro Enterprise Engine'}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Save Policy Changes
            </button>
          </form>
        </div>

        {/* User Directory Table */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Users size={18} color="var(--accent-purple)" /> Platform User Directory
          </h3>

          <div className="table-container" style={{ maxHeight: '320px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>License Tier</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const domain = u.email ? u.email.split('@')[1] : '';
                  const matchingLic = (licenses || []).find(l => l.domainExtension && l.domainExtension.toLowerCase().replace('@', '') === domain?.toLowerCase());
                  const isEnterprise = matchingLic && matchingLic.status === 'ACTIVE';

                  return (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 700 }}>{u.name}</td>
                      <td>
                        <span className={`badge ${u.role === 'TEACHER' ? 'badge-purple' : u.role === 'ADMIN' ? 'badge-info' : 'badge-success'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{u.email}</td>
                      <td>
                        {isEnterprise ? (
                          <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                            Enterprise ({matchingLic.institutionName.substring(0, 10)}...)
                          </span>
                        ) : (
                          <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                            Standard
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Add License Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', margin: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 color="var(--accent-purple)" size={22} /> Add Institution B2B Subscription
            </h3>

            <form onSubmit={handleCreateLicense} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div className="form-group">
                <label className="form-label">Institution Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Veermata Jijabai Technological Institute" 
                  value={instName}
                  onChange={e => setInstName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Domain Extension (Whitelisted Domain)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. vjti.ac.in or vit.edu" 
                  value={domainExt}
                  onChange={e => setDomainExt(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Users registering with @{domainExt || 'domain.edu'} will automatically get enterprise AI unlocked.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Annual Subscription Price (₹ INR)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={priceInr}
                  onChange={e => setPriceInr(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subscription Tier</label>
                <select 
                  className="form-input" 
                  value={planType} 
                  onChange={e => setPlanType(e.target.value)}
                >
                  <option value="Enterprise Tier">Enterprise Tier (Full AI Access)</option>
                  <option value="Pro Campus Tier">Pro Campus Tier</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Institutional Subscription
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
