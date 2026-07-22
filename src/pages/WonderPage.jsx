import React, { useEffect, useState } from 'react';
import { useJourney } from '../context/JourneyContext';
import { speakText } from '../utils/audio';
import { Sparkles, HelpCircle, ArrowRight, ShieldCheck, Layers, Award, Target, X } from 'lucide-react';

export default function WonderPage() {
  const { 
    completePhase, 
    navigateToPhase, 
    showIntroModal, 
    setShowIntroModal,
    isAudioMuted 
  } = useJourney();

  const [showHint, setShowHint] = useState(false);

  const wonderQuestionText = "A stadium says 48,732 people attended the match. The newspaper rounds it to the nearest thousand. What number will they print?";

  useEffect(() => {
    if (!showIntroModal && !isAudioMuted) {
      speakText(`Hmm, I wonder. ${wonderQuestionText}`);
    }
  }, [showIntroModal, isAudioMuted]);

  const handleBeginJourney = () => {
    setShowIntroModal(false);
    speakText(wonderQuestionText);
  };

  const handleInvestigate = () => {
    completePhase('wonder');
    navigateToPhase('story');
  };

  return (
    <div className="w-full max-w-4xl h-full flex flex-col justify-center items-center relative">
      {/* Intro Landing Modal */}
      {showIntroModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-lg animate-fadeIn">
          <div className="w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl relative flex flex-col items-center text-center max-h-[90vh] overflow-y-auto no-scrollbar">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowIntroModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* MOE Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-wide uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Singapore MOE Curriculum · Grade 5</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
              Rounding <span className="text-amber-400 text-glow-gold">Whole Numbers</span>
            </h1>

            {/* Mascot Avatar & Speech Bubble */}
            <div className="flex items-center gap-3 my-3 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10">
              <div className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center text-2xl shadow-lg border-2 border-white">
                🦁
              </div>
              <p className="text-sm font-bold text-amber-200">
                "Ready to round like a pro? 🎯"
              </p>
            </div>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-200 max-w-lg mb-6 leading-relaxed">
              Join <span className="font-extrabold text-amber-300">Leo</span> on a rounding expedition to estimate, discover, and master numbers up to <span className="font-extrabold text-amber-300">10 million</span>!
            </p>

            {/* Your Learning Journey 5 Steps */}
            <div className="w-full bg-[#180f38] p-4 rounded-2xl border border-white/10 mb-6">
              <h3 className="text-xs font-black tracking-wider text-amber-400 uppercase mb-3">
                YOUR LEARNING JOURNEY
              </h3>
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold mb-1 border border-purple-400/30">🧠</div>
                  <span className="font-extrabold text-white text-[11px]">Wonder</span>
                  <span className="text-[9px] text-white/50 hidden sm:block">Spark curiosity</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold mb-1 border border-blue-400/30">📖</div>
                  <span className="font-extrabold text-white text-[11px]">Story</span>
                  <span className="text-[9px] text-white/50 hidden sm:block">Explore tale</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold mb-1 border border-emerald-400/30">🧪</div>
                  <span className="font-extrabold text-white text-[11px]">Simulate</span>
                  <span className="text-[9px] text-white/50 hidden sm:block">4 Labs</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold mb-1 border border-amber-400/30">🎮</div>
                  <span className="font-extrabold text-white text-[11px]">Play</span>
                  <span className="text-[9px] text-white/50 hidden sm:block">10 Worlds</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center font-bold mb-1 border border-pink-400/30">📜</div>
                  <span className="font-extrabold text-white text-[11px]">Reflect</span>
                  <span className="text-[9px] text-white/50 hidden sm:block">Certificate</span>
                </div>
              </div>
            </div>

            {/* Primary CTA */}
            <button
              onClick={handleBeginJourney}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mb-6 cursor-pointer"
            >
              <span>🚀 Begin Your Journey!</span>
            </button>

            {/* 3 Feature Chips */}
            <div className="flex flex-wrap justify-center gap-3 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-amber-300 font-bold flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Round & Estimate
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-emerald-300 font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> 4 Simulations
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-purple-300 font-bold flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> 10 Number Worlds
              </span>
            </div>

          </div>
        </div>
      ) : null}

      {/* Main Wonder Phase Content */}
      <div className="w-full flex flex-col items-center gap-4 sm:gap-6 text-center my-auto">
        
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
                speakText("We might need to round UP to 49,000!");
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
    </div>
  );
}
