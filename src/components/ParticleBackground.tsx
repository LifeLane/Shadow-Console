
"use client";

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface ParticleProps {
  count?: number;
  mouse?: React.RefObject<[number, number]>;
  color?: string;
}

function Particles({ count = 5000, mouse, color = '#00ffff' }: ParticleProps) { // Default to neon cyan
  const pointsRef = useRef<THREE.Points>(null!);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3 + 0] = (Math.random() - 0.5) * 100;
      pos[i3 + 1] = (Math.random() - 0.5) * 100;
      pos[i3 + 2] = (Math.random() - 0.5) * 100;
    }
    return pos;
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    if (mouse && mouse.current) {
      for (let i = 0; i < particles.length; i++) {
        particles[i].mx += (mouse.current[0] - particles[i].mx) * 0.01;
        particles[i].my += (mouse.current[1] * -1 - particles[i].my) * 0.01;
      }
    }
    
    const positionsAttribute = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      particle.t += particle.speed;
      const i3 = i * 3;

      positionsAttribute.array[i3 + 0] =
        particle.xFactor + Math.cos((particle.t / 10) * particle.factor) + (Math.sin(particle.t * 1) * particle.factor) / 10;
      positionsAttribute.array[i3 + 1] =
        particle.yFactor + Math.sin((particle.t / 10) * particle.factor) + (Math.cos(particle.t * 2) * particle.factor) / 10;
      positionsAttribute.array[i3 + 2] =
        particle.zFactor + Math.cos((particle.t / 10) * particle.factor) + (Math.sin(particle.t * 3) * particle.factor) / 10;
      
      if (mouse && mouse.current) {
        positionsAttribute.array[i3 + 0] += particle.mx;
        positionsAttribute.array[i3 + 1] += particle.my;
      }
    }
    positionsAttribute.needsUpdate = true;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.02} 
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export default function ParticleBackground() {
  const mouseRef = useRef<[number, number]>([0,0]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = -(event.clientY / window.innerHeight) * 2 + 1;
        mouseRef.current = [x * 10, y * 10]; 
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  const [particleColor, setParticleColor] = useState('hsl(180 100% 50%)');

  useEffect(() => {
    const updateParticleColor = () => {
      const rootStyle = getComputedStyle(document.documentElement);
      // Check for inline style first (for custom theme)
      let primaryColor = rootStyle.getPropertyValue('--primary').trim();
      
      if (primaryColor) {
        const parts = primaryColor.split(" ");
        if (parts.length === 3) {
          setParticleColor(`hsl(${parts[0]}, ${parts[1]}, ${parts[2]})`);
        }
      }
    };

    updateParticleColor(); 

    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && (mutation.attributeName === 'class' || mutation.attributeName === 'style')) {
          updateParticleColor();
        }
      }
    });
    
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });
    return () => observer.disconnect();
  }, []);


  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
      <Canvas camera={{ position: [0, 0, 25], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <Particles count={2500} mouse={mouseRef} color={particleColor} />
      </Canvas>
    </div>
  );
}
