import React from 'react';

export function PillBadge({ children, type }) {
  const baseStyle = {
    display: 'inline-block',
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    border: '2px solid var(--border-color)',
    marginRight: '0.5rem',
    marginBottom: '0.5rem',
  };

  const typeStyles = {
    software: {
      backgroundColor: 'transparent',
      color: 'var(--text-color)',
    },
    hardware: {
      backgroundColor: 'var(--text-color)',
      color: 'var(--bg-color)',
    },
    new: {
      backgroundColor: '#ff0000', // A harsh brutalist red
      color: '#ffffff',
      borderColor: '#ff0000',
    }
  };

  const style = { ...baseStyle, ...(typeStyles[type?.toLowerCase()] || typeStyles.software) };

  return (
    <span style={style}>
      {children}
    </span>
  );
}
