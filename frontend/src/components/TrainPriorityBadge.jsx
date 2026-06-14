import React from 'react';

const TrainPriorityBadge = ({ priority, type }) => {
  const getBadgeStyles = (p) => {
    switch (p) {
      case 5:
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]';
      case 4:
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]';
      case 3:
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      case 2:
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 1:
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getBadgeStyles(priority)}`}>
      {type} ({priority})
    </span>
  );
};

export default TrainPriorityBadge;
