import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { AnimatedThemeToggleButton } from './ui/animated-theme-toggle-button';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on route change
  const handleNavClick = () => setMenuOpen(false);

  const navLinkStyle = ({ isActive }) => ({
    padding: '0.5rem 1rem',
    border: isActive ? '2px solid var(--border-color)' : '2px solid transparent',
    background: isActive ? 'var(--text-color)' : 'transparent',
    color: isActive ? 'var(--bg-color)' : 'var(--text-color)',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    transition: 'none',
  });

  // Mobile dropdown link style
  const mobileLinkStyle = ({ isActive }) => ({
    display: 'block',
    padding: '0.75rem 1rem',
    borderBottom: '2px solid var(--border-color)',
    background: isActive ? 'var(--text-color)' : 'transparent',
    color: isActive ? 'var(--bg-color)' : 'var(--text-color)',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    textDecoration: 'none',
    transition: 'none',
  });

  return (
    <div ref={menuRef} style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <nav className="navbar">
        {/* Left: NICHE logo */}
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
          NICHE
        </div>

        {/* Center: Desktop nav links (hidden on mobile) */}
        <div className="nav-links-desktop">
          <NavLink to="/" style={navLinkStyle}>Home</NavLink>
          <NavLink to="/niche" style={navLinkStyle}>Niche PS</NavLink>
          <NavLink to="/all" style={navLinkStyle}>All PS</NavLink>
        </div>

        {/* Right: Theme toggle + Hamburger (mobile only) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AnimatedThemeToggleButton type="horizontal" />

          {/* Hamburger button — only visible on mobile */}
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-icon ${menuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      <div className={`mobile-menu ${menuOpen ? 'mobile-menu-open' : ''}`}>
        <NavLink to="/" style={mobileLinkStyle} onClick={handleNavClick}>Home</NavLink>
        <NavLink to="/niche" style={mobileLinkStyle} onClick={handleNavClick}>Niche PS</NavLink>
        <NavLink to="/all" style={mobileLinkStyle} onClick={handleNavClick}>All PS</NavLink>
      </div>
    </div>
  );
}
