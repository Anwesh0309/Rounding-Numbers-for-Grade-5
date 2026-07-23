import React, { useEffect, useState } from 'react';
import { useJourney } from '../context/JourneyContext';
import { speakText, stopNarration } from '../utils/audio';
import { Sparkles, HelpCircle, ArrowRight, ShieldCheck, Layers, Award, Target, Volume2, VolumeX } from 'lucide-react';

export default function WonderPage() {
  const { 
    completePhase,
    completePhaseAndNavigate, 
    navigateToPhase, 
    showIntroModal, 
    setShowIntroModal,
    isAudioMuted,
    toggleAudio
  } = useJourney();

  const [showHint, setShowHint] = useState(false);

  const wonderQuestionText = "A stadium says 48,732 people attended the match. The newspaper rounds it to the nearest thousand. What number will they print?";

  useEffect(() => {
    if (!showIntroModal && !isAudioMuted) {
      speakText(`Hmm, I wonder. ${wonderQuestionText}`, 'wonder');
    }
  }, [showIntroModal]);

  const handleBeginJourney = () => {
    setShowIntroModal(false);
    if (!isAudioMuted) {
      speakText(wonderQuestionText, 'wonder');
    }
  };

  const handleInvestigate = () => {
    completePhaseAndNavigate('wonder', 'story');
  };

  return (
    <div className="w-full max-w-4xl h-full flex flex-col justify-center items-center relative">
      
      {/* Intro Phase Screen */}
      {showIntroModal ? (
        <div className="w-full h-full flex flex-col justify-between items-center py-4 px-2 overflow-y-auto no-scrollbar relative animate-fadeIn z-20">
          
          {/* Top Right Audio Mute Button */}
          <button
            onClick={toggleAudio}
            className={`absolute top-2 right-2 p-2.5 rounded-full border transition-all shadow-md z-30 ${
              isAudioMuted
                ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                : 'bg-white/10 text-amber-300 border-white/20 hover:bg-white/20'
            }`}
            title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isAudioMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Top Curriculum Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/90 text-xs font-bold tracking-wide mb-3 shadow-sm">
            <span>✨ Grade 5 : Rounding Numbers Adventure</span>
          </div>

          {/* Main Title */}
          <div className="text-center mb-1">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight drop-shadow-md">
              <span className="text-[#ff6b35]">Rounding</span>{' '}
              <span className="text-[#ffc107]">Numbers</span>
            </h1>
            <p className="text-xs sm:text-sm font-black text-amber-300/90 tracking-wider uppercase mt-1">
              Roundorama · Number Rounding Expedition
            </p>
          </div>

          {/* Mascot Circle & Speech Bubble */}
          <div className="flex items-center justify-center gap-3 my-3">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-2xl shadow-lg shrink-0">
              🦁
            </div>
            <div className="bg-white text-slate-950 font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-xl border border-slate-100 relative max-w-xs">
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent"></div>
              <span>Hi! I'm Leo. Ready to round? 🎯</span>
            </div>
          </div>

          {/* Description Text */}
          <p className="text-xs sm:text-sm text-slate-200/90 max-w-lg text-center leading-relaxed mb-4">
            Learn to round numbers to <span className="text-amber-300 font-extrabold">nearest 10, 100, 1,000, 10,000, 100,000, and 1,000,000</span>, connect estimation to real-world math, and master Grade 5 rounding!
          </p>

          {/* YOUR LEARNING JOURNEY Box */}
          <div className="w-full max-w-lg bg-[#18113c]/90 border border-white/15 rounded-3xl p-4 sm:p-5 shadow-2xl mb-4 text-center backdrop-blur-md">
            <h3 className="text-[11px] font-black tracking-widest text-amber-400 uppercase mb-3 sm:mb-4">
              YOUR LEARNING JOURNEY
            </h3>

            <div className="flex flex-col gap-3 items-center">
              {/* Row 1: Wonder, Story, Simulate */}
              <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
                
                {/* Wonder */}
                <div className="flex items-center gap-2 text-left">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 flex items-center justify-center text-xs shrink-0 shadow">
                    🧠
                  </div>
                  <div>
                    <div className="font-black text-white text-xs leading-none mb-0.5">Wonder</div>
                    <div className="text-[9px] text-slate-300 opacity-80 leading-none">A rounding mystery!</div>
                  </div>
                </div>

                <span className="text-white/30 text-xs font-bold">→</span>

                {/* Story */}
                <div className="flex items-center gap-2 text-left">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center text-xs shrink-0 shadow">
                    📖
                  </div>
                  <div>
                    <div className="font-black text-white text-xs leading-none mb-0.5">Story</div>
                    <div className="text-[9px] text-slate-300 opacity-80 leading-none">See rounding in action</div>
                  </div>
                </div>

                <span className="text-white/30 text-xs font-bold">→</span>

                {/* Simulate */}
                <div className="flex items-center gap-2 text-left">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center text-xs shrink-0 shadow">
                    🧪
                  </div>
                  <div>
                    <div className="font-black text-white text-xs leading-none mb-0.5">Simulate</div>
                    <div className="text-[9px] text-slate-300 opacity-80 leading-none">4 Interactive labs</div>
                  </div>
                </div>

                <span className="text-white/30 text-xs font-bold hidden sm:inline">→</span>
              </div>

              {/* Row 2: Play, Reflect */}
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                
                {/* Practice */}
                <div className="flex items-center gap-2 text-left">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center text-xs shrink-0 shadow">
                    🎮
                  </div>
                  <div>
                    <div className="font-black text-white text-xs leading-none mb-0.5">Practice</div>
                    <div className="text-[9px] text-slate-300 opacity-80 leading-none">100 challenges</div>
                  </div>
                </div>

                <span className="text-white/30 text-xs font-bold">→</span>

                {/* Reflect */}
                <div className="flex items-center gap-2 text-left">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-300 flex items-center justify-center text-xs shrink-0 shadow">
                    📜
                  </div>
                  <div>
                    <div className="font-black text-white text-xs leading-none mb-0.5">Reflect</div>
                    <div className="text-[9px] text-slate-300 opacity-80 leading-none">What did you learn?</div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Primary CTA Button */}
          <button
            onClick={handleBeginJourney}
            className="px-8 sm:px-10 py-3.5 rounded-2xl bg-gradient-to-r from-[#ffa000] via-[#ffb300] to-[#ffc107] hover:from-[#ff8f00] hover:to-[#ffa000] text-slate-950 font-black text-base sm:text-lg shadow-[0_0_25px_rgba(255,193,7,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mb-4 cursor-pointer border border-amber-300/50"
          >
            <span>🚀 Begin Your Journey!</span>
          </button>

          {/* 3 Bottom Feature Cards */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-xl text-center">
            
            <div className="bg-[#201449]/80 border border-white/10 rounded-2xl p-2.5 sm:p-3 shadow-md flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-base mb-1">
                🎯
              </div>
              <span className="text-xs font-extrabold text-white">100 Questions</span>
            </div>

            <div className="bg-[#201449]/80 border border-white/10 rounded-2xl p-2.5 sm:p-3 shadow-md flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-base mb-1">
                🔢
              </div>
              <span className="text-xs font-extrabold text-white">Rounding Rules</span>
            </div>

            <div className="bg-[#201449]/80 border border-white/10 rounded-2xl p-2.5 sm:p-3 shadow-md flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-base mb-1">
                ✨
              </div>
              <span className="text-xs font-extrabold text-white">Badges & XP</span>
            </div>

          </div>

        </div>
      ) : (
        /* Main Wonder Phase Content */
        <div className="w-full flex flex-col items-center gap-4 sm:gap-6 text-center my-auto animate-fadeIn">
          
          {/* Mascot Speech Bubble */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-amber-400 border-4 border-white shadow-xl flex items-center justify-center text-3xl">
              🦁
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-xs sm:text-sm font-bold text-amber-200 shadow-md">
              "Hmm... I wonder... 🧐"
            </div>
          </div>

          {/* Question Card */}
          <div className="w-full max-w-2xl glass-panel p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl relative">
            
            {/* Avatar Icon */}
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white text-2xl font-black shadow-lg">
              ?
            </div>

            <h2 className="text-xl sm:text-2xl font-black leading-snug mb-4 text-white">
              "A stadium says <span className="text-amber-400 text-glow-gold">48,732</span> people attended the match. The newspaper rounds it to the nearest thousand. What number will they print?"
            </h2>

            {/* Sub Hint */}
            <p className="text-xs sm:text-sm text-slate-300 italic mb-4">
              What if the digit next door is 5 or more?
            </p>

            {/* Revealable Hint */}
            {showHint ? (
              <div className="animate-fadeIn inline-block px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-extrabold text-sm mb-4">
                ✨ We might need to round UP to 49,000! ✨
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowHint(true);
                  if (!isAudioMuted) speakText("We might need to round UP to 49,000!");
                }}
                className="text-xs font-extrabold text-amber-400 hover:text-amber-300 underline underline-offset-4 mb-4 transition-colors cursor-pointer"
              >
                💡 Tap for a quick hint
              </button>
            )}

            {/* Let's Investigate CTA */}
            <div className="pt-2">
              <button
                onClick={handleInvestigate}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-base shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto cursor-pointer"
              >
                <span>🔍 Let's Investigate!</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

