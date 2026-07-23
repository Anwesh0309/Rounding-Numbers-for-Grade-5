import React from 'react';
import { useJourney } from '../../context/JourneyContext';
import { Check, Lock, Volume2, VolumeX, Home } from 'lucide-react';

const STAGES = [
  { id: 'wonder', num: '01', label: 'Wonder', icon: '🧠' },
  { id: 'story', num: '02', label: 'Story', icon: '📖' },
  { id: 'simulate', num: '03', label: 'Simulate', icon: '🧪' },
  { id: 'play', num: '04', label: 'Play', icon: '🎮' },
  { id: 'reflect', num: '05', label: 'Reflect', icon: '📜' },
];

export default function PhaseTracker() {
  const { 
    currentPhase, 
    completedPhases, 
    unlockedPhases, 
    navigateToPhase, 
    isAudioMuted, 
    toggleAudio,
    showIntroModal,
    setShowIntroModal
  } = useJourney();

  if (showIntroModal) {
    return null;
  }

  return (
    <header className="w-full flex items-center justify-between px-4 py-3 bg-transparent border-b-0 border-transparent shadow-none shrink-0 z-40 transition-all">
      {/* Home / Intro Button */}
      <button
        onClick={() => {
          setShowIntroModal(true);
          navigateToPhase('wonder');
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 shadow-sm cursor-pointer"
      >
        <Home className="w-4 h-4 text-amber-400" />
        <span>Home</span>
      </button>

      {/* 5-Phase Sequence Tracker */}
      <nav className="flex items-center gap-1.5 sm:gap-3 bg-transparent px-3 py-1.5 rounded-full border-0">
        {STAGES.map((stage, idx) => {
          const isActive = currentPhase === stage.id;
          const isCompleted = completedPhases.includes(stage.id);
          const isUnlocked = unlockedPhases.includes(stage.id);

          return (
            <div key={stage.id} className="flex items-center gap-1.5 sm:gap-3">
              <button
                disabled={!isUnlocked}
                onClick={() => navigateToPhase(stage.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md scale-105 ring-2 ring-amber-300/50'
                    : isCompleted
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                    : isUnlocked
                    ? 'bg-white/10 text-white/80 hover:bg-white/20'
                    : 'bg-white/5 text-white/30 cursor-not-allowed opacity-50'
                }`}
              >
                {isCompleted ? (
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-[10px]">
                    ✓
                  </span>
                ) : !isUnlocked ? (
                  <Lock className="w-3 h-3 text-white/40" />
                ) : (
                  <span className={`text-[10px] font-bold ${isActive ? 'text-slate-900' : 'text-amber-400'}`}>
                    {stage.num}
                  </span>
                )}

                <span className="hidden sm:inline">{stage.label}</span>
              </button>

              {idx < STAGES.length - 1 && (
                <div className={`h-0.5 w-2 sm:w-4 rounded-full ${isCompleted ? 'bg-emerald-500/60' : 'bg-white/10'}`} />
              )}
            </div>
          );
        })}
      </nav>

      {/* Audio Mute/Unmute Control */}
      <button
        onClick={toggleAudio}
        className={`p-2 rounded-full border transition-all cursor-pointer ${
          isAudioMuted
            ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
            : 'bg-amber-400/20 text-amber-300 border-amber-400/40 hover:bg-amber-400/30'
        }`}
        title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
      >
        {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
      </button>
    </header>
  );
}

