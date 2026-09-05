import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PillBadge } from './PillBadge';
import { X, ArrowUpRight, Copy, Check } from 'lucide-react';

export function PSDetailModal({ ps, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Lock page background scrolling when modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !ps) return null;

  const numericId = (ps.psNumber || '').replace(/\D/g, '');
  const officialUrl = numericId 
    ? `https://sih.gov.in/sih2026PS#ViewProblemStatement${numericId}` 
    : 'https://sih.gov.in/sih2026PS';

  const handleCopyId = () => {
    if (ps.psNumber) {
      navigator.clipboard.writeText(ps.psNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const modalElement = (
    <div 
      className="ps-modal-backdrop" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ps-modal-title"
    >
      <div 
        className="ps-modal-card brutalist-container" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="ps-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="ps-modal-tag">PROBLEM STATEMENT DETAILS</span>
            <span style={{ 
              fontFamily: 'var(--font-mono)', 
              fontWeight: 700, 
              fontSize: '0.875rem',
              opacity: 0.75 
            }}>
              #{ps.psNumber}
            </span>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="ps-modal-close-btn"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="ps-modal-body">
          {/* Title */}
          <h2 id="ps-modal-title" className="ps-modal-title">
            {ps.title}
          </h2>

          {/* Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
            {ps.category && <PillBadge type={ps.category}>{ps.category}</PillBadge>}
            {ps.theme && <PillBadge type="software">{ps.theme}</PillBadge>}
            {ps.isNewDrop && <PillBadge type="new">NEW DROP</PillBadge>}
          </div>

          {/* Metadata Telemetry Grid */}
          <div className="ps-modal-grid">
            <div className="ps-modal-stat-box">
              <div className="ps-modal-stat-label">TOTAL SUBMISSIONS</div>
              <div className="ps-modal-stat-value">{ps.ideasCount ?? 0}</div>
              <div className="ps-modal-stat-sub">Competing Idea Submissions</div>
            </div>

            <div className="ps-modal-stat-box">
              <div className="ps-modal-stat-label">ORGANIZATION</div>
              <div className="ps-modal-stat-text">{ps.org || 'Not Specified'}</div>
            </div>

            <div className="ps-modal-stat-box">
              <div className="ps-modal-stat-label">DEPARTMENT</div>
              <div className="ps-modal-stat-text">{ps.department || 'Not Specified'}</div>
            </div>

            <div className="ps-modal-stat-box">
              <div className="ps-modal-stat-label">THEME & CATEGORY</div>
              <div className="ps-modal-stat-text">
                {ps.theme || 'General'} • {ps.category || 'N/A'}
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="ps-modal-description-section">
            <div className="ps-modal-section-heading">
              FULL DESCRIPTION & BACKGROUND
            </div>
            {ps.description ? (
              <div className="ps-modal-description-text">
                {ps.description}
              </div>
            ) : (
              <div style={{ opacity: 0.6, fontStyle: 'italic', fontFamily: 'var(--font-body)' }}>
                No detailed description provided for this problem statement.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer / Action Bar */}
        <div className="ps-modal-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleCopyId}
              className="brutalist-button ps-modal-btn"
              title="Copy Problem Statement ID to clipboard"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'COPIED PS ID' : 'COPY PS ID'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="brutalist-button ps-modal-btn"
              style={{
                background: 'var(--text-color)',
                color: 'var(--bg-color)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 600
              }}
              title="Open official SIH portal for this problem statement"
            >
              <span>OPEN ON OFFICIAL SIH</span>
              <ArrowUpRight size={16} />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="brutalist-button ps-modal-btn"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalElement, document.body);
}
