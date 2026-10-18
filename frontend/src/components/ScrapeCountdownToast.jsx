import React, { useState } from 'react';

export function ScrapeCountdownToast() {
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        title="Click to view archive status"
        aria-label="Expand archive status"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999,
          background: 'var(--bg-color)',
          color: 'var(--text-color)',
          border: '2px solid var(--border-color)',
          boxShadow: '3px 3px 0px var(--shadow-color)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: '0.85rem',
          padding: '8px 14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          transition: 'transform 0.1s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translate(-2px, -2px)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translate(0, 0)')}
      >
        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
        <span>FINAL ARCHIVE</span>
      </button>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 999,
        background: 'var(--bg-color)',
        color: 'var(--text-color)',
        border: '2px solid var(--border-color)',
        boxShadow: '4px 4px 0px var(--shadow-color)',
        fontFamily: 'var(--font-body)',
        fontSize: '0.88rem',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        letterSpacing: '0.2px',
        maxWidth: 'calc(100vw - 48px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ display: 'inline-block', width: '9px', height: '9px', borderRadius: '50%', background: '#22c55e' }} />
        <div>
          <span style={{ fontWeight: 700, textTransform: 'uppercase', fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
            SUBMISSIONS CLOSED
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', opacity: 0.8, marginLeft: '8px' }}>
            [FINAL ARCHIVED DATA]
          </span>
        </div>
      </div>

      <button
        onClick={() => setIsMinimized(true)}
        title="Minimize toast"
        aria-label="Minimize toast"
        style={{
          background: 'transparent',
          color: 'var(--text-color)',
          border: '1px solid var(--border-color)',
          fontFamily: 'inherit',
          fontSize: '0.85rem',
          lineHeight: '1',
          padding: '3px 6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: '4px',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        ✕
      </button>
    </div>
  );
}

