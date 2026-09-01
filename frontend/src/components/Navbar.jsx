import React from 'react';
import { NavLink } from 'react-router-dom';
import { AnimatedThemeToggleButton } from './ui/animated-theme-toggle-button';

export function Navbar() {
  const navLinkStyle = ({ isActive }) => ({
    padding: '0.5rem 1rem',
    border: isActive ? '2px solid var(--border-color)' : '2px solid transparent',
    background: isActive ? 'var(--text-color)' : 'transparent',
    color: isActive ? 'var(--bg-color)' : 'var(--text-color)',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    transition: 'none',
  });

  return (
    <nav style={{
      borderBottom: '2px solid var(--border-color)',
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      backgroundColor: 'var(--bg-color)',
      zIndex: 100,
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
        NICHE
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <NavLink to="/" style={navLinkStyle}>Home</NavLink>
        <NavLink to="/niche" style={navLinkStyle}>Niche PS</NavLink>
        <NavLink to="/all" style={navLinkStyle}>All PS</NavLink>
      </div>

      <AnimatedThemeToggleButton type="horizontal" />
    </nav>
  );
}
