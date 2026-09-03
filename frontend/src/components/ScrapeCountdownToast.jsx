import React, { useState, useEffect, useRef } from 'react';

const SCRAPE_INTERVAL_SECONDS = 15 * 60; // 15-minute cron cadence

export function ScrapeCountdownToast() {
  const [timeText, setTimeText] = useState('15M 00S');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const hasTriggeredSync = useRef(false);

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const secondsIntoHour = now.getMinutes() * 60 + now.getSeconds();
      const secondsSinceScrape = secondsIntoHour % SCRAPE_INTERVAL_SECONDS;
      const secondsRemaining = SCRAPE_INTERVAL_SECONDS - secondsSinceScrape;

      // First 5 seconds of the 15-minute mark: show SYNCING status and fire background refresh
      if (secondsSinceScrape < 5) {
        setIsSyncing(true);
        if (!hasTriggeredSync.current) {
          hasTriggeredSync.current = true;
          // Silent background refetch from Supabase without any page refresh
          window.dispatchEvent(new CustomEvent('sih:silent-refetch'));
        }
      } else {
        setIsSyncing(false);
        hasTriggeredSync.current = false;
      }

      const mins = Math.floor(secondsRemaining / 60);
      const secs = secondsRemaining % 60;
      setTimeText(`${String(mins).padStart(2, '0')}M ${String(secs).padStart(2, '0')}S`);
    }

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        title="Click to expand countdown"
        aria-label="Expand scrape countdown"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999,
          background: 'var(--bg-color)',
          color: 'var(--text-color)',
          border: '2px solid var(--border-color)',
          boxShadow: '3px 3px 0px var(--shadow-color)',
          fontFamily: "'Minecraft', monospace",
          fontSize: '0.82rem',
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
        <span>⏱</span>
        <span>{isSyncing ? 'SYNCING...' : timeText}</span>
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
        fontFamily: "'Minecraft', monospace",
        fontSize: '0.85rem',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        letterSpacing: '0.5px',
        maxWidth: 'calc(100vw - 48px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.95rem' }}>⏱</span>
        <span style={{ fontWeight: 600 }}>
          {isSyncing ? (
            <span style={{ letterSpacing: '1px' }}>SYNCING SUPABASE...</span>
          ) : (
            <>NEXT SCRAPE IN: <span style={{ fontWeight: 'bold' }}>{timeText}</span></>
          )}
        </span>
      </div>

      <button
        onClick={() => setIsMinimized(true)}
        title="Minimize countdown"
        aria-label="Minimize countdown toast"
        style={{
          background: 'transparent',
          color: 'var(--text-color)',
          border: '1px solid var(--border-color)',
          fontFamily: "'Minecraft', monospace",
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
