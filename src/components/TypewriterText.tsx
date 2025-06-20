
"use client";

import React, { useState, useEffect, useId } from 'react';
import { cn } from '@/lib/utils';

interface TypewriterTextProps {
  text: string;
  speed?: number; // Milliseconds per character
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  onComplete?: () => void;
  showCaret?: boolean; // Show caret while typing
  showCaretAfterComplete?: boolean; // Keep caret visible after typing (blinking)
  caretClassName?: string;
  children?: React.ReactNode; // Allow passing complex children like spans with different styles
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 50,
  className,
  as: Element = 'p',
  onComplete,
  showCaret = true,
  showCaretAfterComplete = false,
  caretClassName,
  children
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const internalId = useId(); // For unique key for the component instance

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text, internalId]); // Reset when text or the component instance key changes

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeoutId);
    } else if (!isComplete) {
      setIsComplete(true);
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentIndex, text, speed, onComplete, isComplete]);

  const renderContent = () => {
    if (children) {
      // If children are provided, assume they are pre-styled and just type them out.
      // This mode is simpler and doesn't use the .typewriter-char class for individual char animation.
      return displayedText;
    }
    // Default behavior: animate each character
    return displayedText.split('').map((char, index) => (
      <span key={index} className="typewriter-char" style={{ animationDelay: `${index * (speed / 2000)}s` }}> 
      {/* Slower animationDelay for individual chars if needed, but main control is via `speed` prop */}
        {char}
      </span>
    ));
  };


  return (
    <Element className={cn("whitespace-pre-wrap break-words font-code", className)}>
      {children ? displayedText : renderContent()}
      {showCaret && (!isComplete || (isComplete && showCaretAfterComplete)) && (
         <span className={cn(
           "inline-block w-[0.6ch] h-[1.2em] ml-0.5 align-text-bottom", // Adjusted caret style
           isComplete && showCaretAfterComplete ? "animate-blink-block-caret" : "", // Blink only if showCaretAfterComplete
           caretClassName || "bg-accent" 
         )} style={{ animationDelay: `${currentIndex * (speed / 1000) + 0.1}s` }}></span>
      )}
    </Element>
  );
};

export default TypewriterText;
