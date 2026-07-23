import React, { createContext, useContext, useState, useEffect } from 'react';
import { setMuted, getMuted, stopNarration } from '../utils/audio';

const JourneyContext = createContext();

const PHASE_SEQUENCE = ['wonder', 'story', 'simulate', 'play', 'reflect'];

export function JourneyProvider({ children }) {
  const [currentPhase, setCurrentPhase] = useState('wonder');
  const [completedPhases, setCompletedPhases] = useState([]);
  const [unlockedPhases, setUnlockedPhases] = useState(['wonder']);
  
  const [hearts, setHearts] = useState(3);
  const [streak, setStreak] = useState(0);
  const [streakMultiplier, setStreakMultiplier] = useState(1);
  const [xp, setXp] = useState(0);
  const [overallScore, setOverallScore] = useState(0);
  const [totalQuestionsAttempted, setTotalQuestionsAttempted] = useState(0);
  
  const [starsByWorld, setStarsByWorld] = useState({});
  const [unlockedWorlds, setUnlockedWorlds] = useState(['marble-meadow']);
  const [studentName, setStudentName] = useState('Super Star Student');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(true);

  // Load state from localStorage on mount safely
  useEffect(() => {
    try {
      const saved = localStorage.getItem('roundorama_progress_v1');
      if (saved) {
        const data = JSON.parse(saved);
        if (Array.isArray(data.completedPhases)) setCompletedPhases(data.completedPhases);
        if (Array.isArray(data.unlockedPhases) && data.unlockedPhases.length > 0) setUnlockedPhases(data.unlockedPhases);
        if (data.xp !== undefined) setXp(data.xp);
        if (data.starsByWorld && typeof data.starsByWorld === 'object') setStarsByWorld(data.starsByWorld);
        if (Array.isArray(data.unlockedWorlds) && data.unlockedWorlds.length > 0) setUnlockedWorlds(data.unlockedWorlds);
        if (data.studentName) setStudentName(data.studentName);
        if (data.overallScore !== undefined) setOverallScore(data.overallScore);
        if (data.totalQuestionsAttempted !== undefined) setTotalQuestionsAttempted(data.totalQuestionsAttempted);
      }
    } catch (e) {
      console.warn('Failed to load saved progress', e);
    }
  }, []);

  // Save progress changes
  useEffect(() => {
    try {
      localStorage.setItem('roundorama_progress_v1', JSON.stringify({
        completedPhases,
        unlockedPhases,
        xp,
        starsByWorld,
        unlockedWorlds,
        studentName,
        overallScore,
        totalQuestionsAttempted
      }));
    } catch (e) {
      console.warn('Failed to save progress', e);
    }
  }, [completedPhases, unlockedPhases, xp, starsByWorld, unlockedWorlds, studentName, overallScore, totalQuestionsAttempted]);

  const toggleAudio = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    setMuted(next);
  };

  const completePhase = (phase) => {
    setCompletedPhases(prev => {
      if (!prev.includes(phase)) return [...prev, phase];
      return prev;
    });

    const currentIndex = PHASE_SEQUENCE.indexOf(phase);
    if (currentIndex !== -1 && currentIndex < PHASE_SEQUENCE.length - 1) {
      const nextPhase = PHASE_SEQUENCE[currentIndex + 1];
      setUnlockedPhases(prev => {
        if (!prev.includes(nextPhase)) return [...prev, nextPhase];
        return prev;
      });
    }
  };

  const completePhaseAndNavigate = (phase, targetPhase) => {
    stopNarration();
    setCompletedPhases(prev => {
      if (!prev.includes(phase)) return [...prev, phase];
      return prev;
    });

    const nextToUnlock = targetPhase || PHASE_SEQUENCE[PHASE_SEQUENCE.indexOf(phase) + 1];
    if (nextToUnlock) {
      setUnlockedPhases(prev => {
        if (!prev.includes(nextToUnlock)) return [...prev, nextToUnlock];
        return prev;
      });
      setCurrentPhase(nextToUnlock);
    }
  };

  const navigateToPhase = (phase) => {
    stopNarration();
    setUnlockedPhases(prev => {
      if (!prev.includes(phase)) return [...prev, phase];
      return prev;
    });
    setCurrentPhase(phase);
  };

  const recordAnswer = (isCorrect, worldId, questionXp = 10) => {
    setTotalQuestionsAttempted(prev => prev + 1);

    if (isCorrect) {
      const newStreak = streak + 1;
      const newMultiplier = Math.min(3, 1 + Math.floor(newStreak / 3));
      const gained = questionXp * newMultiplier;
      
      setStreak(newStreak);
      setStreakMultiplier(newMultiplier);
      setXp(prev => prev + gained);
      setOverallScore(prev => prev + 1);

      return { gainedXp: gained, newStreak, multiplier: newMultiplier };
    } else {
      setStreak(0);
      setStreakMultiplier(1);
      setHearts(prev => Math.max(0, prev - 1));
      return { gainedXp: 0, newStreak: 0, multiplier: 1 };
    }
  };

  const completeWorldSession = (worldId, correctCount, totalQuestions, allWorldsList) => {
    const pct = correctCount / totalQuestions;
    let stars = 1;
    if (pct >= 0.9) stars = 3;
    else if (pct >= 0.7) stars = 2;

    setStarsByWorld(prev => ({
      ...prev,
      [worldId]: Math.max(prev[worldId] || 0, stars)
    }));

    // Unlock next world
    const worldIndex = allWorldsList.findIndex(w => w.id === worldId);
    if (worldIndex !== -1 && worldIndex < allWorldsList.length - 1) {
      const nextWorld = allWorldsList[worldIndex + 1];
      if (!unlockedWorlds.includes(nextWorld.id)) {
        setUnlockedWorlds(prev => [...prev, nextWorld.id]);
      }
    }

    // Mark Play phase as completed
    completePhase('play');
  };

  const resetHeartsAndStreak = () => {
    setHearts(3);
    setStreak(0);
    setStreakMultiplier(1);
  };

  return (
    <JourneyContext.Provider value={{
      currentPhase,
      setCurrentPhase,
      completedPhases,
      unlockedPhases,
      completePhase,
      completePhaseAndNavigate,
      navigateToPhase,
      hearts,
      setHearts,
      streak,
      streakMultiplier,
      xp,
      overallScore,
      totalQuestionsAttempted,
      starsByWorld,
      unlockedWorlds,
      recordAnswer,
      completeWorldSession,
      resetHeartsAndStreak,
      studentName,
      setStudentName,
      isAudioMuted,
      toggleAudio,
      showIntroModal,
      setShowIntroModal,
      PHASE_SEQUENCE
    }}>
      {children}
    </JourneyContext.Provider>
  );
}

export function useJourney() {
  return useContext(JourneyContext);
}
