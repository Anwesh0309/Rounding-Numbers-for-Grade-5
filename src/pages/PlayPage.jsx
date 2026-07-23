import React, { useState, useEffect } from 'react';
import { useJourney } from '../context/JourneyContext';
import { speakText } from '../utils/audio';
import questionsData from '../data/questions.json';
import worldsData from '../data/worlds.json';
import { Heart, Flame, Star, Lock, CheckCircle, XCircle, ArrowRight, Trophy, RefreshCw, Sparkles, HelpCircle } from 'lucide-react';

export default function PlayPage() {
  const { 
    hearts, 
    streak, 
    streakMultiplier, 
    xp, 
    recordAnswer, 
    completeWorldSession, 
    resetHeartsAndStreak,
    unlockedWorlds,
    starsByWorld,
    completePhaseAndNavigate,
    isAudioMuted
  } = useJourney();

  const [activeWorld, setActiveWorld] = useState(null); // null = World Select view
  const [worldQuestions, setWorldQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [feedbackPopup, setFeedbackPopup] = useState(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const startWorldSession = (world) => {
    if (!world) return;
    try {
      let pool = questionsData.filter(q => q.worldId === world.id);
      if (!pool || pool.length === 0) {
        pool = questionsData;
      }
      const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 8);

      resetHeartsAndStreak();
      setWorldQuestions(shuffled);
      setCurrentQIndex(0);
      setSessionCorrectCount(0);
      setSessionEnded(false);
      setFeedbackPopup(null);
      setShowHint(false);
      setActiveWorld(world);

      if (!isAudioMuted && shuffled.length > 0) {
        speakText(`Welcome to ${world.name}! ${shuffled[0].question}`);
      }
    } catch (e) {
      console.error('Error starting world session:', e);
    }
  };

  // Fail-safe questions calculation
  const activePool = activeWorld ? questionsData.filter(q => q.worldId === activeWorld.id) : [];
  const safeQuestions = (worldQuestions && worldQuestions.length > 0) 
    ? worldQuestions 
    : (activePool.length > 0 ? activePool.slice(0, 8) : questionsData.slice(0, 8));

  const currentQuestion = safeQuestions[currentQIndex] || safeQuestions[0];

  useEffect(() => {
    if (!isAudioMuted && currentQuestion && !feedbackPopup && !sessionEnded && activeWorld) {
      speakText(currentQuestion.question, `play-${currentQuestion.id}`);
    }
  }, [currentQIndex, isAudioMuted, activeWorld]);

  useEffect(() => {
    if (feedbackPopup) {
      const timer = setTimeout(() => {
        advanceQuestion();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [feedbackPopup]);

  useEffect(() => {
    setShowHint(false);
  }, [currentQIndex, activeWorld]);

  const handleSelectOption = (opt) => {
    if (feedbackPopup || sessionEnded || !currentQuestion) return;

    const isCorrect = opt === currentQuestion.correctAnswer;
    const worldId = activeWorld?.id || 'marble-meadow';
    const result = recordAnswer(isCorrect, worldId) || { gainedXp: 10 };
    const gainedXp = result.gainedXp || 10;

    if (isCorrect) {
      setSessionCorrectCount(prev => prev + 1);
      setFeedbackPopup({
        isCorrect: true,
        title: "Correct! 🎉",
        message: currentQuestion.explanation || "Great job!",
        xpGained: gainedXp
      });
      if (!isAudioMuted) speakText(`Correct! ${currentQuestion.explanation || ''}`);
    } else {
      setFeedbackPopup({
        isCorrect: false,
        title: "Not quite!",
        message: currentQuestion.explanation || "Try another answer!",
        xpGained: 0
      });
      if (!isAudioMuted) speakText(`Not quite! ${currentQuestion.explanation || ''}`);
    }
  };

  const advanceQuestion = () => {
    setFeedbackPopup(null);

    if (hearts <= 0 && !feedbackPopup?.isCorrect) {
      setSessionEnded(true);
      return;
    }

    if (currentQIndex < safeQuestions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      setSessionEnded(true);
      if (activeWorld) {
        completeWorldSession(activeWorld.id, sessionCorrectCount + (feedbackPopup?.isCorrect ? 1 : 0), safeQuestions.length, worldsData);
      }
    }
  };

  const safeUnlockedWorlds = Array.isArray(unlockedWorlds) && unlockedWorlds.length > 0 ? unlockedWorlds : ['marble-meadow'];
  const safeStarsByWorld = starsByWorld || {};

  const completedWorldsCount = worldsData.filter(w => (safeStarsByWorld[w.id] || 0) > 0).length;
  const hasCompletedAll10Worlds = completedWorldsCount >= worldsData.length;

  return (
    <div className="w-full max-w-5xl h-full flex flex-col justify-between items-center py-1 overflow-hidden relative">
      
      {/* Feedback Modal Popup matching screenshot */}
      {feedbackPopup && (
        <div 
          onClick={advanceQuestion}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn cursor-pointer"
        >
          <div className={`w-full max-w-xs sm:max-w-sm p-6 sm:p-8 rounded-3xl text-center flex flex-col items-center shadow-2xl text-white transform transition-all scale-100 ${
            feedbackPopup.isCorrect ? 'bg-[#3eb655]' : 'bg-[#d9383a]'
          }`}>
            <div className="text-4xl mb-2">
              {feedbackPopup.isCorrect ? '🎉' : '🥺'}
            </div>

            <h3 className="text-2xl font-black mb-2 text-white">
              {feedbackPopup.title}
            </h3>

            <p className="text-xs sm:text-sm text-white/90 font-bold leading-relaxed mb-1">
              {feedbackPopup.message}
            </p>

            <span className="text-[10px] text-white/70 mt-2 font-medium">
              Auto-switching in 1s...
            </span>
          </div>
        </div>
      )}

      {/* VIEW A: World Select Grid */}
      {activeWorld === null ? (
        <div className="w-full flex-1 flex flex-col justify-between items-center min-h-0 overflow-y-auto no-scrollbar">
          
          {/* Header Title Banner */}
          <div className="text-center mb-2 shrink-0">
            <h2 className="text-2xl sm:text-3xl font-black text-amber-400 tracking-wide">
              🎮 Rounding World Expedition
            </h2>
            <p className="text-xs font-bold text-slate-300">
              Conquer 10 Worlds & 100 Grade 5 Rounding Challenges! ({completedWorldsCount}/{worldsData.length} Worlds Completed)
            </p>
          </div>

          {/* 10 World Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full my-auto py-2">
            {worldsData.map((world, idx) => {
              const isUnlocked = safeUnlockedWorlds.includes(world.id);
              const stars = safeStarsByWorld[world.id] || 0;

              return (
                <div 
                  key={world.id}
                  className={`glass-panel p-3 rounded-2xl border flex flex-col items-center justify-between text-center transition-all ${
                    isUnlocked 
                      ? `${world.borderColor} bg-white/10 hover:bg-white/20 shadow-lg` 
                      : 'border-white/10 bg-slate-900/40 opacity-60'
                  }`}
                >
                  {/* Stars earned */}
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3].map(s => (
                      <Star 
                        key={s} 
                        className={`w-3.5 h-3.5 ${s <= stars ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`} 
                      />
                    ))}
                  </div>

                  <div className="text-3xl mb-1">{world.icon}</div>
                  
                  <h3 className="text-xs font-black text-white mb-0.5 line-clamp-1">{world.name}</h3>
                  <span className="text-[10px] text-amber-300 font-extrabold mb-2">{world.skill}</span>

                  <button
                    disabled={!isUnlocked}
                    onClick={() => startWorldSession(world)}
                    className={`w-full py-2 rounded-xl font-black text-xs transition-all ${
                      isUnlocked
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md hover:scale-105 cursor-pointer'
                        : 'bg-white/5 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    {isUnlocked ? 'PLAY' : 'LOCKED'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Proceed to Reflect CTA ONLY when all 10 worlds completed */}
          {hasCompletedAll10Worlds && (
            <div className="pt-2 shrink-0">
              <button
                onClick={() => {
                  completePhaseAndNavigate('play', 'reflect');
                }}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Trophy className="w-4 h-4" />
                <span>View Scoreboard & Certificate 📜</span>
              </button>
            </div>
          )}

        </div>
      ) : (

        /* VIEW B: Active Quiz Screen (STRICT SINGLE FRAME FIT) */
        <div className="w-full flex-1 flex flex-col justify-between items-center overflow-hidden max-h-full">
          
          {/* Quiz Top Stats Row */}
          <div className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-950/80 rounded-2xl border border-white/15 shrink-0 mb-2">
            
            {/* World Name */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveWorld(null)}
                className="text-xs text-slate-300 hover:text-white font-black underline cursor-pointer"
              >
                ← Worlds
              </button>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-400/40 tracking-wide">
                {activeWorld.icon} {activeWorld.name}
              </span>
            </div>

            {/* Stats: Hearts, Streak, XP */}
            <div className="flex items-center gap-3 text-xs font-black">
              <div className="flex items-center gap-1 text-red-400">
                {[...Array(3)].map((_, i) => (
                  <Heart 
                    key={i} 
                    className={`w-4 h-4 ${i < hearts ? 'text-red-500 fill-red-500' : 'text-white/20'}`} 
                  />
                ))}
              </div>

              <div className="flex items-center gap-1 text-amber-400 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/40 font-black">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>{streak}x Streak</span>
              </div>

              <div className="text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-400/40 font-black">
                ⚡ {xp} XP
              </div>
            </div>

          </div>

          {/* Quiz Session Finished Screen */}
          {sessionEnded ? (
            <div className="w-full flex-1 glass-panel p-8 rounded-3xl border border-white/20 shadow-2xl flex flex-col items-center justify-center text-center my-auto">
              <div className="w-20 h-20 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-4xl mb-4 shadow-xl">
                🏆
              </div>

              <h2 className="text-3xl font-black text-white mb-2">
                {activeWorld.name} Completed!
              </h2>

              <p className="text-sm font-bold text-slate-200 mb-6">
                You scored <span className="text-amber-400 font-black">{sessionCorrectCount} / {safeQuestions.length}</span> questions correctly!
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => startWorldSession(activeWorld)}
                  className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-black text-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>

                <button
                  onClick={() => setActiveWorld(null)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-sm shadow-xl hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Select Next World</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : currentQuestion ? (
            
            /* Active Question Card (Single Frame Layout) */
            <div className="w-full flex-1 glass-panel p-4 sm:p-5 rounded-3xl border border-white/20 shadow-2xl flex flex-col justify-between items-center text-center overflow-hidden">
              
              {/* Question Header & Skill */}
              <div className="w-full flex items-center justify-between text-xs text-slate-300 font-extrabold mb-1.5 shrink-0">
                <span className="bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                  Question <strong className="text-amber-400">{currentQIndex + 1}</strong> of {safeQuestions.length}
                </span>
                <span className="text-amber-300 font-black uppercase tracking-wider bg-amber-400/20 px-3 py-0.5 rounded-full border border-amber-400/30">
                  {currentQuestion.skill || 'Rounding Challenge'}
                </span>
              </div>

              {/* Center Content: Question Text, High-Contrast Chart & Hint */}
              <div className="my-auto py-1 flex flex-col items-center w-full shrink-0">
                
                {/* Question Prompt (High Contrast Bold Typography) */}
                <h2 className="text-lg sm:text-2xl font-black text-white leading-snug tracking-wide mb-2 text-glow">
                  {currentQuestion.question}
                </h2>

                {/* High-Contrast Bold Place Value Chart Table */}
                <QuestionChart questionText={currentQuestion.question} />

                {/* High-Contrast Bold Hint Section */}
                <div className="mt-2 flex flex-col items-center w-full">
                  <button
                    onClick={() => {
                      const nextState = !showHint;
                      setShowHint(nextState);
                      if (nextState && !isAudioMuted && currentQuestion) {
                        speakText(`Hint: ${currentQuestion.explanation || 'Look at the decider digit right next door!'}`, `play-${currentQuestion.id}-hint`);
                      }
                    }}
                    className="px-4 py-1.5 rounded-2xl bg-amber-400 text-slate-950 hover:bg-amber-300 text-xs sm:text-sm font-black flex items-center gap-2 transition-all shadow-lg border border-amber-200 cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                    <span>{showHint ? 'Hide Hint 💡' : '💡 Need a Hint?'}</span>
                  </button>

                  {/* Expandable High-Contrast Bold Hint Box */}
                  {showHint && (
                    <div className="animate-fadeIn mt-2 p-3 rounded-2xl bg-[#2d1b4e] border-2 border-amber-400 text-amber-100 text-xs sm:text-sm font-black leading-relaxed shadow-2xl max-w-lg w-full text-center tracking-wide">
                      <span className="text-amber-300 underline uppercase tracking-widest mr-1">Hint:</span>
                      {currentQuestion.explanation || 'Look at the decider digit right next door to determine whether to round UP or DOWN!'}
                    </div>
                  )}
                </div>

              </div>

              {/* 4 Answer Options 2x2 Grid (High Contrast Thick Buttons) */}
              <div className="w-full grid grid-cols-2 gap-2 sm:gap-3 mt-2 shrink-0">
                {currentQuestion.options && currentQuestion.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(opt)}
                    className="py-3 px-4 rounded-2xl bg-white/15 hover:bg-amber-400 hover:text-slate-950 border-2 border-white/30 hover:border-amber-300 text-base sm:text-xl font-black text-white transition-all transform hover:scale-102 active:scale-95 cursor-pointer shadow-lg tracking-wider"
                  >
                    {opt}
                  </button>
                ))}
              </div>

            </div>
          ) : (
            <div className="w-full flex-1 glass-panel p-8 rounded-3xl border border-white/20 shadow-2xl flex flex-col items-center justify-center text-center my-auto">
              <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3"></div>
              <h3 className="text-lg font-black text-white">Loading World Challenge...</h3>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

{/* High-Contrast Bold Place Value Chart Component */}
function QuestionChart({ questionText }) {
  try {
    if (!questionText || typeof questionText !== 'string') return null;

    const match = questionText.match(/\b\d{1,3}(,\d{3})*\b|\b\d+\b/);
    if (!match) return null;

    const rawNumStr = match[0];
    const digitsOnly = rawNumStr.replace(/,/g, '');
    if (digitsOnly.length <= 1) return null;

    const placeLabels = ['Ones', 'Tens', 'Hundreds', 'Thousands', 'Ten Thousands', 'Hundred Thousands', 'Millions'];
    const reversedDigits = digitsOnly.split('').reverse();
    const columns = reversedDigits.map((digit, idx) => ({
      name: placeLabels[idx] || `10^${idx}`,
      digit: digit
    })).reverse();

    return (
      <div className="w-full max-w-md my-1 bg-slate-950/90 p-2.5 rounded-2xl border-2 border-amber-400/60 shadow-xl">
        
        {/* Table Title Header */}
        <div className="text-[11px] sm:text-xs font-black text-amber-400 uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
          <span>📊</span>
          <span>PLACE VALUE CHART ({rawNumStr})</span>
        </div>

        {/* High-Contrast Table Grid */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-center border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-amber-400/40 text-[10px] sm:text-xs text-amber-200 font-black uppercase tracking-wider">
                {columns.map((col, idx) => (
                  <th key={idx} className="p-1 sm:p-1.5 whitespace-nowrap bg-white/10 first:rounded-tl-xl last:rounded-tr-xl">
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="font-black text-amber-300 text-sm sm:text-lg">
                {columns.map((col, idx) => (
                  <td key={idx} className="p-1 sm:p-1.5 bg-slate-900/90 border-r border-amber-400/20 last:border-0 font-black">
                    {col.digit}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  } catch (e) {
    return null;
  }
}
