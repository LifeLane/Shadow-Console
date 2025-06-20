
'use client';

import React, { useState, useEffect, ComponentType } from 'react';

// Define a simple type for the props if ParticleBackground expects any (currently none)
// interface ParticleBackgroundProps {}

const DynamicParticleBackground: React.FC = () => {
  const [ParticleComponent, setParticleComponent] = useState<ComponentType | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      // Dynamically import the component *inside* useEffect, only when mounted
      import('@/components/ParticleBackground')
        .then(mod => {
          // Assuming ParticleBackground is the default export
          setParticleComponent(() => mod.default);
        })
        .catch(err => {
          console.error("Failed to load ParticleBackground component:", err);
          // Optionally set an error state or fallback UI
        });
    }
  }, [isMounted]); // Re-run if isMounted changes (though it only goes false -> true)

  if (!isMounted || !ParticleComponent) {
    // While not mounted or component is not loaded, render nothing or a placeholder
    return null;
  }

  // Only render the R3F component once mounted on the client and the component is loaded
  return <ParticleComponent />;
};

export default DynamicParticleBackground;
