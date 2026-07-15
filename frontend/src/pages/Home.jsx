import React from 'react';
import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/FeaturesSection';
import StatsSection from '../components/home/StatsSection';
import WhyChooseUs from '../components/home/WhyChooseUs';
import CtaSection from '../components/home/CtaSection';

const Home = () => {
  return (
    <div className="overflow-hidden">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <WhyChooseUs />
      <CtaSection />
    </div>
  );
};

export default Home;
