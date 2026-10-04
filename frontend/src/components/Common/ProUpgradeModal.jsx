import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';
import { Sparkles, Crown, CheckCircle2, Building2, Zap, ArrowRight, X } from 'lucide-react';

export default function ProUpgradeModal({ isOpen, onClose, featureName, onNavigateBilling }) {
  const { currentUser, updateUserProfile, licenses, isProUser, getRemainingAiCredits } = useAuth();
  const [instDomain, setInstDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const isPro = isProUser(currentUser);
  const remainingCredits = getRemainingAiCredits(currentUser);

  const handleQuickUpgrade = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await new Promise(res => setTimeout(res, 600));
      await updateUserProfile({ planType: 'INDIVIDUAL_PRO' });
      setMessage({ type: 'success', text: '🎉 Subscribed to Individual Pro Plan! Features unlocked.' });
      setTimeout(() => {
        onClose();
        setMessage(null);
      }, 1500);
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to process upgrade.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDomain = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const input = instDomain.trim().toLowerCase().replace('@', '');
    const userDomain = (currentUser?.email || '').split('@')[1]?.toLowerCase() || '';
    const checkDomain = input || userDomain;

    if (!checkDomain) {
      setMessage({ type: 'error', text: 'Please enter a valid institutional domain (e.g., university.edu).' });
      setLoading(false);
      return;
    }

    try {
      const activeLicenses = licenses && licenses.length > 0 ? licenses : await ApiService.getLicenses();
      const matched = (activeLicenses || []).find(l => 
        l.domainExtension.toLowerCase().replace('@', '') === checkDomain && 
        (l.status === 'ACTIVE' && l.aiServicesAllowed !== false)
      );

      if (matched) {
        await updateUserProfile({ planType: 'INSTITUTIONAL_ENTERPRISE', hasClaimedInstitutionalBenefit: true });
        setMessage({ type: 'success', text: `✨ Verified Enterprise License for ${matched.institutionName}!` });
        setTimeout(() => {
          onClose();
          setMessage(null);
        }, 1800);
      } else {
        setMessage({ 
          type: 'error', 
          text: `No active Enterprise license found for '${checkDomain}' in database.` 
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error verifying domain.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full text-slate-100 overflow-hidden relative">
        
        {/* Compact Glowing Header */}
        <div className="bg-gradient-to-r from-amber-500/20 via-indigo-600/30 to-purple-600/20 p-5 border-b border-slate-700/60 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Zap size={16} />
            </span>
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
              {isPro ? 'Teacher Software License Active' : '🔒 Software License Required'}
            </span>
          </div>

          <h3 className="text-xl font-extrabold text-white">
            {featureName ? `Unlock ${featureName}` : 'Educator & Institution Pro Features'}
          </h3>
          <p className="text-slate-300 text-xs mt-1">
            <strong>Students get 100% free access.</strong> Upgrade as an instructor or institution to enable Spring AI auto-grading, plagiarism checks, and gradebook CSV exports.
          </p>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          
          {message && (
            <div className={`p-3 rounded-xl text-xs font-semibold border ${
              message.type === 'success' 
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' 
                : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
            }`}>
              {message.text}
            </div>
          )}

          {/* Quick Feature Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-400 flex-shrink-0" />
              <span>Spring AI Rubric Evaluation</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center gap-2">
              <Zap size={16} className="text-amber-400 flex-shrink-0" />
              <span>Plagiarism Scanning</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
              <span>Automated Parent Alerts</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center gap-2">
              <Crown size={16} className="text-purple-400 flex-shrink-0" />
              <span>Master Gradebook CSV Export</span>
            </div>
          </div>

          {/* Action Choice: Quick Upgrade or Institutional Whitelist */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleQuickUpgrade}
              disabled={loading || isPro}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 hover:from-indigo-500 to-purple-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap size={16} />
              {loading ? 'Processing...' : isPro ? '✓ Pro Subscription Active' : 'Subscribe Teacher Pro (₹499/mo)'}
            </button>

            {onNavigateBilling && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateBilling();
                }}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs rounded-xl border border-slate-700 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Building2 size={14} className="text-amber-400" />
                View Full B2B Enterprise & Billing Plans <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Google Classroom features stay 100% free.</span>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

