import React from 'react';
import { useProblemStatements } from '../hooks/useProblemStatements';
import { PSCard } from '../components/PSCard';

export function Niche() {
  const { data, loading, error } = useProblemStatements();

  if (loading) return <div className="container" style={{ paddingTop: '2rem' }}>LOADING_DATA...</div>;
  if (error) return <div className="container" style={{ paddingTop: '2rem', color: 'red' }}>ERROR: {error}</div>;

  // Sort by lowest ideas count
  const sorted = [...data].sort((a, b) => a.ideasCount - b.ideasCount);
  
  // Only show the absolute lowest ones (e.g. 0 count or the minimum count available)
  const minCount = sorted.length > 0 ? sorted[0].ideasCount : 0;
  const nichePS = sorted.filter(ps => ps.ideasCount === minCount);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem', borderBottom: '4px solid var(--border-color)', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '3rem', margin: 0, textTransform: 'uppercase' }}>NICHE PS</h1>
        <p style={{ fontFamily: 'monospace', fontSize: '1.2rem' }}>
          Currently showing {nichePS.length} problem statements with exactly {minCount} submissions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
        {nichePS.map(ps => (
          <PSCard key={ps.psNumber} ps={ps} />
        ))}
      </div>
    </div>
  );
}
