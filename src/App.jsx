import React from 'react';
import { JourneyProvider, useJourney } from './context/JourneyContext';
import SingleFrameShell from './components/layout/SingleFrameShell';
import WonderPage from './pages/WonderPage';
import StoryPage from './pages/StoryPage';
import SimulatePage from './pages/SimulatePage';
import PlayPage from './pages/PlayPage';
import ReflectPage from './pages/ReflectPage';

function JourneyRouter() {
  const { currentPhase } = useJourney();

  switch (currentPhase) {
    case 'wonder':
      return <WonderPage />;
    case 'story':
      return <StoryPage />;
    case 'simulate':
      return <SimulatePage />;
    case 'play':
      return <PlayPage />;
    case 'reflect':
      return <ReflectPage />;
    default:
      return <WonderPage />;
  }
}

export default function App() {
  return (
    <JourneyProvider>
      <SingleFrameShell>
        <JourneyRouter />
      </SingleFrameShell>
    </JourneyProvider>
  );
}
