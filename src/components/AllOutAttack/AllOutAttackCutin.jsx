import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { asset } from '../../utils/assets.js';
import { sounds } from '../../utils/audio.js';
import { Sparkles, Trophy, CheckCircle, Flame } from 'lucide-react';
import './AllOutAttackCutin.css';

const AllOutAttackCutin = ({ isOpen, onClose, tasksClearedCount = 5 }) => {
  useEffect(() => {
    if (isOpen) {
      sounds.playSuccess();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="aoa-overlay-root">
        {/* Slanted Comic Background Panels */}
        <motion.div
          className="aoa-backdrop-slice-top"
          initial={{ x: '-100%', skewX: -15 }}
          animate={{ x: '0%', skewX: -15 }}
          exit={{ x: '-100%' }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.div
          className="aoa-backdrop-slice-bottom"
          initial={{ x: '100%', skewX: -15 }}
          animate={{ x: '0%', skewX: -15 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Dynamic Concept Art Hero Image */}
        <motion.div
          className="aoa-hero-art-container"
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
        >
          <img
            src={asset('p5_all_out_attack_victory.jpg')}
            alt="All-Out Attack Joker and Shin Godzilla Victory"
            className="aoa-hero-art"
          />
          <div className="aoa-vignette-overlay" />
        </motion.div>

        {/* Dramatic Typography Overlay */}
        <div className="aoa-content-wrapper">
          <motion.div
            className="aoa-ribbon-tag"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            ★ ALL-OUT ATTACK // FINISH ★
          </motion.div>

          <motion.h1
            className="aoa-main-quote"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.4 }}
          >
            THE PROCRASTINATION
            <br />
            <span className="quote-red">HAS BEEN EXECUTED.</span>
          </motion.h1>

          <motion.p
            className="aoa-subquote"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
          >
            "TARGET'S HEART HAS BEEN STOLEN. PALACE COLLAPSE IMMINENT."
          </motion.p>

          {/* Tactical Rewards Box */}
          <motion.div
            className="aoa-rewards-card"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.65 }}
          >
            <div className="reward-cell">
              <CheckCircle className="cell-icon" size={18} />
              <div>
                <span className="cell-label">MISSIONS CLEARED</span>
                <div className="cell-val">{tasksClearedCount} TARGETS</div>
              </div>
            </div>

            <div className="reward-cell">
              <Trophy className="cell-icon gold" size={18} />
              <div>
                <span className="cell-label">TOTAL THIEF EXP</span>
                <div className="cell-val gold">+{(tasksClearedCount || 1) * 500} EXP</div>
              </div>
            </div>

            <div className="reward-cell">
              <Flame className="cell-icon purple" size={18} />
              <div>
                <span className="cell-label">ATOMIC ENERGY</span>
                <div className="cell-val purple">MAX OVERLOAD</div>
              </div>
            </div>
          </motion.div>

          {/* Claim Victory Button */}
          <motion.button
            type="button"
            className="aoa-claim-btn"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
          >
            <Sparkles size={18} />
            <span>CLAIM VICTORY // RETURN TO HIDEOUT</span>
          </motion.button>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default AllOutAttackCutin;
