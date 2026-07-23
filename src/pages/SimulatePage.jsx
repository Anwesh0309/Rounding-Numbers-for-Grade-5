import React, { useState, useEffect } from 'react';
import { useJourney } from '../context/JourneyContext';
import { speakText } from '../utils/audio';
import { Sparkles, CheckCircle, XCircle, ArrowLeft, ArrowRight, RefreshCw, AlertCircle, Volume2 } from 'lucide-react';

export default function SimulatePage() {
  const { completePhaseAndNavigate, isAudioMuted } = useJourney();

  const [activeTab, setActiveTab] = useState(0); // 0: Section A, 1: Section B, 2: Section C, 3: Section D
  const [qIndices, setQIndices] = useState([0, 0, 0, 0]); // Current question index for each section (0..2)
  const [popup, setPopup] = useState(null); // { isCorrect: bool, title: string, message: string }

  // SECTION A: Number Line Zoom (3 Questions)
  const sectionAQuestions = [
    {
      id: 1,
      targetNum: 48732,
      targetPlace: 'nearest 1,000',
      optionA: 48000,
      optionB: 49000,
      correct: 49000,
      explanation: '48,732 is past halfway (48,500), so it rounds UP to 49,000!'
    },
    {
      id: 2,
      targetNum: 3482,
      targetPlace: 'nearest 1,000',
      optionA: 3000,
      optionB: 4000,
      correct: 3000,
      explanation: '3,482 has a hundreds digit of 4 (< 5), so it rounds DOWN to 3,000!'
    },
    {
      id: 3,
      targetNum: 68472,
      targetPlace: 'nearest 10,000',
      optionA: 60000,
      optionB: 70000,
      correct: 70000,
      explanation: '68,472 has a thousands digit of 8 (≥ 5), so it rounds UP to 70,000!'
    }
  ];

  // SECTION B: Place Value Spotlight (3 Questions)
  const sectionBQuestions = [
    {
      id: 1,
      numText: "68,472",
      prompt: "Round 68,472 to the nearest 1,000. Tap the DECIDER digit!",
      digits: [
        { digit: '6', label: 'Ten Thousands', isDecider: false },
        { digit: '8', label: 'Thousands (Target)', isDecider: false },
        { digit: '4', label: 'Hundreds (Decider)', isDecider: true },
        { digit: '7', label: 'Tens', isDecider: false },
        { digit: '2', label: 'Ones', isDecider: false },
      ],
      explanation: 'The Hundreds digit (4) is immediately to the right of Thousands! Since 4 < 5, we keep 68,000.'
    },
    {
      id: 2,
      numText: "48,732",
      prompt: "Round 48,732 to the nearest 10,000. Tap the DECIDER digit!",
      digits: [
        { digit: '4', label: 'Ten Thousands (Target)', isDecider: false },
        { digit: '8', label: 'Thousands (Decider)', isDecider: true },
        { digit: '7', label: 'Hundreds', isDecider: false },
        { digit: '3', label: 'Tens', isDecider: false },
        { digit: '2', label: 'Ones', isDecider: false },
      ],
      explanation: 'The Thousands digit (8) is the decider! Since 8 ≥ 5, we round UP to 50,000.'
    },
    {
      id: 3,
      numText: "384,400",
      prompt: "Round 384,400 to the nearest 100,000. Tap the DECIDER digit!",
      digits: [
        { digit: '3', label: 'Hundred Thousands', isDecider: false },
        { digit: '8', label: 'Ten Thousands (Decider)', isDecider: true },
        { digit: '4', label: 'Thousands', isDecider: false },
        { digit: '4', label: 'Hundreds', isDecider: false },
        { digit: '0', label: 'Tens', isDecider: false },
        { digit: '0', label: 'Ones', isDecider: false },
      ],
      explanation: 'The Ten-Thousands digit (8) is the decider! Since 8 ≥ 5, we round UP to 400,000.'
    }
  ];

  // SECTION C: Rounding Slider (3 Questions)
  const sectionCQuestions = [
    {
      id: 1,
      startVal: 6843,
      roundTo: 10,
      correctTarget: 6840,
      prompt: "Round 6,843 to the nearest 10. Choose the rounded number!",
      options: [6840, 6850],
      explanation: "Ones digit is 3 (< 5), so it rounds DOWN to 6,840!"
    },
    {
      id: 2,
      startVal: 24378,
      roundTo: 100,
      correctTarget: 24400,
      prompt: "Round 24,378 to the nearest 100. Choose the rounded number!",
      options: [24300, 24400],
      explanation: "Tens digit is 7 (≥ 5), so it rounds UP to 24,400!"
    },
    {
      id: 3,
      startVal: 158920,
      roundTo: 1000,
      correctTarget: 159000,
      prompt: "Round 158,920 to the nearest 1,000. Choose the rounded number!",
      options: [158000, 159000],
      explanation: "Hundreds digit is 9 (≥ 5), so it rounds UP to 159,000!"
    }
  ];

  // SECTION D: Spot the Error (3 Questions)
  const sectionDQuestions = [
    {
      id: 1,
      title: "Spot the Error in 4,519",
      steps: [
        { id: 1, text: "Step 1: Round 4,519 to the nearest 100.", isError: false },
        { id: 2, text: "Step 2: Look at the tens digit (1).", isError: false },
        { id: 3, text: "Step 3: Since 1 < 5, round UP to 4,600.", isError: true },
      ],
      explanation: "Step 3 is wrong because 1 < 5 means we round DOWN to 4,500, not UP!"
    },
    {
      id: 2,
      title: "Spot the Error in 82,940",
      steps: [
        { id: 1, text: "Step 1: Round 82,940 to the nearest 10,000.", isError: false },
        { id: 2, text: "Step 2: Look at thousands digit (2).", isError: false },
        { id: 3, text: "Step 3: Since 2 < 5, round UP to 90,000.", isError: true },
      ],
      explanation: "Step 3 is wrong because 2 < 5 keeps 80,000!"
    },
    {
      id: 3,
      title: "Spot the Error in 384,400",
      steps: [
        { id: 1, text: "Step 1: Round 384,400 to the nearest 100,000.", isError: false },
        { id: 2, text: "Step 2: Look at ten-thousands digit (8).", isError: false },
        { id: 3, text: "Step 3: Since 8 ≥ 5, keep 300,000.", isError: true },
      ],
      explanation: "Step 3 is wrong because 8 ≥ 5 rounds UP to 400,000!"
    }
  ];

  // Auto-switch popup after 1.2 seconds matching screenshot request
  useEffect(() => {
    if (popup) {
      const timer = setTimeout(() => {
        advanceQuestionOrSection();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [popup]);

  // Audio narration on tab/question change
  useEffect(() => {
    if (!isAudioMuted && !popup) {
      if (activeTab === 0) speakText(`Section A Question ${qIndices[0] + 1}: ${sectionAQuestions[qIndices[0]].targetNum} to ${sectionAQuestions[qIndices[0]].targetPlace}`);
      if (activeTab === 1) speakText(`Section B Question ${qIndices[1] + 1}: ${sectionBQuestions[qIndices[1]].prompt}`);
      if (activeTab === 2) speakText(`Section C Question ${qIndices[2] + 1}: ${sectionCQuestions[qIndices[2]].prompt}`);
      if (activeTab === 3) speakText(`Section D Question ${qIndices[3] + 1}: ${sectionDQuestions[qIndices[3]].title}`);
    }
  }, [activeTab, qIndices, isAudioMuted]);

  const advanceQuestionOrSection = () => {
    setPopup(null);
    const currentQIdx = qIndices[activeTab];

    if (currentQIdx < 2) {
      // Advance to next question in current section
      setQIndices(prev => {
        const next = [...prev];
        next[activeTab] = currentQIdx + 1;
        return next;
      });
    } else {
      // Completed all 3 questions in current section
      if (activeTab < 3) {
        // Move to next section
        setActiveTab(prev => prev + 1);
      } else {
        // Completed Section D -> Proceed to Play Phase
        completePhaseAndNavigate('simulate', 'play');
      }
    }
  };

  const handleAnswerClick = (isCorrect, explanation) => {
    if (popup) return;

    if (isCorrect) {
      setPopup({
        isCorrect: true,
        title: "Correct! 🎉",
        message: explanation
      });
      if (!isAudioMuted) speakText(`Correct! ${explanation}`);
    } else {
      setPopup({
        isCorrect: false,
        title: "Not quite!",
        message: explanation
      });
      if (!isAudioMuted) speakText(`Not quite! ${explanation}`);
    }
  };

  const currentSecAQ = sectionAQuestions[qIndices[0]];
  const currentSecBQ = sectionBQuestions[qIndices[1]];
  const currentSecCQ = sectionCQuestions[qIndices[2]];
  const currentSecDQ = sectionDQuestions[qIndices[3]];

  return (
    <div className="w-full max-w-4xl h-full flex flex-col justify-between items-center py-2 relative">
      
      {/* Feedback Modal Popup matching screenshot (Vibrant Green for Correct, Red for Incorrect) */}
      {popup && (
        <div 
          onClick={advanceQuestionOrSection}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn cursor-pointer"
        >
          <div className={`w-full max-w-xs sm:max-w-sm p-6 sm:p-8 rounded-3xl text-center flex flex-col items-center shadow-2xl text-white transform transition-all scale-100 ${
            popup.isCorrect ? 'bg-[#3eb655]' : 'bg-[#d9383a]'
          }`}>
            <div className="text-4xl mb-2">
              {popup.isCorrect ? '🎉' : '🥺'}
            </div>

            <h3 className="text-2xl font-black mb-2 text-white">
              {popup.title}
            </h3>

            <p className="text-xs sm:text-sm text-white/90 font-bold leading-relaxed mb-1">
              {popup.message}
            </p>

            <span className="text-[10px] text-white/70 mt-2 font-medium">
              Auto-switching in 1s...
            </span>
          </div>
        </div>
      )}

      {/* Top Section Tabs (Section A, B, C, D) */}
      <div className="w-full flex items-center justify-center gap-2 mb-3 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
          {[
            { label: 'Section A: Number Line', icon: '📏' },
            { label: 'Section B: Place Value', icon: '🔍' },
            { label: 'Section C: Rounding Slider', icon: '🎛️' },
            { label: 'Section D: Spot Error', icon: '⚠️' }
          ].map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeTab === idx
                  ? 'bg-amber-400 text-slate-950 shadow-md scale-105 ring-2 ring-amber-300/50'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className="text-[10px] opacity-80">({qIndices[idx] + 1}/3)</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Workable Station Frame */}
      <div className="w-full flex-1 glass-panel rounded-3xl p-5 sm:p-6 border border-white/20 shadow-2xl flex flex-col justify-between items-center text-center min-h-0 overflow-y-auto no-scrollbar">
        
        {/* SECTION A: Number Line Zoom */}
        {activeTab === 0 && (
          <div className="w-full flex flex-col items-center justify-between h-full">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-black uppercase mb-2">
                📏 Section A: Question {qIndices[0] + 1} of 3
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
                Which number is <span className="text-amber-400 text-glow-gold">{currentSecAQ.targetNum.toLocaleString()}</span> closer to ({currentSecAQ.targetPlace})?
              </h2>
              <p className="text-xs text-slate-300 mb-4">
                Tap the correct endpoint marker on the interactive number line!
              </p>
            </div>

            {/* Interactive Number Line */}
            <div className="w-full max-w-lg bg-slate-950/70 p-6 rounded-3xl border border-white/15 shadow-inner my-auto">
              <div className="relative w-full h-8 flex items-center mb-6">
                <div className="absolute inset-x-0 h-3 bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500 rounded-full"></div>
                
                {/* Marker Badge */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-4 bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full shadow-lg border border-white">
                  📍 {currentSecAQ.targetNum.toLocaleString()}
                </div>
              </div>

              {/* Endpoint Choice Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleAnswerClick(currentSecAQ.optionA === currentSecAQ.correct, currentSecAQ.explanation)}
                  className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-amber-400/20 border border-white/20 hover:border-amber-400/50 text-white font-extrabold text-base sm:text-lg transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
                >
                  {currentSecAQ.optionA.toLocaleString()}
                </button>
                <button
                  onClick={() => handleAnswerClick(currentSecAQ.optionB === currentSecAQ.correct, currentSecAQ.explanation)}
                  className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-amber-400/20 border border-white/20 hover:border-amber-400/50 text-white font-extrabold text-base sm:text-lg transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
                >
                  {currentSecAQ.optionB.toLocaleString()}
                </button>
              </div>
            </div>

            <div className="text-xs text-amber-300/80 font-bold">
              Tip: Look at the digit immediately to the right of the target place value!
            </div>
          </div>
        )}

        {/* SECTION B: Place Value Spotlight */}
        {activeTab === 1 && (
          <div className="w-full flex flex-col items-center justify-between h-full">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-black uppercase mb-2">
                🔍 Section B: Question {qIndices[1] + 1} of 3
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
                {currentSecBQ.prompt}
              </h2>
              <p className="text-xs text-slate-300 mb-4">
                Tap the digit that decides whether we round UP or DOWN!
              </p>
            </div>

            {/* Digits Display */}
            <div className="w-full max-w-lg bg-slate-950/70 p-6 rounded-3xl border border-white/15 shadow-inner my-auto">
              <div className="flex justify-center items-center gap-2 sm:gap-3 flex-wrap mb-4">
                {currentSecBQ.digits.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerClick(item.isDecider, currentSecBQ.explanation)}
                    className="flex flex-col items-center p-3 rounded-2xl bg-white/10 hover:bg-amber-400/30 border border-white/20 hover:border-amber-400 text-white font-black text-xl sm:text-2xl transition-all shadow-md cursor-pointer hover:scale-110 active:scale-95 group"
                  >
                    <span>{item.digit}</span>
                    <span className="text-[9px] font-bold text-slate-300 group-hover:text-amber-200 mt-1">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-amber-300/80 font-bold">
              Rule: Digits 5, 6, 7, 8, 9 round UP. Digits 0, 1, 2, 3, 4 round DOWN!
            </div>
          </div>
        )}

        {/* SECTION C: Rounding Slider */}
        {activeTab === 2 && (
          <div className="w-full flex flex-col items-center justify-between h-full">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase mb-2">
                🎛️ Section C: Question {qIndices[2] + 1} of 3
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
                {currentSecCQ.prompt}
              </h2>
              <p className="text-xs text-slate-300 mb-4">
                Original Number: <span className="text-amber-400 font-extrabold text-base">{currentSecCQ.startVal.toLocaleString()}</span>
              </p>
            </div>

            {/* Slider Option Buttons */}
            <div className="w-full max-w-md bg-slate-950/70 p-6 rounded-3xl border border-white/15 shadow-inner my-auto flex flex-col items-center gap-4">
              <div className="text-sm font-bold text-slate-200">
                Choose the correct rounded result:
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                {currentSecCQ.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerClick(opt === currentSecCQ.correctTarget, currentSecCQ.explanation)}
                    className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-amber-400/20 border border-white/20 hover:border-amber-400/50 text-white font-extrabold text-base sm:text-lg transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
                  >
                    {opt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-amber-300/80 font-bold">
              Check the decider digit right next door before rounding!
            </div>
          </div>
        )}

        {/* SECTION D: Spot the Error */}
        {activeTab === 3 && (
          <div className="w-full flex flex-col items-center justify-between h-full">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-black uppercase mb-2">
                ⚠️ Section D: Question {qIndices[3] + 1} of 3
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
                {currentSecDQ.title}
              </h2>
              <p className="text-xs text-slate-300 mb-4">
                Tap the step that contains the deliberate rounding mistake!
              </p>
            </div>

            {/* 3 Step Cards */}
            <div className="w-full max-w-lg space-y-3 my-auto">
              {currentSecDQ.steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => handleAnswerClick(step.isError, currentSecDQ.explanation)}
                  className="w-full text-left p-4 rounded-2xl bg-white/10 hover:bg-amber-400/20 border border-white/15 hover:border-amber-400 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md cursor-pointer hover:scale-102 active:scale-98 flex items-center justify-between group"
                >
                  <span>{step.text}</span>
                  <span className="text-xs text-amber-300 opacity-0 group-hover:opacity-100 font-black">
                    Tap to spot 🔍
                  </span>
                </button>
              ))}
            </div>

            <div className="text-xs text-amber-300/80 font-bold">
              Spot the mistake to unlock the Quiz Challenge!
            </div>
          </div>
        )}

      </div>

      {/* Bottom Navigation & Finish Station */}
      <div className="w-full flex items-center justify-between pt-3 shrink-0">
        <button
          disabled={activeTab === 0}
          onClick={() => setActiveTab(prev => Math.max(0, prev - 1))}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 0
              ? 'bg-white/5 text-white/30 cursor-not-allowed'
              : 'bg-white/10 hover:bg-white/20 text-white border border-white/15 cursor-pointer'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Section</span>
        </button>

        <button
          onClick={() => {
            if (activeTab < 3) {
              setActiveTab(prev => prev + 1);
            } else {
              completePhaseAndNavigate('simulate', 'play');
            }
          }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <span>
            {activeTab === 3 ? 'Start Quiz Challenge 🎮' : 'Next Section →'}
          </span>
        </button>
      </div>

    </div>
  );
}
