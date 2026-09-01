import React from 'react';
import { PillBadge } from './PillBadge';

export function PSCard({ ps }) {
  const isNew = ps.changeType === 'new' || ps.firstSeenAt === ps.lastUpdatedAt;
  
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
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', lineHeight: '1.2' }}>{ps.title}</h3>
          <p style={{ fontSize: '0.875rem', opacity: 0.8, fontFamily: 'monospace' }}>
            {ps.psNumber} • {ps.org}
          </p>
        </div>
        
        <div style={{
          border: '2px solid var(--border-color)',
          padding: '0.5rem 1rem',
          textAlign: 'center',
          minWidth: '100px'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{ps.ideasCount}</div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Submissions</div>
        </div>
      </div>

      <div>
        <PillBadge type={ps.category}>{ps.category}</PillBadge>
        {ps.theme && <PillBadge type="software">{ps.theme}</PillBadge>}
        {isNew && <PillBadge type="new">NEW</PillBadge>}
      </div>

      {ps.description && (
        <div style={{ 
          marginTop: '0.5rem', 
          paddingTop: '1rem', 
          borderTop: '2px dashed var(--border-color)',
          fontSize: '0.875rem',
          fontFamily: 'monospace'
        }}>
          {ps.description.length > 200 ? ps.description.substring(0, 200) + '...' : ps.description}
        </div>
      )}
    </div>
  );
}
