import React, { useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { Volume2, VolumeX, Sparkles, Flame } from 'lucide-react';
import { sounds } from '../../utils/audio.js';
import { asset } from '../../utils/assets.js';
import confetti from 'canvas-confetti';
import './TakeYourTime.css';

const TakeYourTime = ({ onTriggerBeam }) => {
  const [isMuted, setIsMuted] = useState(false);
  const hatControls = useAnimationControls();
  const logoControls = useAnimationControls();

  const handleHatClick = async (e) => {
    e.stopPropagation();
    sounds.playClick();
    await hatControls.start({ rotateY: 0, transition: { duration: 0.001 } });
    hatControls.start({
      rotateY: 360,
      transition: { duration: 0.6, ease: 'easeInOut' }
    });
  };

  const handleLogoClick = async () => {
    sounds.playAtomicBlast();
    await logoControls.start({ rotateY: 0, transition: { duration: 0.001 } });
    logoControls.start({
      rotateY: 360,
      transition: { duration: 0.6, ease: 'easeInOut' }
    });

    if (onTriggerBeam) {
      onTriggerBeam();
    }

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { x: 0.85, y: 0.85 },
      colors: ['#a855f7', '#d946ef', '#ffffff']
    });
  };

  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sounds.playClick();
    }
  };

  return (
    <div className="tyt-container">
      <div className="tyt-graphics-wrapper" onClick={handleLogoClick} title="Take Your Time! Click for Atomic Blast!">
        <motion.img
          src={asset('hat.png')}
          alt="Phantom Hat"
          className="tyt-hat-icon"
          animate={hatControls}
          onClick={handleHatClick}
          whileHover={{ scale: 1.15, rotate: -8 }}
          whileTap={{ scale: 0.95 }}
        />
        <motion.img
          src={asset('tyt2.png')}
          alt="Take Your Time"
          className="tyt-text-logo"
          animate={logoControls}
          whileHover={{ scale: 1.05, rotate: 3 }}
          whileTap={{ scale: 0.95 }}
        />
      </div>

      <div className="bottom-controls-bar">
        <button
          type="button"
          className="bottom-ctrl-btn"
          onClick={handleToggleMute}
          title={isMuted ? 'Unmute SFX' : 'Mute SFX'}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          <span>{isMuted ? 'MUTED' : 'SFX ON'}</span>
        </button>

        <button
          type="button"
          className="bottom-ctrl-btn"
          onClick={handleLogoClick}
          title="Fire Atomic Blast Laser!"
        >
          <Flame size={16} color="#d946ef" />
          <span>BEAM</span>
        </button>
      </div>
    </div>
  );
};

export default TakeYourTime;
