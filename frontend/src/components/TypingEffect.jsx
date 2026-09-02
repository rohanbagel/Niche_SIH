import React, { useState, useEffect } from 'react';

/**
 * Modern, robust Typing Effect component compatible with React 19 & Vite.
 * Provides retro typewriter animation with a configurable blinking terminal cursor.
 */
export function TypingEffect({
  text = ["NICHE"],
  speed = 140,
  eraseSpeed = 90,
  eraseDelay = 2500,
  typingDelay = 400,
  cursor = "_",
  cursorStyle = {},
  className = "",
  style = {}
}) {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Typewriter effect
  useEffect(() => {
    const textList = Array.isArray(text) ? text : [text];
    const fullText = textList[loopNum % textList.length];

    let timer;

    if (isDeleting) {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(prev => prev.slice(0, -1));
        }, eraseSpeed);
      } else {
        // Finished deleting, move to next word
        setIsDeleting(false);
        setLoopNum(prev => prev + 1);
      }
    } else {
      if (displayText.length < fullText.length) {
        timer = setTimeout(() => {
          setDisplayText(fullText.slice(0, displayText.length + 1));
        }, displayText.length === 0 ? typingDelay : speed);
      } else {
        // Finished typing full word, pause before erasing
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, eraseDelay);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, loopNum, text, speed, eraseSpeed, eraseDelay, typingDelay]);

  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'baseline', ...style }}>
      <span>{displayText}</span>
      <span
        style={{
          opacity: cursorVisible ? 1 : 0,
          marginLeft: '4px',
          color: 'var(--text-color)',
          fontWeight: 'bold',
          fontSize: '0.6em',
          lineHeight: 1,
          transition: 'opacity 0.15s ease',
          ...cursorStyle,
        }}
      >
        {cursor}
      </span>
    </span>
  );
}

export default TypingEffect;
