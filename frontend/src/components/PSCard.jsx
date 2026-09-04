import React from 'react';
import { PillBadge } from './PillBadge';

export function PSCard({ ps }) {
  const isNewDrop = Boolean(ps.isNewDrop);
  
  return (
    <div className="brutalist-container brutalist-shadow-hover" style={{
      padding: '1.5rem',
      marginBottom: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      transition: 'all 0.1s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ 
            fontSize: '1.25rem', 
            marginBottom: '0.5rem', 
            lineHeight: '1.3', 
            fontFamily: 'var(--font-display)', 
            fontWeight: 600,
            letterSpacing: '-0.01em'
          }}>
            {ps.title}
          </h3>
          <p style={{ fontSize: '0.875rem', opacity: 0.85, fontFamily: 'var(--font-body)', fontWeight: 500 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{ps.psNumber}</span> • {ps.org}
          </p>
        </div>
        
        <div style={{
          border: '2px solid var(--border-color)',
          padding: '0.5rem 1rem',
          textAlign: 'center',
          minWidth: '100px'
        }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{ps.ideasCount}</div>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.05em', marginTop: '0.3rem' }}>Submissions</div>
        </div>
      </div>

      <div>
        <PillBadge type={ps.category}>{ps.category}</PillBadge>
        {ps.theme && <PillBadge type="software">{ps.theme}</PillBadge>}
        {isNewDrop && <PillBadge type="new">NEW DROP</PillBadge>}
      </div>

      {ps.description && (
        <div style={{ 
          marginTop: '0.5rem', 
          paddingTop: '1rem', 
          borderTop: '2px dashed var(--border-color)',
          fontSize: '0.925rem',
          lineHeight: '1.6',
          fontFamily: 'var(--font-body)',
          opacity: 0.92
        }}>
          {ps.description.length > 220 ? ps.description.substring(0, 220) + '...' : ps.description}
        </div>
      )}
    </div>
  );
}
