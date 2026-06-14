import React from 'react';

const GlassCard = ({ children, className = '', hoverable = true, id }) => {
  return (
    <div
      id={id}
      className={`glass-panel rounded-2xl p-6 transition-all duration-300 ${
        hoverable ? 'hover:bg-slate-900/65 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;
