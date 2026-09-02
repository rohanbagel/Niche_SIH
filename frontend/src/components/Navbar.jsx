import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { AnimatedThemeToggleButton } from './ui/animated-theme-toggle-button';
import { TextStaggerHover } from './ui/TextStaggerHover';

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

  const handleNavClick = () => setMenuOpen(false);

  return (
    <div ref={menuRef} style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <nav className="navbar">
        {/* Left: NICHE logo */}
        <NavLink
          to="/"
          className="logo-btn-box"
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            color: 'var(--text-color)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <TextStaggerHover text="NICHE" />
        </NavLink>

        {/* Center: Desktop boxed nav links with character stagger hover */}
        <div className="nav-links-desktop">
          <NavLink
            to="/"
            className={({ isActive }) => `nav-btn-box ${isActive ? 'active' : ''}`}
          >
            <TextStaggerHover text="Home" />
          </NavLink>

          <NavLink
            to="/niche"
            className={({ isActive }) => `nav-btn-box ${isActive ? 'active' : ''}`}
          >
            <TextStaggerHover text="Niche PS" />
          </NavLink>

          <NavLink
            to="/all"
            className={({ isActive }) => `nav-btn-box ${isActive ? 'active' : ''}`}
          >
            <TextStaggerHover text="All PS" />
          </NavLink>
        </div>

        {/* Right: Theme toggle + Hamburger (mobile only) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AnimatedThemeToggleButton type="horizontal" />

          {/* Hamburger button */}
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

      {/* Mobile dropdown menu with boxed buttons */}
      <div className={`mobile-menu ${menuOpen ? 'mobile-menu-open' : ''}`}>
        <NavLink
          to="/"
          className={({ isActive }) => `nav-btn-box mobile-nav-btn ${isActive ? 'active' : ''}`}
          onClick={handleNavClick}
        >
          <TextStaggerHover text="Home" />
        </NavLink>

        <NavLink
          to="/niche"
          className={({ isActive }) => `nav-btn-box mobile-nav-btn ${isActive ? 'active' : ''}`}
          onClick={handleNavClick}
        >
          <TextStaggerHover text="Niche PS" />
        </NavLink>

        <NavLink
          to="/all"
          className={({ isActive }) => `nav-btn-box mobile-nav-btn ${isActive ? 'active' : ''}`}
          onClick={handleNavClick}
        >
          <TextStaggerHover text="All PS" />
        </NavLink>
      </div>
    </div>
  );
}

export default Navbar;
