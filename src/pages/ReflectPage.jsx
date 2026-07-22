import React, { useEffect, useState } from 'react';
import { useJourney } from '../context/JourneyContext';
import { speakText } from '../utils/audio';
import confetti from 'canvas-confetti';
import worldsData from '../data/worlds.json';
import { Trophy, Star, Award, Printer, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ReflectPage() {
  const { 
    xp, 
    overallScore, 
    totalQuestionsAttempted, 
    starsByWorld, 
    studentName, 
    setStudentName,
    isAudioMuted,
    completePhase
  } = useJourney();

  const [activeView, setActiveView] = useState('scoreboard'); // 'scoreboard' | 'certificate'

  useEffect(() => {
    completePhase('reflect');
    // Launch celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.warn('Confetti error', e);
    }

    if (!isAudioMuted) {
      speakText(`Congratulations ${studentName}! You have completed the Round-O-Rama learning journey! Check your scoreboard and print your certificate of mastery.`);
    }
  }, []);

  const accuracyPct = totalQuestionsAttempted > 0 
    ? Math.round((overallScore / totalQuestionsAttempted) * 100) 
    : 100;

  const worldsMasteredCount = Object.keys(starsByWorld).filter(k => starsByWorld[k] > 0).length;

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-4xl h-full flex flex-col justify-between items-center py-2 relative">
      
      {/* Sub Header View Toggle */}
      <div className="flex items-center gap-2 mb-3 shrink-0 print:hidden">
        <button
          onClick={() => setActiveView('scoreboard')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all ${
            activeView === 'scoreboard'
              ? 'bg-amber-400 text-slate-950 shadow-md scale-105 ring-2 ring-amber-300/50'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Overall Scoreboard</span>
        </button>

        <button
          onClick={() => setActiveView('certificate')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all ${
            activeView === 'certificate'
              ? 'bg-amber-400 text-slate-950 shadow-md scale-105 ring-2 ring-amber-300/50'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Certificate of Mastery 📜</span>
        </button>
      </div>

      {/* VIEW 1: Overall Scoreboard */}
      {activeView === 'scoreboard' ? (
        <div className="w-full flex-1 glass-panel rounded-3xl p-5 sm:p-6 border border-white/20 shadow-2xl flex flex-col justify-between items-center min-h-0 overflow-y-auto no-scrollbar print:hidden">
          
          <div className="text-center mb-3 shrink-0">
            <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-3xl shadow-xl">
              🏆
            </div>
            <h2 className="text-2xl font-black text-white">
              Journey Complete!
            </h2>
            <p className="text-xs text-amber-300 font-bold">
              Singapore MOE Grade 5 Whole Numbers: Rounding & Estimation
            </p>
          </div>

          {/* 3 Top Stat Cards */}
          <div className="w-full grid grid-cols-3 gap-3 my-2 shrink-0">
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-white/15 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Total XP Earned</span>
              <span className="text-2xl font-black text-amber-400 text-glow-gold">⚡ {xp}</span>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-white/15 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Accuracy</span>
              <span className="text-2xl font-black text-emerald-400">{accuracyPct}%</span>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-white/15 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Worlds Mastered</span>
              <span className="text-2xl font-black text-purple-300">{worldsMasteredCount} / 10</span>
            </div>
          </div>

          {/* World-by-World Stars List */}
          <div className="w-full bg-slate-950/40 p-4 rounded-2xl border border-white/10 my-2 flex-1 min-h-0 overflow-y-auto no-scrollbar">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-2 text-left">
              WORLD MASTERY BREAKDOWN
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {worldsData.map(world => {
                const stars = starsByWorld[world.id] || 0;
                return (
                  <div key={world.id} className="bg-white/5 p-2 rounded-xl border border-white/10 flex flex-col items-center">
                    <span className="text-lg">{world.icon}</span>
                    <span className="text-[11px] font-bold text-white line-clamp-1">{world.name}</span>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3].map(s => (
                        <Star key={s} className={`w-2.5 h-2.5 ${s <= stars ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Action Buttons */}
          <div className="pt-2 flex gap-3 shrink-0">
            <button
              onClick={() => setActiveView('certificate')}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow-xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Claim Certificate of Mastery 📜</span>
            </button>
          </div>

        </div>
      ) : (

        /* VIEW 2: Interactive Certificate Section */
        <div className="w-full flex-1 flex flex-col justify-between items-center min-h-0 overflow-y-auto no-scrollbar">
          
          {/* Name Customization Input */}
          <div className="w-full bg-slate-950/60 p-3 rounded-2xl border border-white/15 flex items-center justify-between gap-3 mb-3 shrink-0 print:hidden">
            <span className="text-xs font-bold text-slate-300">Student Name on Certificate:</span>
            <input 
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white font-extrabold text-xs focus:outline-none focus:border-amber-400"
              placeholder="Enter student name..."
            />
          </div>

          {/* Printable Official Certificate Document */}
          <div className="w-full flex-1 glass-panel p-6 sm:p-8 rounded-3xl border-4 border-amber-400/60 shadow-2xl flex flex-col justify-between items-center text-center relative overflow-hidden bg-gradient-to-b from-[#1a1033] to-[#25154d]">
            
            {/* Corner Decorative Badges */}
            <div className="absolute top-4 left-4 text-xs font-black text-amber-400 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Grade 5 Math</span>
            </div>
            <div className="absolute top-4 right-4 text-xs font-black text-amber-400">
              Singapore MOE
            </div>

            <div className="my-auto py-2">
              <span className="text-xs font-black tracking-widest text-amber-300 uppercase block mb-1">
                OFFICIAL CERTIFICATE OF MASTERY
              </span>
              
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
                Round-O-Rama Champion
              </h1>

              <div className="w-24 h-1 bg-amber-400 mx-auto rounded-full my-3 shadow-md" />

              <p className="text-xs sm:text-sm text-slate-300 mb-2">
                This is proudly awarded to
              </p>

              <h2 className="text-2xl sm:text-3xl font-black text-amber-400 text-glow-gold underline underline-offset-8 decoration-amber-400/50 mb-3">
                {studentName}
              </h2>

              <p className="text-xs sm:text-sm text-slate-200 max-w-lg mx-auto leading-relaxed">
                for demonstrating outstanding mastery in <span className="font-extrabold text-amber-300">Rounding Whole Numbers</span> (nearest 10, 100, 1,000, 10,000, 100,000 & Estimation of Operations) aligned with the Singapore MOE Mathematics Syllabus.
              </p>
            </div>

            {/* Seal & Signatures Footer */}
            <div className="w-full flex justify-between items-end pt-4 border-t border-white/10 shrink-0">
              <div className="text-left text-[10px] text-slate-400">
                <p className="font-bold text-slate-300">Date Issued:</p>
                <p>{new Date().toLocaleDateString()}</p>
              </div>

              <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg border-2 border-white">
                🎖️
              </div>

              <div className="text-right text-[10px] text-slate-400">
                <p className="font-bold text-slate-300">Authorized Seal:</p>
                <p className="text-amber-300 font-bold">Intellia 360 Math</p>
              </div>
            </div>

          </div>

          {/* Print Button */}
          <div className="pt-3 shrink-0 print:hidden">
            <button
              onClick={handlePrintCertificate}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow-xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download Certificate PDF 🖨️</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
