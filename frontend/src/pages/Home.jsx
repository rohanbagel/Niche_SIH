import React from 'react';

export function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh' }}>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '4rem 1rem' }}>
        <h1 style={{ 
          fontSize: 'clamp(4rem, 15vw, 10rem)', 
          margin: 0, 
          lineHeight: 1,
          textTransform: 'uppercase',
          textShadow: '8px 8px 0px var(--shadow-color)'
        }}>
          NICHE
        </h1>
        <p style={{ 
          fontSize: 'clamp(1rem, 3vw, 1.5rem)', 
          marginTop: '2rem',
          maxWidth: '600px',
          fontFamily: 'monospace',
          textTransform: 'uppercase',
          border: '2px solid var(--border-color)',
          padding: '1rem',
          background: 'var(--text-color)',
          color: 'var(--bg-color)'
        }}>
          Find SIH 2026 Problem Statements with the least number of submissions.
        </p>
      </main>

      <section className="container" style={{ paddingBottom: '4rem' }}>
        <div className="brutalist-container brutalist-shadow" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', textTransform: 'uppercase', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            The Strategy
          </h2>
          <p style={{ fontFamily: 'monospace', fontSize: '1.1rem', marginBottom: '2rem' }}>
            In SIH, teams that pick a Problem Statement with fewer existing submissions have a statistically better shot at getting shortlisted. Evaluators and selection pressure are distributed per-PS. The official site exposes submission counts, but there's no way to easily sort or find the ones the crowd ignored.
          </p>

          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', textTransform: 'uppercase', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            How it works
          </h2>
          <p style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>
            NICHE scrapes the Azure WAF-protected SIH portal every 15 minutes to track live submission counts and detect newly added Problem Statements before anyone else notices them.
          </p>
        </div>
      </section>
    </div>
  );
}
