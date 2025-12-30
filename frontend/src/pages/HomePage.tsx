import React from 'react';
import HeroSplitScreen from '../components/common/HeroSplitScreen';
import HeroSection from '../components/events/HeroSection';
import { mockEvents } from '../data/mockEvents';

const HomePage: React.FC = () => {
  return (
    <>
      <HeroSplitScreen events={mockEvents} />
      <HeroSection />
    </>
  );
};

export default HomePage;
