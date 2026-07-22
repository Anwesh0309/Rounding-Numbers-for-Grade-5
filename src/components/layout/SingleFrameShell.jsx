import React from 'react';
import PhaseTracker from './PhaseTracker';

export default function SingleFrameShell({ children }) {
  return (
    <div className="h-dvh w-vw flex flex-col bg-[#160d33] text-white relative overflow-hidden select-none">
      {/* Background wallpaper glow & mathematical ambient elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse-subtle"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse-subtle"></div>
        
        {/* Floating background numbers motif */}
        <div className="absolute inset-0 opacity-5 flex flex-wrap justify-between p-12 text-7xl font-extrabold text-white">
          <span>10</span><span>100</span><span>10,000</span><span>1,000</span><span>100,000</span>
          <span>≈</span><span>≈</span><span>50,000</span><span>48,732</span><span>90</span>
        </div>
      </div>

      {/* Top Header */}
      <PhaseTracker />

      {/* Main Content Viewport Frame */}
      <main className="flex-1 w-full relative z-10 flex flex-col justify-center items-center p-3 sm:p-6 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
