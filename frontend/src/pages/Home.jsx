import React from 'react';
import { TypingEffect } from '../components/TypingEffect';

export function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh' }}>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '4rem 1rem' }}>
        <h1 style={{ 
          fontSize: 'clamp(4.5rem, 15vw, 9.5rem)', 
          margin: 0, 
          lineHeight: 1,
          textTransform: 'uppercase',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '1.2em',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          letterSpacing: '0.02em',
          WebkitFontSmoothing: 'antialiased',
        }}>
          <TypingEffect
            text={["NICHE"]}
            speed={160}
            eraseSpeed={90}
            eraseDelay={3000}
            typingDelay={500}
            cursor="_"
          />
        </h1>
        <p style={{ 
          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', 
          marginTop: '2rem',
          maxWidth: '650px',
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          border: '2px solid var(--border-color)',
          padding: '0.9rem 1.2rem',
          background: 'var(--text-color)',
          color: 'var(--bg-color)'
        }}>
          Find SIH 2026 Problem Statements with the least number of submissions.
        </p>
      </main>

      <section className="container" style={{ paddingBottom: '4rem' }}>
        <div className="brutalist-container brutalist-shadow" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', textTransform: 'uppercase', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            The Strategy
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '2rem' }}>
            In SIH, teams that pick a Problem Statement with fewer existing submissions have a statistically better shot at getting shortlisted. Evaluators and selection pressure are distributed per-PS. The official site exposes submission counts, but there's no way to easily sort or find the ones the crowd ignored.
          </p>

          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', textTransform: 'uppercase', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            How it works
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.05rem', lineHeight: '1.7' }}>
            NICHE scrapes the Azure WAF-protected SIH portal every 15 minutes to track live submission counts and detect newly added Problem Statements before anyone else notices them.
          </p>
        </div>
      </section>
    </div>
  );
}
