
"use client";

import React, { useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';

const BackgroundAnimation = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number>();
    const { theme } = useTheme(); // Keep theme to re-trigger on theme change if needed

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        interface Particle {
            x: number;
            y: number;
            radius: number;
            vx: number;
            vy: number;
            hue: number;
            saturation: number;
            lightness: number;
            alpha: number;
            decay: number;
        }

        let particles: Particle[] = [];
        // Color palette for space-like feel: deep blues, purples, cyans, pinks
        const colorPalette = [200, 240, 280, 320];

        function createParticle(x?: number, y?: number) {
            const particle: Particle = {
                x: x ?? Math.random() * width,
                y: y ?? Math.random() * height,
                radius: Math.random() * 2 + 1,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                hue: colorPalette[Math.floor(Math.random() * colorPalette.length)],
                saturation: 90 + Math.random() * 10,
                lightness: 50 + Math.random() * 10,
                alpha: Math.random() * 0.5 + 0.5,
                decay: Math.random() * 0.015 + 0.005,
            };
            particles.push(particle);
        }

        function createBurst() {
            const burstX = Math.random() * width;
            const burstY = Math.random() * height;
            const numParticlesInBurst = Math.floor(Math.random() * 10) + 5;
            for (let i = 0; i < numParticlesInBurst; i++) {
                // Create particles for the burst around a central point
                createParticle(burstX, burstY);
            }
        }
        
        // Initial particles
        for (let i = 0; i < 50; i++) {
            createParticle();
        }

        const animate = () => {
            if (!ctx) return;
            
            // Use a semi-transparent background to create a trail effect
            ctx.fillStyle = 'rgba(13, 17, 23, 0.1)'; // Matches the default dark theme bg
            ctx.fillRect(0, 0, width, height);
            
            // Randomly trigger new bursts
            if (Math.random() < 0.02) {
                createBurst();
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];

                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= p.decay;

                // Bounce off edges and fade faster
                if (p.x < 0 || p.x > width) {
                    p.vx *= -1;
                    p.alpha -= 0.1;
                }
                if (p.y < 0 || p.y > height) {
                    p.vy *= -1;
                    p.alpha -= 0.1;
                }

                if (p.alpha <= 0) {
                    particles.splice(i, 1);
                    continue;
                }
                
                ctx.beginPath();
                // Pulsating effect
                const pulseRadius = p.radius * (1 + Math.sin(Date.now() * 0.005 + p.x) * 0.2);
                ctx.arc(p.x, p.y, pulseRadius, 0, Math.PI * 2, false);

                // Glow effect
                ctx.shadowColor = `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, 1)`;
                ctx.shadowBlur = 10;
                
                ctx.fillStyle = `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, ${p.alpha})`;
                ctx.fill();
            }
            
            // Reset shadow for next frame elements if any
            ctx.shadowBlur = 0;

            animationFrameId.current = requestAnimationFrame(animate);
        };
        
        animate();

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            if (canvas) {
                canvas.width = width;
                canvas.height = height;
            }
        };
        
        window.addEventListener('resize', handleResize);

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            window.removeEventListener('resize', handleResize);
        };
    }, [theme]);

    return (
        <canvas 
            ref={canvasRef} 
            id="bg-canvas"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 0,
                opacity: 1, // Let the alpha be controlled by the drawing itself
                pointerEvents: 'none',
            }}
        />
    );
};

export default BackgroundAnimation;
