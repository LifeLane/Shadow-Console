
"use client";

import React, { useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';

const BackgroundAnimation = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number>();
    const { theme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        
        const primaryColorStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
        const particleColor = `hsl(${primaryColorStyle})`;

        const particles: {
            x: number;
            y: number;
            radius: number;
            vx: number;
            vy: number;
        }[] = [];
        const numParticles = Math.floor(width / 50); // Increased density

        for (let i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.5 + 1,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
            });
        }

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = particleColor;
            
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            });
            
            ctx.strokeStyle = particleColor;
            ctx.lineWidth = 0.2;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
                    if (dist < 200) { // Increased connection distance
                        ctx.globalAlpha = 1 - (dist / 200);
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            ctx.globalAlpha = 1;
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
                opacity: 0.3, // Increased opacity
                pointerEvents: 'none',
            }}
        />
    );
};

export default BackgroundAnimation;
