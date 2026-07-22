import React, { useState, useEffect } from 'react';
import { useJourney } from '../context/JourneyContext';
import { speakText } from '../utils/audio';
import { Sparkles, CheckCircle, XCircle, ArrowLeft, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

export default function SimulatePage() {
  const { completePhase, navigateToPhase, isAudioMuted } = useJourney();
  
  const [activeTab, setActiveTab] = useState(0); // 0: Number Line, 1: Place Value, 2: Slider, 3: Spot Error
  const [popup, setPopup] = useState(null); // { isCorrect: bool, title: string, message: string }

  // Tab 0: Number Line State
  const [numLineVal, setNumLineVal] = useState(48732);
  const numLineTargetRound = 49000;

  // Tab 1: Place Value State
  const [spotlightPlace, setSpotlightPlace] = useState('1000'); // target round to nearest 1,000
  const spotlightDigits = [
    { digit: '6', place: 'Ten Thousands', isDecider: false },
    { digit: '8', place: 'Thousands (Target)', isDecider: false },
    { digit: '4', place: 'Hundreds (Decider)', isDecider: true },
    { digit: '7', place: 'Tens', isDecider: false },
    { digit: '2', place: 'Ones', isDecider: false },
  ];

  // Tab 2: Rounding Slider State
  const [sliderVal, setSliderVal] = useState(6847);
  const sliderRoundTo = 10;
  const onesDigit = sliderVal % 10;
  const roundedResult = Math.round(sliderVal / sliderRoundTo) * sliderRoundTo;
  const isRoundUp = onesDigit >= 5;

  // Tab 3: Spot Error State
  const errorSteps = [
    { id: 1, text: "Step 1: Round 4,519 to the nearest 100.", isError: false },
    { id: 2, text: "Step 2: Look at the tens digit (1).", isError: false },
    { id: 3, text: "Step 3: Since 1 < 5, round UP to 4,600.", isError: true },
  ];

  useEffect(() => {
    if (!isAudioMuted) {
      if (activeTab === 0) speakText("Station 1: Number Line Zoom. Drag to find which round marker is closer.");
      if (activeTab === 1) speakText("Station 2: Place Value Spotlight. Tap the decider digit that determines rounding.");
      if (activeTab === 2) speakText("Station 3: Rounding Slider. Drag the slider and watch rounding update live.");
      if (activeTab === 3) speakText("Station 4: Spot the Rounding Error. Tap the step that contains the deliberate mistake.");
    }
  }, [activeTab, isAudioMuted]);

  const handleNextTab = () => {
    if (activeTab < 3) {
      setActiveTab(prev => prev + 1);
    } else {
      completePhase('simulate');
      navigateToPhase('play');
    }
  };

  const handlePrevTab = () => {
    if (activeTab > 0) setActiveTab(prev => prev - 1);
  };

  const checkNumberLine = (choice) => {
    if (choice === 49000) {
      setPopup({
        isCorrect: true,
        title: "Correct! 🎉",
        message: "48,732 is closer to 49,000 because 732 is greater than half-way (500)!"
      });
      if (!isAudioMuted) speakText("Correct! 48,732 is closer to 49,000.");
    } else {
      setPopup({
        isCorrect: false,
        title: "Try Again! ❌",
        message: "48,732 is past the halfway mark of 48,500, so it rounds UP to 49,000."
      });
      if (!isAudioMuted) speakText("Try again! 48,732 is closer to 49,000.");
    }
  };

  const checkSpotlightDigit = (item) => {
    if (item.isDecider) {
      setPopup({
        isCorrect: true,
        title: "Spot On! 🎉",
        message: "Awesome! The Hundreds digit (4) is immediately to the right of Thousands. Since 4 < 5, we keep 68,000!"
      });
      if (!isAudioMuted) speakText("Spot on! The Hundreds digit is the decider digit.");
    } else {
      setPopup({
        isCorrect: false,
        title: "Not Quite! ❌",
        message: "To round to the nearest Thousand, always look at the Hundreds digit right next door!"
      });
      if (!isAudioMuted) speakText("Not quite! Look at the digit immediately to the right.");
    }
  };

  const checkSpotError = (step) => {
    if (step.isError) {
      setPopup({
        isCorrect: true,
        title: "Mistake Spotted! 🎉",
        message: "Brilliant! Since 1 < 5, we keep the hundreds place unchanged (4,500), NOT round up to 4,600!"
      });
      if (!isAudioMuted) speakText("Brilliant! 1 is less than 5, so we keep 4,500.");
    } else {
      setPopup({
        isCorrect: false,
        title: "Try Again! ❌",
        message: "This step is mathematically correct. Look for where the rounding rule was applied wrongly!"
      });
    }
  };

  return (
    <div className="w-full max-w-4xl h-full flex flex-col justify-between items-center py-2 relative">
      
      {/* Simulation Feedback Popup Modal (Change 5 Requirement) */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-white/20 shadow-2xl text-center flex flex-col items-center">
            {popup.isCorrect ? (
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mb-4 text-3xl">
                <CheckCircle className="w-10 h-10" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-400 text-red-400 flex items-center justify-center mb-4 text-3xl">
                <XCircle className="w-10 h-10" />
              </div>
            )}

            <h3 className={`text-2xl font-black mb-2 ${popup.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
              {popup.title}
            </h3>
            <p className="text-sm text-slate-100 mb-6 leading-relaxed">
              {popup.message}
            </p>

            <button
              onClick={() => setPopup(null)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-sm shadow-lg hover:scale-105 transition-all cursor-pointer"
            >
              Continue Exploring 🧪
            </button>
          </div>
        </div>
      )}

      {/* Top Station Tabs */}
      <div className="w-full flex items-center justify-center gap-2 mb-3 shrink-0">
        {[
          { label: 'Number Line Zoom', icon: '📏' },
          { label: 'Place Value Spotlight', icon: '🔍' },
          { label: 'Rounding Slider', icon: '🎛️' },
          { label: 'Spot the Error', icon: '⚠️' }
        ].map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all ${
              activeTab === idx
                ? 'bg-amber-400 text-slate-950 shadow-md scale-105 ring-2 ring-amber-300/50'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Interactive Station Card */}
      <div className="w-full flex-1 glass-panel rounded-3xl p-5 sm:p-6 border border-white/20 shadow-2xl flex flex-col justify-between items-center text-center min-h-0 overflow-y-auto no-scrollbar">
        
        {/* TAB 0: Number Line Zoom */}
        {activeTab === 0 && (
          <div className="w-full flex flex-col items-center justify-between h-full">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase mb-2">
                📏 Station 1: Number Line Zoom
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
                Which thousand is <span className="text-amber-400 text-glow-gold">48,732</span> closer to?
              </h2>
              <p className="text-xs text-slate-300 mb-6">
                Drag the marker or tap the correct rounded endpoint below!
              </p>
            </div>

            {/* Visual Interactive Number Line */}
            <div className="w-full max-w-xl bg-slate-950/60 p-6 rounded-2xl border border-white/15 relative my-4">
              <div className="w-full h-3 bg-white/20 rounded-full relative my-6">
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-amber-400 border-2 border-white shadow-xl flex items-center justify-center text-xs font-black text-slate-950 transition-all"
                  style={{ left: '73%' }}
                >
                  📍
                </div>
              </div>

              {/* Endpoints */}
              <div className="flex justify-between text-xs sm:text-sm font-black text-amber-300">
                <span>48,000</span>
                <span className="text-slate-400 text-[10px]">48,500 (Midpoint)</span>
                <span>49,000</span>
              </div>
            </div>

            {/* Answer Buttons */}
            <div className="flex gap-4 my-2">
              <button
                onClick={() => checkNumberLine(48000)}
                className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-black text-sm transition-all cursor-pointer"
              >
                48,000
              </button>
              <button
                onClick={() => checkNumberLine(49000)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-sm shadow-lg hover:scale-105 transition-all cursor-pointer"
              >
                49,000 ✨
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: Place Value Spotlight */}
        {activeTab === 1 && (
          <div className="w-full flex flex-col items-center justify-between h-full">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-black uppercase mb-2">
                🔍 Station 2: Place Value Spotlight
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
                To round <span className="text-amber-400 text-glow-gold">68,472</span> to the nearest 1,000, tap the <span className="text-cyan-300">DECIDER DIGIT</span>!
              </h2>
              <p className="text-xs text-slate-300 mb-4">
                Hint: The decider digit is always right next door to the target place value.
              </p>
            </div>

            {/* Interactive Digits Row */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 my-4">
              {spotlightDigits.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => checkSpotlightDigit(item)}
                  className="flex flex-col items-center p-3 sm:p-4 rounded-2xl bg-white/10 hover:bg-amber-400/20 border border-white/15 hover:border-amber-400/40 transition-all group cursor-pointer"
                >
                  <span className="text-xs text-slate-300 font-bold mb-1">{item.place}</span>
                  <span className="text-3xl sm:text-4xl font-black text-amber-300 group-hover:scale-110 transition-transform">
                    {item.digit}
                  </span>
                </button>
              ))}
            </div>

            <p className="text-xs text-amber-200 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              💡 Tap any digit above to check if it's the decider digit!
            </p>
          </div>
        )}

        {/* TAB 2: Rounding Slider */}
        {activeTab === 2 && (
          <div className="w-full flex flex-col items-center justify-between h-full">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-black uppercase mb-2">
                🎛️ Station 3: Rounding Slider
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
                Drag the slider — watch the rounding update live!
              </h2>
            </div>

            {/* Live Interactive Slider Box */}
            <div className="w-full max-w-lg bg-slate-950/70 p-6 rounded-2xl border border-white/15 my-3 shadow-inner">
              <div className="flex justify-between items-center mb-4">
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-400 block uppercase">Original Number</span>
                  <span className="text-3xl font-black text-white">{sliderVal}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 block uppercase">Round to Nearest 10</span>
                  <span className="text-3xl font-black text-amber-400 text-glow-gold">{roundedResult}</span>
                </div>
              </div>

              {/* Slider Input */}
              <input 
                type="range"
                min="6840"
                max="6849"
                value={sliderVal}
                onChange={(e) => setSliderVal(Number(e.target.value))}
                className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400 my-4"
              />

              {/* Live Rule Callout */}
              <div className={`p-3 rounded-xl border text-sm font-extrabold transition-all ${
                isRoundUp
                  ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                  : 'bg-blue-500/20 border-blue-400/40 text-blue-300'
              }`}>
                {isRoundUp ? (
                  <span>⚠️ Ones digit is {onesDigit} (≥ 5) — round UP! ({sliderVal} → {roundedResult})</span>
                ) : (
                  <span>ℹ️ Ones digit is {onesDigit} (&lt; 5) — KEEP tens digit! ({sliderVal} → {roundedResult})</span>
                )}
              </div>
            </div>

            {/* Refresh Number Button */}
            <button
              onClick={() => setSliderVal(6840 + Math.floor(Math.random() * 10))}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-amber-300 border border-white/15 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Generate New Digit</span>
            </button>
          </div>
        )}

        {/* TAB 3: Spot the Error */}
        {activeTab === 3 && (
          <div className="w-full flex flex-col items-center justify-between h-full">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-black uppercase mb-2">
                ⚠️ Station 4: Spot the Rounding Error
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
                Tap the step that contains the <span className="text-rose-400">deliberate mistake</span>!
              </h2>
            </div>

            {/* Error Steps List */}
            <div className="w-full max-w-lg space-y-3 my-4">
              {errorSteps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => checkSpotError(step)}
                  className="w-full p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 hover:border-amber-400/40 text-left transition-all flex items-center justify-between group cursor-pointer shadow-md"
                >
                  <span className="text-sm font-extrabold text-white group-hover:text-amber-300">
                    {step.text}
                  </span>
                  <AlertCircle className="w-5 h-5 text-amber-400 opacity-50 group-hover:opacity-100 shrink-0 ml-2" />
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-300 italic">
              One of the steps above applied the rounding rule incorrectly. Tap it to catch the error!
            </p>
          </div>
        )}

      </div>

      {/* Footer Station Navigation */}
      <div className="w-full flex items-center justify-between pt-3 shrink-0">
        <button
          disabled={activeTab === 0}
          onClick={handlePrevTab}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 0
              ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
              : 'bg-white/10 hover:bg-white/20 text-white border border-white/15 cursor-pointer'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Station</span>
        </button>

        <button
          onClick={handleNextTab}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow-xl hover:scale-105 transition-all cursor-pointer"
        >
          <span>{activeTab === 3 ? 'Start Quiz Challenge 🎮' : 'Next Station →'}</span>
        </button>
      </div>

    </div>
  );
}
