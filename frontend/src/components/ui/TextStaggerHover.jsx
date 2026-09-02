import React from 'react';

/**
 * TextStaggerHover
 * High-performance, bulletproof character stagger animation.
 * Smoothly triggers whenever the element or any parent button is hovered.
 */
export function TextStaggerHover({
  text,
  duration = 0.24,
  stagger = 0.025,
  className = '',
  style = {},
}) {
  const characters = text.split('');

  return (
    <span
      className={`text-stagger-container ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        overflow: 'hidden',
        lineHeight: 1.15,
        verticalAlign: 'middle',
        ...style,
      }}
    >
      {/* Primary visible text — slides up on hover */}
      <span style={{ display: 'inline-flex' }}>
        {characters.map((char, i) => (
          <span
            key={i}
            className="stagger-char-top"
            style={{
              display: 'inline-block',
              transitionDuration: `${duration}s`,
              transitionDelay: `${i * stagger}s`,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>

      {/* Secondary hidden text — slides in from bottom on hover */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'inline-flex',
        }}
      >
        {characters.map((char, i) => (
          <span
            key={i}
            className="stagger-char-bottom"
            style={{
              display: 'inline-block',
              transitionDuration: `${duration}s`,
              transitionDelay: `${i * stagger}s`,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
    </span>
  );
}

export default TextStaggerHover;
