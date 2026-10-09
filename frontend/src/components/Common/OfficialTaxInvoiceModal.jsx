import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  FileText, 
  QrCode,
  Lock,
  Sparkles
} from 'lucide-react';

export const OfficialTaxInvoiceModal = ({ invoice, isOpen, onClose }) => {
  if (!isOpen || !invoice) return null;

  const baseAmount = invoice.amountInr || 4999;
  const discountAmount = invoice.discountInr || 0;
  const taxableValue = Math.max(0, baseAmount - discountAmount);
  const cgst = Math.round(taxableValue * 0.09 * 100) / 100;
  const sgst = Math.round(taxableValue * 0.09 * 100) / 100;
  const totalAmount = Math.round((taxableValue + cgst + sgst) * 100) / 100;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1200, padding: '1rem' }}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '820px', 
          width: '100%', 
          maxHeight: '94vh', 
          padding: 0, 
          overflow: 'hidden',
          display: 'flex', 
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5)',
          borderRadius: '16px'
        }}
      >
        {/* Top Action Bar */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#ffffff',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '0.4rem', borderRadius: '8px', display: 'flex' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>
                Verified Academic Tax Invoice
              </span>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 900, margin: 0, color: '#f8fafc' }}>
                Tax Invoice #{invoice.invoiceNo || 'INV-2026-09418'}
              </h4>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              type="button" 
              onClick={handlePrint}
              className="btn btn-sm btn-secondary"
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: 'none', gap: '0.4rem', fontSize: '0.78rem' }}
            >
              <Printer size={14} /> Print / Save PDF
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-sm btn-secondary btn-icon"
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: 'none' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Official Invoice Body */}
        <div 
          id="printable-tax-invoice"
          style={{ 
            background: '#ffffff', 
            color: '#0f172a', 
            padding: '2.5rem', 
            overflowY: 'auto',
            flex: 1,
            fontSize: '0.86rem',
            lineHeight: 1.5
          }}
        >
          {/* Header Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e2e8f0', paddingBottom: '1.5rem', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #1d4ed8, #6366f1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={18} />
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                  AI CLASSROOM TECHNOLOGIES
                </h2>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                Enterprise Academic SaaS & AI Evaluation Infrastructure<br />
                Cyberspace IT Park, Baner Road, Pune, Maharashtra 411045<br />
                <strong>GSTIN:</strong> 27AAACA9921K1ZM | <strong>CIN:</strong> U72900PN2026PTC201948
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="badge" style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', fontSize: '0.75rem', fontWeight: 900, padding: '0.25rem 0.65rem', marginBottom: '0.5rem' }}>
                ✓ PAYMENT CONFIRMED (PAID)
              </span>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                <div><strong>Invoice No:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>{invoice.invoiceNo || 'INV-2026-09418'}</span></div>
                <div><strong>Date of Issue:</strong> {invoice.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                <div><strong>Transaction ID:</strong> <span style={{ fontFamily: 'monospace' }}>{invoice.transactionId || `TXN-${Date.now()}`}</span></div>
                <div><strong>HSN / SAC Code:</strong> 998314 (IT & Education Software)</div>
              </div>
            </div>
          </div>

          {/* Billed To / Student / Faculty Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.75rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>
                Billed To (Customer Details):
              </span>
              <strong style={{ fontSize: '0.98rem', color: '#0f172a', display: 'block' }}>
                {invoice.billedTo || 'Educator / Faculty Member'}
              </strong>
              <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.2rem' }}>
                Email: {invoice.email || 'faculty@campus.edu'}<br />
                Institution: {invoice.institution || 'Recognized Academic Campus'}<br />
                Place of Supply: Maharashtra (27)
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>
                Payment & Fulfillment Rails:
              </span>
              <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.2rem' }}>
                <strong>Method:</strong> {invoice.paymentMethod || 'Credit / Debit Card'}<br />
                <strong>Auth Gateway:</strong> Razorpay / Stripe Encrypted Rail<br />
                <strong>Fulfillment:</strong> Instant Automated Account Provisioning<br />
                <strong>Plan Valid Until:</strong> {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: '#ffffff', textAlign: 'left' }}>
                <th style={{ padding: '0.65rem 0.85rem', borderRadius: '6px 0 0 0' }}>#</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Description of Service</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>SAC</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Qty</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Unit Rate</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right', borderRadius: '0 6px 0 0' }}>Taxable Value</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.85rem' }}>1</td>
                <td style={{ padding: '0.85rem' }}>
                  <strong style={{ display: 'block', color: '#0f172a' }}>{invoice.planTitle || 'AI Classroom Educator Pro License'}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Spring AI automated rubric grading engine, multi-algorithm plagiarism audits, automated parent notifications & gradebook analytics.
                  </span>
                </td>
                <td style={{ padding: '0.85rem', fontFamily: 'monospace' }}>998314</td>
                <td style={{ padding: '0.85rem', textAlign: 'right' }}>1</td>
                <td style={{ padding: '0.85rem', textAlign: 'right', fontFamily: 'monospace' }}>₹{baseAmount.toLocaleString('en-IN')}.00</td>
                <td style={{ padding: '0.85rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>₹{taxableValue.toLocaleString('en-IN')}.00</td>
              </tr>
            </tbody>
          </table>

          {/* Total Calculation Grid */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
            <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Subtotal (Base Value):</span>
                <span style={{ fontFamily: 'monospace' }}>₹{baseAmount.toLocaleString('en-IN')}.00</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 700 }}>
                  <span>Promotional Coupon Discount:</span>
                  <span style={{ fontFamily: 'monospace' }}>-₹{discountAmount.toLocaleString('en-IN')}.00</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>CGST (9.00%):</span>
                <span style={{ fontFamily: 'monospace' }}>₹{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>SGST (9.00%):</span>
                <span style={{ fontFamily: 'monospace' }}>₹{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ height: '1px', background: '#cbd5e1', margin: '0.35rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                <span>Total Amount Paid:</span>
                <span style={{ color: '#1d4ed8', fontFamily: 'monospace' }}>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'right' }}>
                (Inclusive of all Goods & Services Taxes)
              </div>
            </div>
          </div>

          {/* Authentic Signature & Seal Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ border: '2px solid #0f172a', padding: '0.4rem', borderRadius: '8px' }}>
                <QrCode size={48} color="#0f172a" />
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                <strong>GST Digital E-Invoice Verification</strong><br />
                IRN: 8a94e1d7...bf201<br />
                Digitally verified on GST Portal
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ width: '150px', height: '42px', borderBottom: '1px dashed #94a3b8', margin: '0 0 0.4rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontFamily: 'cursive', fontSize: '1.1rem', fontWeight: 700 }}>
                Aryan S.
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', display: 'block' }}>Authorized Signatory</span>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>AI Classroom EdTech Pvt Ltd</span>
            </div>
          </div>

          {/* Footer note */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8' }}>
            This is a computer-generated GST tax invoice and does not require a physical signature. For inquiries, contact accounts@aiclassroom.edu.
          </div>
        </div>
      </div>
    </div>
  );
};
