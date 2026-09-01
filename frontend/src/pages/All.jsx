import React, { useState } from 'react';
import { useProblemStatements } from '../hooks/useProblemStatements';
import { PSCard } from '../components/PSCard';

export function All() {
  const { data, loading, error } = useProblemStatements();
  const [search, setSearch] = useState('');

  if (loading) return <div className="container" style={{ paddingTop: '2rem' }}>LOADING_DATA...</div>;
  if (error) return <div className="container" style={{ paddingTop: '2rem', color: 'red' }}>ERROR: {error}</div>;

  const filtered = data.filter(ps => 
    ps.title.toLowerCase().includes(search.toLowerCase()) || 
    ps.psNumber.toLowerCase().includes(search.toLowerCase()) ||
    ps.theme.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3rem', margin: 0, marginBottom: '1rem', textTransform: 'uppercase' }}>ALL PS</h1>
        
        <input 
          type="text" 
          placeholder="SEARCH BY ID, TITLE, OR THEME..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1.2rem',
            fontFamily: 'monospace',
            border: '2px solid var(--border-color)',
            background: 'var(--bg-color)',
            color: 'var(--text-color)',
            outline: 'none',
            textTransform: 'uppercase'
          }}
          className="brutalist-shadow"
        />
      </div>

      <div style={{ fontFamily: 'monospace', marginBottom: '1rem' }}>
        SHOWING {filtered.length} / {data.length} RECORDS
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
        {filtered.map(ps => (
          <PSCard key={ps.psNumber} ps={ps} />
        ))}
      </div>
    </div>
  );
}
