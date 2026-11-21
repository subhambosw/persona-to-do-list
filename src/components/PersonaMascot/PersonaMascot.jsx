import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../../utils/audio.js';
import { asset } from '../../utils/assets.js';
import './PersonaMascot.css';

const DIALOGUES = [
  'Looking cool, Joker! Keep checking off targets.',
  'Take your time... or the atomic blast will vaporize Tokyo!',
  'Have you sent the calling card yet?',
  'One step closer to finishing the mission!',
  'Stay focused! Deadlines wait for no one.'
];

const PersonaMascot = ({ recentEvent, onTriggerRoar }) => {
  const [costume, setCostume] = useState('joker'); // 'joker' or 'glasses'
  const [speech, setSpeech] = useState(DIALOGUES[0]);
  const [isRoaring, setIsRoaring] = useState(false);

  // React to recent task events (task completed / finished)
  useEffect(() => {
    if (!recentEvent) return;

    if (recentEvent.type === 'TASK_COMPLETED') {
      setIsRoaring(true);
      setSpeech(`TARGET ELIMINATED! 「 ${recentEvent.title || 'MISSION'} 」 DOWN!`);
      const timer = setTimeout(() => setIsRoaring(false), 800);
      return () => clearTimeout(timer);
    } else if (recentEvent.type === 'ALL_DONE') {
      setIsRoaring(true);
      setSpeech('PALACE SECURED! MAXIMUM ATOMIC POWER REACHED!');
      const timer = setTimeout(() => setIsRoaring(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [recentEvent]);

  const handleToggleCostume = () => {
    sounds.playGodzillaRoar();
    setIsRoaring(true);
    setCostume((prev) => (prev === 'joker' ? 'glasses' : 'joker'));
    const nextQuote = DIALOGUES[Math.floor(Math.random() * DIALOGUES.length)];
    setSpeech(nextQuote);
    if (onTriggerRoar) onTriggerRoar();
    setTimeout(() => setIsRoaring(false), 900);
  };

  const imageSrc = costume === 'joker' ? asset('joker.png') : asset('tytpfp.png');
  const nameLabel = costume === 'joker' ? 'JOKER // PHANTOM' : 'REN // SHUJIN';

  return (
    <>
      {/* Visual Comic Roar Burst when Roaring */}
      <AnimatePresence>
        {isRoaring && (
          <motion.div
            className="roar-comic-burst"
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            SKREEEE-OOOONK!! ⚡
          </motion.div>
        )}
      </AnimatePresence>

      <div className="persona-mascot-container">
        {/* Slanted Comic Portrait Box */}
        <motion.div
          className="persona-portrait-frame"
          onClick={handleToggleCostume}
          title="Click to switch Joker costume & test Shin Godzilla Roar!"
          whileHover={{ scale: 1.1, rotate: 0 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.img
            key={costume}
            src={imageSrc}
            alt="Persona 5 Joker"
            className="persona-portrait-img"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
          />
          <div className="persona-name-tag">{nameLabel}</div>
        </motion.div>

        {/* Dynamic Comic Speech Bubble */}
        <motion.div
          className="persona-speech-bubble"
          onClick={handleToggleCostume}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <span className="speech-sender">PHANTOM THIEVES HUD</span>
          <p className={`speech-text ${isRoaring ? 'roar-highlight' : ''}`}>
            {speech}
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default PersonaMascot;
