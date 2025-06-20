
'use client';

import dynamic from 'next/dynamic';
import type React from 'react';

// Dynamically import ParticleBackground with SSR turned off
const ParticleBackgroundComponent = dynamic(() => import('@/components/ParticleBackground'), {
  ssr: false,
  loading: () => null, // Optional: you can provide a loading component
});

const DynamicParticleBackground: React.FC = () => {
  return <ParticleBackgroundComponent />;
};

export default DynamicParticleBackground;
