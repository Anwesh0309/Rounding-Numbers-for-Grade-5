import React from 'react';
import PhaseTracker from './PhaseTracker';

export default function SingleFrameShell({ children }) {
  return (
    <div className="h-dvh w-vw flex flex-col bg-[radial-gradient(circle_at_50%_35%,_#2b1766_0%,_#150c38_60%,_#09041a_100%)] text-white relative overflow-hidden select-none">
      {/* Background wallpaper glow & mathematical ambient elements matching screenshot */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none"></div>
        
        {/* Floating background numbers motif from screenshot (2, 10, 15, 20, 5, 50, 100, 1,000) */}
        <div className="absolute inset-0 opacity-[0.08] flex flex-wrap justify-between p-10 text-8xl font-black text-purple-200 select-none pointer-events-none">
          <span className="translate-x-6 translate-y-8">2</span>
          <span className="-translate-y-6">10</span>
          <span className="translate-y-16">15</span>
          <span className="-translate-y-10">20</span>
          <span className="translate-y-6">5</span>
          <span className="-translate-y-8">50</span>
          <span className="translate-y-12">100</span>
          <span className="-translate-y-4">1,000</span>
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
