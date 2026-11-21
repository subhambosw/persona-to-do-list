import React, { useEffect } from 'react';
import './AtomicBeamEffect.css';

const AtomicBeamEffect = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1100);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="atomic-beam-overlay">
      <div className="flash-screen" />
      <div className="godzilla-laser-beam" />
    </div>
  );
};

export default AtomicBeamEffect;
