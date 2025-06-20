
'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';

const ParticleBackgroundComponent = dynamic(
  () => import('@/components/ParticleBackground'),
  {
    ssr: false,
    loading: () => null, // Keep loading simple, or a minimal placeholder div
  }
);

const DynamicParticleBackground: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []); // Empty dependency array ensures this runs once on mount (client-side)

  if (!isMounted) {
    // While not mounted on client, render nothing.
    // This ensures ParticleBackgroundComponent which uses R3F is not even attempted to render server-side.
    return null;
  }

  // Only render the R3F component once mounted on the client
  return <ParticleBackgroundComponent />;
};

export default DynamicParticleBackground;
