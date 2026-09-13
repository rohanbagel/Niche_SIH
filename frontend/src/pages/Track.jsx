import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useProblemStatements } from '../hooks/useProblemStatements';
import { usePSHistory } from '../hooks/usePSHistory';
import { PSVelocityChart } from '../components/PSVelocityChart';
import { PillBadge } from '../components/PillBadge';
import { 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Zap, 
  Flame, 
  Snowflake, 
  Activity, 
  ArrowUpRight, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Check, 
  Copy,
  X,
  Plus
} from 'lucide-react';

const STORAGE_KEY = 'niche_tracked_ps';

export function Track() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: allPS, loading: psLoading, error: psError } = useProblemStatements();

  // Watchlist stored in browser localStorage (zero sign-up / private)
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedPsId, setSelectedPsId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showLogTable, setShowLogTable] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Sync with URL query parameter or default to first watchlist item ONLY
  // Do NOT select any random PS if watchlist is empty
  useEffect(() => {
    if (!allPS || allPS.length === 0) return;

    const params = new URLSearchParams(location.search);
    const urlPs = params.get('ps');

    if (urlPs) {
      const match = allPS.find(
        (p) => p.psNumber.toLowerCase() === urlPs.toLowerCase() ||
               p.psNumber.replace(/\D/g, '') === urlPs.replace(/\D/g, '')
      );
      if (match) {
        setSelectedPsId(match.psNumber);
        return;
      }
    }

    if (selectedPsId) return;

    // If user has saved items in their watchlist, open the first saved one
    if (watchlist.length > 0) {
      const matchedWatch = allPS.find((p) => p.psNumber === watchlist[0]);
      if (matchedWatch) {
        setSelectedPsId(matchedWatch.psNumber);
      }
    }
    // If no watchlist and no query param, leave selectedPsId as empty string
  }, [allPS, location.search, watchlist, selectedPsId]);

  // Add a PS to the watchlist
  const addToWatchlist = (psNumber) => {
    setWatchlist((prev) => {
      if (prev.includes(psNumber)) return prev;
      const next = [psNumber, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error('Error saving watchlist:', err);
      }
      return next;
    });
  };

  // Remove a specific PS from the watchlist
  const removeFromWatchlist = (psNumber) => {
    setWatchlist((prev) => {
      const next = prev.filter((id) => id !== psNumber);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error('Error updating watchlist:', err);
      }
      return next;
    });
  };

  // Clear all saved watchlist items
  const clearAllWatchlist = () => {
    setWatchlist([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('Error clearing watchlist:', err);
    }
  };

  const handleSelectPS = (psNumber) => {
    setSelectedPsId(psNumber);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleDeselect = () => {
    setSelectedPsId('');
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const activePs = useMemo(() => {
    if (!allPS || !selectedPsId) return null;
    return allPS.find((p) => p.psNumber === selectedPsId) || null;
  }, [allPS, selectedPsId]);

  // Telemetry and history hook for the selected PS
  const { history, timeline, loading: historyLoading, metrics } = usePSHistory(
    activePs?.psNumber,
    activePs?.ideasCount ?? 0
  );

  // Search autocomplete filter
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !allPS) return [];
    const q = searchQuery.toLowerCase();
    return allPS.filter(
      (p) =>
        p.psNumber.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        (p.org && p.org.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [allPS, searchQuery]);

  const isPinned = activePs && watchlist.includes(activePs.psNumber);

  const handleCopy = () => {
    if (!activePs?.psNumber) return;
    navigator.clipboard.writeText(activePs.psNumber);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (psLoading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', textTransform: 'uppercase' }}>
          LOADING PS INTELLIGENCE...
        </h2>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem' }}>
          Syncing telemetry from Supabase snapshot...
        </p>
      </div>
    );
  }

  const numericId = activePs ? (activePs.psNumber || '').replace(/\D/g, '') : '';
  const officialUrl = numericId 
    ? `https://sih.gov.in/sih2026PS#ViewProblemStatement${numericId}` 
    : 'https://sih.gov.in/sih2026PS';

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      {/* Header Section */}
      <div style={{ margin: '2rem 0 1.5rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <span style={{ 
            background: 'var(--text-color)', 
            color: 'var(--bg-color)', 
            fontFamily: 'var(--font-display)', 
            fontWeight: 700, 
            fontSize: '0.8rem', 
            padding: '0.25rem 0.6rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase'
          }}>
            REAL-TIME TRACKER
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', opacity: 0.75 }}>
            Private Client-Side Storage
          </span>
        </div>
        <h1 style={{ 
          fontSize: 'clamp(2rem, 5vw, 3.2rem)', 
          textTransform: 'uppercase', 
          fontFamily: 'var(--font-display)', 
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1.1
        }}>
          TRACK YOUR PS
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', opacity: 0.85, maxWidth: '680px', marginTop: '0.5rem' }}>
          Monitor submission speed, historical velocity, and Grand Finale shortlisting odds for your chosen SIH problem statement.
        </p>
      </div>

      {/* Search and Selector Bar */}
      <div className="brutalist-container brutalist-shadow" style={{ padding: '1.25rem', marginBottom: '2rem', background: 'var(--bg-color)' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              SELECT OR SEARCH ANY PROBLEM STATEMENT
            </label>
            {activePs && (
              <button
                type="button"
                onClick={handleDeselect}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--text-color)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  opacity: 0.7
                }}
              >
                Clear Active Selection
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder={activePs ? `Active: ${activePs.psNumber} - Search another by ID or title...` : "Type a PS ID (e.g. SIH26001) or keywords..."}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  border: '2px solid var(--border-color)',
                  background: 'var(--bg-color)',
                  color: 'var(--text-color)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
              <Search 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '0.8rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  opacity: 0.6 
                }} 
              />
            </div>
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div 
              className="brutalist-container" 
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 50,
                background: 'var(--bg-color)',
                borderTop: 'none',
                boxShadow: '4px 6px 0px var(--shadow-color)',
                maxHeight: '320px',
                overflowY: 'auto'
              }}
            >
              {searchResults.map((item) => (
                <div
                  key={item.psNumber}
                  onClick={() => handleSelectPS(item.psNumber)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    background: item.psNumber === activePs?.psNumber ? 'var(--hover-bg)' : 'transparent'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = item.psNumber === activePs?.psNumber ? 'var(--hover-bg)' : 'transparent')}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem' }}>{item.psNumber}</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.7, fontFamily: 'var(--font-body)' }}>{item.category}</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, fontFamily: 'var(--font-display)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem' }}>{item.ideasCount}</span>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-display)', textTransform: 'uppercase', opacity: 0.7 }}>ideas</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pinned Watchlist Chips */}
        {watchlist.length > 0 && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px dashed var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.8 }}>
                SAVED WATCHLIST ({watchlist.length} pinned)
              </div>
              <button
                type="button"
                onClick={clearAllWatchlist}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--text-color)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  opacity: 0.7
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
              >
                Clear All
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {watchlist.map((id) => {
                const psItem = allPS.find((p) => p.psNumber === id);
                const isCurrent = id === activePs?.psNumber;
                return (
                  <div
                    key={id}
                    onClick={() => handleSelectPS(id)}
                    style={{
                      border: '2px solid var(--border-color)',
                      padding: '0.35rem 0.65rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      background: isCurrent ? 'var(--text-color)' : 'var(--bg-color)',
                      color: isCurrent ? 'var(--bg-color)' : 'var(--text-color)',
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      fontFamily: 'var(--font-mono)',
                      transition: 'all 0.1s ease'
                    }}
                    title="Click to view details"
                  >
                    <span>{id}</span>
                    {psItem && (
                      <span style={{ 
                        opacity: isCurrent ? 0.9 : 0.6,
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-display)' 
                      }}>
                        ({psItem.ideasCount} ideas)
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWatchlist(id);
                      }}
                      title={`Remove ${id} from watchlist`}
                      style={{
                        background: isCurrent ? 'var(--bg-color)' : 'var(--text-color)',
                        color: isCurrent ? 'var(--text-color)' : 'var(--bg-color)',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.1rem 0.35rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        marginLeft: '0.25rem'
                      }}
                    >
                      ✕ REMOVE
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area: Active PS or Empty State */}
      {activePs ? (
        <>
          {/* Selected PS Main Banner */}
          <div className="brutalist-container brutalist-shadow" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'var(--bg-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem', opacity: 0.9 }}>
                    #{activePs.psNumber}
                  </span>
                  <PillBadge type={activePs.category}>{activePs.category}</PillBadge>
                  {activePs.theme && <PillBadge type="software">{activePs.theme}</PillBadge>}
                  {activePs.isNewDrop && <PillBadge type="new">NEW DROP</PillBadge>}
                </div>
                <h2 style={{ 
                  fontSize: 'clamp(1.25rem, 3.5vw, 1.8rem)', 
                  fontFamily: 'var(--font-display)', 
                  fontWeight: 700,
                  lineHeight: 1.25,
                  letterSpacing: '-0.01em',
                  marginBottom: '0.5rem'
                }}>
                  {activePs.title}
                </h2>
                <p style={{ fontSize: '0.9rem', fontFamily: 'var(--font-body)', opacity: 0.85 }}>
                  <strong>{activePs.org}</strong> {activePs.department && `• ${activePs.department}`}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
                {isPinned ? (
                  <button
                    type="button"
                    onClick={() => removeFromWatchlist(activePs.psNumber)}
                    className="brutalist-button"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      background: 'var(--hover-bg)',
                      color: 'var(--text-color)',
                      border: '2px solid var(--border-color)'
                    }}
                    title="Remove from your saved watchlist"
                  >
                    <BookmarkCheck size={16} />
                    <span>REMOVE FROM WATCHLIST</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => addToWatchlist(activePs.psNumber)}
                    className="brutalist-button"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      background: 'var(--text-color)',
                      color: 'var(--bg-color)'
                    }}
                    title="Add to your saved watchlist"
                  >
                    <Bookmark size={16} />
                    <span>ADD TO WATCHLIST</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopy}
                  className="brutalist-button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.85rem'
                  }}
                  title="Copy Problem Statement ID"
                >
                  {copiedId ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedId ? 'COPIED' : 'COPY ID'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Submission Speed & Velocity Telemetry Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '1rem', 
            marginBottom: '2rem' 
          }}>
            {/* Speed / Pace Card */}
            <div className="brutalist-container brutalist-shadow" style={{ padding: '1.25rem', background: 'var(--bg-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.75 }}>
                  SUBMISSION SPEED (PACE)
                </span>
                {metrics.pace === 'SURGING' ? (
                  <Flame size={20} color="#ff4444" />
                ) : metrics.pace === 'STEADY' ? (
                  <Activity size={20} />
                ) : (
                  <Snowflake size={20} color="#38bdf8" />
                )}
              </div>
              <div style={{ 
                fontFamily: 'var(--font-display)', 
                fontSize: '1.4rem', 
                fontWeight: 800, 
                lineHeight: 1.2,
                marginBottom: '0.35rem',
                color: metrics.pace === 'SURGING' ? '#ff4444' : metrics.pace === 'COLD' ? '#00b0ff' : 'inherit'
              }}>
                {metrics.paceLabel}
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.825rem', opacity: 0.85, lineHeight: 1.4 }}>
                {metrics.paceDescription}
              </p>
            </div>

            {/* Daily Velocity Card */}
            <div className="brutalist-container brutalist-shadow" style={{ padding: '1.25rem', background: 'var(--bg-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.75 }}>
                  DAILY INFLOW VELOCITY
                </span>
                <Zap size={20} />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.35rem' }}>
                +{metrics.dailyVelocity} <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>ideas/day</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', opacity: 0.85 }}>
                +{metrics.last24hDelta} in past 24h • +{metrics.last7dDelta} in past 7d
              </div>
            </div>

            {/* Shortlist Acceptance Odds */}
            <div className="brutalist-container brutalist-shadow" style={{ padding: '1.25rem', background: 'var(--bg-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.75 }}>
                  FINALE SHORTLIST ODDS
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, opacity: 0.65 }}>
                  (4–5 teams / PS)
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.35rem' }}>
                {metrics.shortlistOdds}%
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.825rem', opacity: 0.85 }}>
                ~{metrics.relativeAdvantage}x higher than SIH national average
              </div>
            </div>

            {/* Current Submissions vs Cap */}
            <div className="brutalist-container brutalist-shadow" style={{ padding: '1.25rem', background: 'var(--bg-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.75 }}>
                  CURRENT SUBMISSIONS
                </span>
                <Clock size={20} />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.35rem' }}>
                {activePs.ideasCount} <span style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', opacity: 0.6 }}>/ {activePs.maxIdeas || 100}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.825rem', opacity: 0.85 }}>
                {Math.round(((activePs.ideasCount || 0) / (activePs.maxIdeas || 100)) * 100)}% capacity filled
              </div>
            </div>
          </div>

          {/* Visual Growth Timeline Chart */}
          <div style={{ marginBottom: '2rem' }}>
            <PSVelocityChart 
              timeline={timeline} 
              currentCount={activePs.ideasCount} 
              firstSeenAt={activePs.firstSeenAt}
            />
          </div>

          {/* Collapsible Detailed Audit Log */}
          <div className="brutalist-container brutalist-shadow" style={{ marginBottom: '2rem', background: 'var(--bg-color)' }}>
            <div 
              onClick={() => setShowLogTable(!showLogTable)}
              style={{ 
                padding: '1.25rem', 
                cursor: 'pointer', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  COMPLETE SUBMISSION AUDIT TRAIL ({history.length} events logged)
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', opacity: 0.75, marginTop: '0.2rem' }}>
                  Timestamped logs captured automatically during 15-minute scrape cycles
                </div>
              </div>
              <button 
                type="button" 
                style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}
              >
                {showLogTable ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            {showLogTable && (
              <div style={{ borderTop: '2px solid var(--border-color)', overflowX: 'auto' }}>
                {history.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--hover-bg)', borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ padding: '0.6rem 1rem', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>Timestamp (IST)</th>
                        <th style={{ padding: '0.6rem 1rem', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>Event Type</th>
                        <th style={{ padding: '0.6rem 1rem', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>Previous</th>
                        <th style={{ padding: '0.6rem 1rem', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>New Count</th>
                        <th style={{ padding: '0.6rem 1rem', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>Net Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...history].reverse().map((record) => {
                        const diff = (record.new_count ?? 0) - (record.old_count ?? 0);
                        return (
                          <tr key={record.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.6rem 1rem' }}>
                              {new Date(record.created_at).toLocaleString('en-US', {
                                timeZone: 'Asia/Kolkata',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td style={{ padding: '0.6rem 1rem' }}>
                              <span style={{ 
                                textTransform: 'uppercase', 
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                padding: '0.2rem 0.4rem',
                                border: '1px solid var(--border-color)',
                                background: record.change_type === 'new' ? 'var(--text-color)' : 'transparent',
                                color: record.change_type === 'new' ? 'var(--bg-color)' : 'var(--text-color)'
                              }}>
                                {record.change_type}
                              </span>
                            </td>
                            <td style={{ padding: '0.6rem 1rem', opacity: 0.7 }}>{record.old_count}</td>
                            <td style={{ padding: '0.6rem 1rem', fontWeight: 700 }}>{record.new_count}</td>
                            <td style={{ padding: '0.6rem 1rem', fontWeight: 700, color: diff > 0 ? '#10b981' : 'inherit' }}>
                              {diff > 0 ? `+${diff}` : '0'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '1.5rem', textAlign: 'center', opacity: 0.7 }}>
                    No count changes logged yet for this problem statement.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Full Problem Statement Specification Card */}
          <div className="brutalist-container brutalist-shadow" style={{ padding: '1.75rem', background: 'var(--bg-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>
                FULL PROBLEM STATEMENT SPECIFICATION
              </h3>
              <a
                href={officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="brutalist-button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  background: 'var(--text-color)',
                  color: 'var(--bg-color)'
                }}
              >
                <span>OPEN ON OFFICIAL SIH PORTAL</span>
                <ArrowUpRight size={16} />
              </a>
            </div>

            {activePs.description ? (
              <div style={{ 
                fontFamily: 'var(--font-body)', 
                fontSize: '0.975rem', 
                lineHeight: 1.7, 
                whiteSpace: 'pre-line',
                opacity: 0.95 
              }}>
                {activePs.description}
              </div>
            ) : (
              <p style={{ fontStyle: 'italic', opacity: 0.7 }}>
                No full description available for this problem statement.
              </p>
            )}
          </div>
        </>
      ) : (
        /* Empty State when no problem statement is active / selected */
        <div 
          className="brutalist-container brutalist-shadow" 
          style={{ 
            padding: '3.5rem 1.5rem', 
            textAlign: 'center', 
            background: 'var(--bg-color)', 
            marginBottom: '2rem' 
          }}
        >
          <div style={{ 
            display: 'inline-flex', 
            padding: '0.85rem', 
            border: '2px solid var(--border-color)', 
            marginBottom: '1.25rem', 
            background: 'var(--hover-bg)' 
          }}>
            <Search size={32} />
          </div>
          <h2 style={{ 
            fontSize: '1.6rem', 
            fontFamily: 'var(--font-display)', 
            fontWeight: 700, 
            textTransform: 'uppercase', 
            marginBottom: '0.6rem' 
          }}>
            NO PROBLEM STATEMENT SELECTED
          </h2>
          <p style={{ 
            fontFamily: 'var(--font-body)', 
            fontSize: '0.95rem', 
            opacity: 0.85, 
            maxWidth: '560px', 
            margin: '0 auto 1.75rem auto', 
            lineHeight: 1.6 
          }}>
            Your watchlist is currently empty. Use the search bar above to look up any SIH problem statement by its ID (e.g. SIH26001) or title keywords to track its submission speed, growth curve, and Grand Finale shortlisting odds.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Link 
              to="/niche" 
              className="brutalist-button" 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                fontWeight: 700, 
                textDecoration: 'none',
                fontSize: '0.875rem' 
              }}
            >
              BROWSE NICHE PS
            </Link>
            <Link 
              to="/all" 
              className="brutalist-button" 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                fontWeight: 700, 
                textDecoration: 'none',
                fontSize: '0.875rem' 
              }}
            >
              BROWSE ALL PS
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
