import React, { useState, useEffect } from 'react';
import { useJourney } from '../context/JourneyContext';
import { speakText } from '../utils/audio';
import questionsData from '../data/questions.json';
import worldsData from '../data/worlds.json';
import { Heart, Flame, Star, Lock, CheckCircle, XCircle, ArrowRight, Trophy, RefreshCw } from 'lucide-react';

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
    completePhase,
    navigateToPhase,
    isAudioMuted
  } = useJourney();

  const [activeWorld, setActiveWorld] = useState(null); // null = World Select view
  const [worldQuestions, setWorldQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [feedbackPopup, setFeedbackPopup] = useState(null);
  const [sessionEnded, setSessionEnded] = useState(false);

  const startWorldSession = (world) => {
    setActiveWorld(world);
    resetHeartsAndStreak();
    
    // Sample 8 randomized questions for this world
    const pool = questionsData.filter(q => q.worldId === world.id);
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 8);
    setWorldQuestions(shuffled);
    setCurrentQIndex(0);
    setSessionCorrectCount(0);
    setSessionEnded(false);
    setFeedbackPopup(null);

    if (!isAudioMuted && shuffled.length > 0) {
      speakText(`Welcome to ${world.name}! ${shuffled[0].question}`);
    }
  };

  const currentQuestion = worldQuestions[currentQIndex];

  useEffect(() => {
    if (!isAudioMuted && currentQuestion && !feedbackPopup && !sessionEnded) {
      speakText(currentQuestion.question);
    }
  }, [currentQIndex, isAudioMuted, activeWorld]);

  const handleSelectOption = (opt) => {
    if (feedbackPopup || sessionEnded) return;

    const isCorrect = opt === currentQuestion.correctAnswer;
    const { gainedXp } = recordAnswer(isCorrect, activeWorld.id);

    if (isCorrect) {
      setSessionCorrectCount(prev => prev + 1);
      setFeedbackPopup({
        isCorrect: true,
        title: "Correct! 🎉",
        message: currentQuestion.explanation,
        xpGained: gainedXp
      });
      if (!isAudioMuted) speakText(`Correct! ${currentQuestion.explanation}`);
    } else {
      setFeedbackPopup({
        isCorrect: false,
        title: "Incorrect! ❌",
        message: currentQuestion.explanation,
        xpGained: 0
      });
      if (!isAudioMuted) speakText(`Incorrect. ${currentQuestion.explanation}`);
    }
  };

  const advanceQuestion = () => {
    setFeedbackPopup(null);

    if (hearts <= 0 && !feedbackPopup?.isCorrect) {
      // Out of hearts
      setSessionEnded(true);
      return;
    }

    if (currentQIndex < worldQuestions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      // Finished all 8 questions in this world!
      setSessionEnded(true);
      completeWorldSession(activeWorld.id, sessionCorrectCount + (feedbackPopup?.isCorrect ? 1 : 0), worldQuestions.length, worldsData);
    }
  };

  return (
    <div className="w-full max-w-5xl h-full flex flex-col justify-between items-center py-2 relative">
      
      {/* Feedback Modal Popup */}
      {feedbackPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-white/20 shadow-2xl text-center flex flex-col items-center">
            {feedbackPopup.isCorrect ? (
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mb-3 text-3xl">
                <CheckCircle className="w-10 h-10" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-400 text-red-400 flex items-center justify-center mb-3 text-3xl">
                <XCircle className="w-10 h-10" />
              </div>
            )}

            <h3 className={`text-2xl font-black mb-1 ${feedbackPopup.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
              {feedbackPopup.title}
            </h3>

            {feedbackPopup.isCorrect && (
              <span className="inline-block px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black mb-3">
                +{feedbackPopup.xpGained} XP Gained! 🔥
              </span>
            )}

            <p className="text-xs sm:text-sm text-slate-100 mb-6 leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/10 w-full">
              {feedbackPopup.message}
            </p>

            <button
              onClick={advanceQuestion}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-sm shadow-lg hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW A: World Select Grid */}
      {!activeWorld ? (
        <div className="w-full flex-1 flex flex-col justify-between items-center min-h-0 overflow-y-auto no-scrollbar">
          
          <div className="text-center mb-4 shrink-0">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">
              Select Your <span className="text-amber-400 text-glow-gold">Rounding World</span>
            </h2>
            <p className="text-xs text-slate-300">
              10 Singapore MOE-aligned rounding & estimation challenge worlds
            </p>
          </div>

          {/* 10 World Cards Grid */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 p-2 my-auto">
            {worldsData.map((world, idx) => {
              const isUnlocked = unlockedWorlds.includes(world.id);
              const stars = starsByWorld[world.id] || 0;

              return (
                <div
                  key={world.id}
                  className={`glass-panel p-3.5 rounded-2xl border transition-all duration-300 flex flex-col justify-between items-center text-center relative ${
                    isUnlocked
                      ? `${world.borderColor} hover:scale-105 shadow-xl`
                      : 'border-white/5 opacity-50 bg-slate-900/40'
                  }`}
                >
                  {/* Lock badge if locked */}
                  {!isUnlocked && (
                    <div className="absolute top-2 right-2 p-1 rounded-full bg-slate-950/80 text-white/50">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  )}

                  {/* Stars earned */}
                  <div className="flex gap-0.5 mb-1">
                    {[1, 2, 3].map(s => (
                      <Star 
                        key={s} 
                        className={`w-3 h-3 ${s <= stars ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`} 
                      />
                    ))}
                  </div>

                  <div className="text-3xl mb-1">{world.icon}</div>
                  
                  <h3 className="text-xs font-black text-white mb-0.5 line-clamp-1">{world.name}</h3>
                  <span className="text-[10px] text-amber-300 font-bold mb-2">{world.skill}</span>

                  <button
                    disabled={!isUnlocked}
                    onClick={() => startWorldSession(world)}
                    className={`w-full py-1.5 rounded-xl font-black text-xs transition-all ${
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

          {/* Proceed to Reflect CTA if play completed */}
          <div className="pt-3 shrink-0">
            <button
              onClick={() => {
                completePhase('play');
                navigateToPhase('reflect');
              }}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black text-xs shadow-lg hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>View Scoreboard & Certificate 📜</span>
            </button>
          </div>

        </div>
      ) : (

        /* VIEW B: Active Quiz Screen */
        <div className="w-full flex-1 flex flex-col justify-between items-center min-h-0 overflow-y-auto no-scrollbar">
          
          {/* Quiz Top Stats Row */}
          <div className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-slate-950/60 rounded-2xl border border-white/10 shrink-0 mb-3">
            
            {/* World Name */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveWorld(null)}
                className="text-xs text-slate-300 hover:text-white underline font-bold"
              >
                ← Worlds
              </button>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-400/30">
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

              <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>{streak}x Streak</span>
              </div>

              <div className="text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-400/20">
                ⚡ {xp} XP
              </div>
            </div>

          </div>

          {/* Quiz Session Finished Screen */}
          {sessionEnded ? (
            <div className="w-full flex-1 glass-panel p-8 rounded-3xl border border-white/20 shadow-2xl flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-4xl mb-4 shadow-xl">
                🏆
              </div>

              <h2 className="text-3xl font-black text-white mb-2">
                {activeWorld.name} Completed!
              </h2>

              <p className="text-sm text-slate-200 mb-6">
                You scored <span className="text-amber-400 font-extrabold">{sessionCorrectCount} / {worldQuestions.length}</span> questions correctly!
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
            
            /* Active Question Card */
            <div className="w-full flex-1 glass-panel p-6 rounded-3xl border border-white/20 shadow-2xl flex flex-col justify-between items-center text-center">
              
              {/* Question Progress */}
              <div className="w-full flex items-center justify-between text-xs text-slate-400 font-bold mb-3">
                <span>Question {currentQIndex + 1} of {worldQuestions.length}</span>
                <span className="text-amber-400">{currentQuestion.skill}</span>
              </div>

              {/* Question Prompt */}
              <div className="my-auto py-2">
                <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* 4 Answer Options 2x2 Grid */}
              <div className="w-full grid grid-cols-2 gap-3 mt-4">
                {currentQuestion.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(opt)}
                    className="p-4 rounded-2xl bg-white/10 hover:bg-amber-400/20 border border-white/15 hover:border-amber-400/40 text-lg sm:text-xl font-black text-white transition-all transform hover:scale-102 active:scale-98 cursor-pointer shadow-md"
                  >
                    {opt}
                  </button>
                ))}
              </div>

            </div>
          ) : null}

        </div>
      )}

    </div>
  );
}
