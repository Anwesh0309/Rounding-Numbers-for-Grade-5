import React, { useState, useEffect } from 'react';
import { useJourney } from '../context/JourneyContext';
import { speakText } from '../utils/audio';
import storiesData from '../data/stories.json';
import { ArrowLeft, ArrowRight, Sparkles, Volume2 } from 'lucide-react';

export default function StoryPage() {
  const { completePhase, completePhaseAndNavigate, navigateToPhase, isAudioMuted } = useJourney();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const currentSlide = storiesData[currentSlideIndex];

  const handlePlayNarration = () => {
    if (currentSlide) {
      const hint = `story-${currentSlideIndex + 1}`;
      speakText(`${currentSlide.title}. ${currentSlide.text} ${currentSlide.keyQuestion}`, hint);
    }
  };

  useEffect(() => {
    if (!isAudioMuted && currentSlide) {
      handlePlayNarration();
    }
  }, [currentSlideIndex, isAudioMuted]);

  const handleNext = () => {
    if (currentSlideIndex < storiesData.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    } else {
      // Completed all story slides
      completePhaseAndNavigate('story', 'simulate');
    }
  };

  const handleBack = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  return (
    <div className="w-full max-w-4xl h-full flex flex-col justify-between items-center py-2 relative">
      
      {/* Top Slide Progress Bar */}
      <div className="w-full flex items-center justify-between gap-4 mb-2 shrink-0">
        <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden border border-white/10">
          <div 
            className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${((currentSlideIndex + 1) / storiesData.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-black text-amber-300">
          {currentSlideIndex + 1} / {storiesData.length}
        </span>
      </div>

      {/* Main Story Card Frame */}
      <div className="w-full flex-1 glass-panel rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl flex flex-col md:flex-row gap-4 sm:gap-6 items-center justify-center min-h-0 overflow-hidden relative">
        
        {/* Left Side: Story Illustration */}
        <div className="w-full md:w-1/2 h-44 sm:h-56 md:h-full rounded-2xl overflow-hidden border border-white/15 relative bg-slate-900/60 shrink-0 shadow-lg">
          <img 
            src={currentSlide.image} 
            alt={currentSlide.title}
            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 bg-slate-950/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-black text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Slide {currentSlide.slideIndex}</span>
          </div>
        </div>

        {/* Right Side: Narrative Text & Question */}
        <div className="w-full md:w-1/2 flex flex-col justify-between h-full min-h-0 overflow-y-auto no-scrollbar">
          
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-400 mb-2">
              {currentSlide.title}
            </h2>

            <p className="text-sm sm:text-base text-slate-100 leading-relaxed mb-4">
              {currentSlide.text}
            </p>
          </div>

          {/* Key Question Highlight Pill */}
          <div className="bg-amber-500/15 border border-amber-400/30 p-3 rounded-2xl mb-3">
            <p className="text-xs font-black text-amber-300 uppercase tracking-wider mb-1">
              ✨ KEY QUESTION
            </p>
            <p className="text-sm font-extrabold text-white">
              "{currentSlide.keyQuestion}"
            </p>
          </div>

          {/* Mascot Tip */}
          <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-xl border border-white/10">
            <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-lg font-black shrink-0 border border-white shadow">
              🦁
            </div>
            <p className="text-xs font-bold text-amber-200">
              {currentSlide.mascotTip}
            </p>
          </div>

        </div>

      </div>

      {/* Bottom Navigation & Dot Indicators */}
      <div className="w-full flex items-center justify-between pt-3 shrink-0">
        
        {/* Back Button */}
        <button
          disabled={currentSlideIndex === 0}
          onClick={handleBack}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
            currentSlideIndex === 0
              ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
              : 'bg-white/10 hover:bg-white/20 text-white border border-white/15 cursor-pointer hover:scale-105 active:scale-95'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Dot Indicators */}
        <div className="flex items-center gap-2">
          {storiesData.map((_, idx) => (
            <div
              key={idx}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentSlideIndex 
                  ? 'w-6 bg-amber-400 shadow-md' 
                  : idx < currentSlideIndex 
                  ? 'w-2.5 bg-emerald-400' 
                  : 'w-2.5 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Next / Finish Button */}
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <span>
            {currentSlideIndex === storiesData.length - 1 ? 'Explore Simulations 🧪' : 'Next →'}
          </span>
        </button>

      </div>

    </div>
  );
}
