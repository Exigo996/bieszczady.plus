import React from 'react';
import HeroSplitScreen from '../components/common/HeroSplitScreen';
import HeroSection from '../components/events/HeroSection';

const HomePage: React.FC = () => {
  return (
    <>
      <HeroSplitScreen events={[]} />
      <HeroSection />
    </>
  );
};

export default HomePage;
