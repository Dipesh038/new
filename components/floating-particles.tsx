"use client";

import { useMemo } from 'react';

export function FloatingParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 10 + 5}s`, // 5 to 15 seconds
      animationDelay: `${Math.random() * 5}s`,
      width: `${Math.random() * 2 + 1}px`,
      height: `${Math.random() * 2 + 1}px`,
    }));
  }, []);

  return (
    <div className="floating-particles">
      {particles.map(style => (
        <div key={style.id} className="particle" style={style} />
      ))}
    </div>
  );
} 