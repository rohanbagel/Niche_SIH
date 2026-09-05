import React from 'react';
import { TypingEffect } from '../components/TypingEffect';
import { Star, ArrowUpRight } from 'lucide-react';

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

        {/* Star on GitHub Support Box */}
        <div 
          className="brutalist-container brutalist-shadow" 
          style={{ 
            marginTop: '2rem', 
            padding: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
            background: 'var(--bg-color)'
          }}
        >
          <div style={{ maxWidth: '640px' }}>
            <h2 style={{ 
              fontSize: '1.6rem', 
              textTransform: 'uppercase', 
              fontFamily: 'var(--font-display)', 
              fontWeight: 700,
              letterSpacing: '-0.01em',
              marginBottom: '0.5rem'
            }}>
              Support The Project
            </h2>
            <p style={{ 
              fontFamily: 'var(--font-body)', 
              fontSize: '1.05rem', 
              lineHeight: '1.6', 
              opacity: 0.9 
            }}>
              Not asking you to buy me a coffee, but drop a star on GitHub so I know you're cooking something up for SIH.
            </p>
          </div>

          <a
            href="https://github.com/rohanbagel/Niche_SIH"
            target="_blank"
            rel="noopener noreferrer"
            className="brutalist-button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.85rem 1.4rem',
              fontSize: '0.92rem',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textDecoration: 'none',
              boxShadow: '3px 3px 0px var(--shadow-color)',
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-2px, -2px)';
              e.currentTarget.style.boxShadow = '5px 5px 0px var(--shadow-color)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.boxShadow = '3px 3px 0px var(--shadow-color)';
            }}
          >
            <Star size={16} />
            <span>STAR ON GITHUB</span>
            <ArrowUpRight size={16} />
          </a>
        </div>
      </section>
    </div>
  );
}
