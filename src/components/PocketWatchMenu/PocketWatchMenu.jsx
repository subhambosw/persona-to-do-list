import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { asset } from '../../utils/assets.js';
import { sounds } from '../../utils/audio.js';
import { X, Flame, Gamepad2, Radio, Users, ShieldAlert, Sparkles, Clock } from 'lucide-react';
import './PocketWatchMenu.css';

const PocketWatchMenu = ({
  isOpen,
  onClose,
  onOpenPomodoro,
  onOpenBoredom,
  onToggleRadio,
  onOpenConfidants,
  onOpenEvolution
}) => {
  // ESC key listener to exit camera zoom
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        sounds.playClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      // Metallic watch open click + sharp sword slash camera whoosh!
      sounds.playClick();
      sounds.playSlash();
    }
  }, [isOpen]);

  const handleSelect = (action) => {
    sounds.playClick();
    onClose();
    setTimeout(() => {
      if (action) action();
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="pocket-watch-overlay" onClick={onClose}>
        {/* Fullscreen Camera-Dive Zoom Container */}
        <motion.div
          className="pocket-watch-scene-card"
          onClick={(e) => e.stopPropagation()}
          initial={{
            scale: 0.08,
            x: '-35vw',
            y: '35vh',
            rotate: -25,
            opacity: 0
          }}
          animate={{
            scale: 1,
            x: 0,
            y: 0,
            rotate: 0,
            opacity: 1
          }}
          exit={{
            scale: 0.08,
            x: '-35vw',
            y: '35vh',
            rotate: -25,
            opacity: 0
          }}
          transition={{
            type: 'spring',
            stiffness: 280,
            damping: 24,
            mass: 0.9
          }}
        >
          {/* Custom High-Resolution Persona 5 Artwork Backdrop */}
          <div className="pocket-watch-art-wrapper">
            <img
              src={asset('persona_5_stopwatch_menu_v3.jpg')}
              alt="Persona 5 Over-The-Shoulder Stopwatch Menu"
              className="pocket-watch-bg-art"
            />
            <div className="pocket-watch-vignette" />
          </div>

          {/* Central Rotating Mechanical Gear Overlay */}
          <div className="gear-watch-center-interactive" title="Chrono Gear Core">
            <div className="cog-halo-pulse" />
            <div className="watch-hands-container">
              <div className="hand hour-hand" />
              <div className="hand minute-hand" />
              <div className="hand second-hand" />
              <div className="watch-center-pin" />
            </div>
          </div>

          {/* Persona 5 Dynamic Interactive Cut-Out Ransom Menu Buttons */}
          <div className="pocket-menu-hotspots-layer">
            {/* 1. INFILTRATE (Top) */}
            <motion.button
              type="button"
              className="hotspot-btn hotspot-infiltrate"
              whileHover={{ scale: 1.08, rotate: -3 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleSelect(onOpenPomodoro)}
              title="Launch Palace Infiltration 25m Focus Clock"
            >
              <div className="hotspot-content">
                <span className="hotspot-title">INFILTRATE</span>
                <span className="hotspot-sub">
                  <ShieldAlert size={12} /> PALACE POMODORO
                </span>
              </div>
            </motion.button>

            {/* 2. BOREDOM (Below Infiltrate) */}
            <motion.button
              type="button"
              className="hotspot-btn hotspot-boredom"
              whileHover={{ scale: 1.08, rotate: 2 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleSelect(onOpenBoredom)}
              title="Play Shin Godzilla Dino Runner Minigame"
            >
              <div className="hotspot-content">
                <span className="hotspot-title">BOREDOM</span>
                <span className="hotspot-sub">
                  <Gamepad2 size={12} /> DINO RUNNER
                </span>
              </div>
            </motion.button>

            {/* 3. LO-FI RADIO (Middle) */}
            <motion.button
              type="button"
              className="hotspot-btn hotspot-radio"
              whileHover={{ scale: 1.08, rotate: -2 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleSelect(onToggleRadio)}
              title="Open Beneath the Mask Lo-Fi Cassette Player"
            >
              <div className="hotspot-content">
                <span className="hotspot-title">LO-FI RADIO</span>
                <span className="hotspot-sub">
                  <Radio size={12} /> TAPE DECK // RAIN
                </span>
              </div>
            </motion.button>

            {/* 4. CONFIDANTS (Lower Middle) */}
            <motion.button
              type="button"
              className="hotspot-btn hotspot-confidants"
              whileHover={{ scale: 1.08, rotate: 3 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleSelect(onOpenConfidants)}
              title="View Phantom Thieves Social Links Roster"
            >
              <div className="hotspot-content">
                <span className="hotspot-title">CONFIDANTS</span>
                <span className="hotspot-sub">
                  <Users size={12} /> ALLIES // RANKS
                </span>
              </div>
            </motion.button>

            {/* 5. EVOLUTION (Lower Right) */}
            <motion.button
              type="button"
              className="hotspot-btn hotspot-evolution"
              whileHover={{ scale: 1.08, rotate: -2 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleSelect(onOpenEvolution)}
              title="View Shin Godzilla Evolution Mutation Roadmap"
            >
              <div className="hotspot-content">
                <span className="hotspot-title">EVOLUTION</span>
                <span className="hotspot-sub">
                  <Flame size={12} /> SHIN GODZILLA STREAK
                </span>
              </div>
            </motion.button>

            {/* 6. SETTINGS (Bottom) */}
            <motion.button
              type="button"
              className="hotspot-btn hotspot-settings"
              whileHover={{ scale: 1.08, rotate: 2 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleSelect(onClose)}
              title="Return / Settings"
            >
              <div className="hotspot-content">
                <span className="hotspot-title">SETTINGS</span>
                <span className="hotspot-sub">
                  <Sparkles size={12} /> PREFERENCES // CLOSE
                </span>
              </div>
            </motion.button>
          </div>

          {/* Top Header Navigation Strip */}
          <div className="pocket-watch-header-strip">
            <div className="chrono-badge">
              <Clock size={13} />
              <span>CHRONO SYSTEM // P5 × SHIN GODZILLA</span>
            </div>

            <button
              type="button"
              className="pocket-watch-exit-btn"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              title="Return to Main View (ESC)"
            >
              <X size={16} />
              <span>EXIT [ESC]</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PocketWatchMenu;
