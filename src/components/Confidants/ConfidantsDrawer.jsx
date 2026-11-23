import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Award, Shield, Zap, ChevronRight } from 'lucide-react';
import { sounds } from '../../utils/audio.js';
import './ConfidantsDrawer.css';

const DEFAULT_CONFIDANTS = [
  {
    id: 'morgana',
    name: 'Morgana',
    arcana: 'I. THE MAGICIAN',
    codename: 'MONA',
    rank: 3,
    maxRank: 10,
    progress: 65,
    perk: 'Infiltration Maestro: +20% bonus Atomic Energy for completed missions.',
    quote: '"Looking cool, Joker! Keep this momentum up!"',
    color: '#00f0ff',
    avatar: '🐱'
  },
  {
    id: 'ryuji',
    name: 'Ryuji Sakamoto',
    arcana: 'VII. THE CHARIOT',
    codename: 'SKULL',
    rank: 4,
    maxRank: 10,
    progress: 40,
    perk: 'Punk Blitz: High Priority tasks grant 2x Thief EXP and instant adrenaline.',
    quote: '"For real?! We\'re gonna tear right through this to-do list!"',
    color: '#ffe600',
    avatar: '⚡'
  },
  {
    id: 'makoto',
    name: 'Makoto Niijima',
    arcana: 'II. THE PRIESTESS',
    codename: 'QUEEN',
    rank: 5,
    maxRank: 10,
    progress: 80,
    perk: 'Tactical Analysis: Unlocks optimal task scheduling and Focus metrics.',
    quote: '"Order and precision will guarantee our palace extraction."',
    color: '#0066ff',
    avatar: '🏍️'
  },
  {
    id: 'futaba',
    name: 'Futaba Sakura',
    arcana: 'IX. THE HERMIT',
    codename: 'ORACLE',
    rank: 2,
    maxRank: 10,
    progress: 50,
    perk: 'Position Hack: Auto-scans deadline proximity and recovers Pomodoro fatigue.',
    quote: '"Target acquired! Commencing tactical data support, Joker!"',
    color: '#00ff66',
    avatar: '🛸'
  },
  {
    id: 'ann',
    name: 'Ann Takamaki',
    arcana: 'VI. THE LOVERS',
    codename: 'PANTHER',
    rank: 3,
    maxRank: 10,
    progress: 30,
    perk: 'Femme Fatale: Increases Charm rating and unlocks high-voltage aesthetic vibes.',
    quote: '"Don\'t let anyone tell you what you can\'t accomplish!"',
    color: '#ff3366',
    avatar: '🔥'
  }
];

const ConfidantsDrawer = ({ isOpen, onClose, onActiveConfidantChange, activeConfidantId = 'morgana' }) => {
  const [confidants, setConfidants] = useState(() => {
    const saved = localStorage.getItem('p5_confidants_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse confidants:', e);
      }
    }
    return DEFAULT_CONFIDANTS;
  });

  const [rankUpTarget, setRankUpTarget] = useState(null);

  useEffect(() => {
    localStorage.setItem('p5_confidants_data', JSON.stringify(confidants));
  }, [confidants]);

  const handleRankUp = (id) => {
    sounds.playSuccess();
    setConfidants((prev) =>
      prev.map((c) => {
        if (c.id === id && c.rank < c.maxRank) {
          const newRank = c.rank + 1;
          setRankUpTarget({ ...c, rank: newRank });
          return { ...c, rank: newRank, progress: 0 };
        }
        return c;
      })
    );
  };

  const handleSelectActive = (id) => {
    sounds.playClick();
    if (onActiveConfidantChange) {
      onActiveConfidantChange(id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="confidants-backdrop" onClick={onClose}>
      <motion.div
        className="confidants-drawer-container"
        onClick={(e) => e.stopPropagation()}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
      >
        {/* Header */}
        <div className="confidants-drawer-header">
          <div>
            <div className="confidants-badge">PHANTOM THIEVES NETWORK</div>
            <h2 className="confidants-heading">COOPERATION // CONFIDANTS</h2>
          </div>
          <button type="button" className="confidants-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <p className="confidants-subtitle">
          Deepen bonds with your team to unlock tactical perks and accelerate Shin Godzilla atomic generation.
        </p>

        {/* Confidants List */}
        <div className="confidants-card-list">
          {confidants.map((confidant) => {
            const isActive = confidant.id === activeConfidantId;
            return (
              <div
                key={confidant.id}
                className={`confidant-card ${isActive ? 'is-active-partner' : ''}`}
                style={{ '--c-color': confidant.color }}
              >
                <div className="confidant-card-top">
                  <div className="confidant-avatar-box">
                    <span className="confidant-emoji">{confidant.avatar}</span>
                  </div>

                  <div className="confidant-info-box">
                    <div className="arcana-tag">{confidant.arcana}</div>
                    <div className="confidant-name-row">
                      <h3 className="confidant-name">{confidant.name}</h3>
                      <span className="codename-pill">[{confidant.codename}]</span>
                    </div>
                  </div>

                  <div className="confidant-rank-box">
                    <span className="rank-label">RANK</span>
                    <span className="rank-val">{confidant.rank}</span>
                  </div>
                </div>

                {/* Quote */}
                <div className="confidant-quote">{confidant.quote}</div>

                {/* Perk */}
                <div className="confidant-perk-box">
                  <Zap size={14} className="perk-icon" />
                  <span className="perk-desc">{confidant.perk}</span>
                </div>

                {/* Bond Progress Bar */}
                <div className="confidant-bond-wrap">
                  <div className="bond-meta">
                    <span>BOND STRENGTH</span>
                    <span>{confidant.progress}%</span>
                  </div>
                  <div className="bond-track">
                    <div
                      className="bond-fill"
                      style={{
                        width: `${confidant.progress}%`,
                        backgroundColor: confidant.color
                      }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="confidant-actions">
                  <button
                    type="button"
                    className={`btn-assign-partner ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectActive(confidant.id)}
                  >
                    <Shield size={13} />
                    <span>{isActive ? 'ACTIVE NAVIGATOR' : 'DEPLOY COMPANION'}</span>
                  </button>

                  <button
                    type="button"
                    className="btn-rank-up"
                    onClick={() => handleRankUp(confidant.id)}
                    disabled={confidant.rank >= confidant.maxRank}
                  >
                    <Sparkles size={13} />
                    <span>{confidant.rank >= confidant.maxRank ? 'MAX RANK' : 'TRAIN BOND'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rank Up Cut-in Modal */}
        <AnimatePresence>
          {rankUpTarget && (
            <motion.div
              className="rankup-cutin-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRankUpTarget(null)}
            >
              <motion.div
                className="rankup-cutin-card"
                initial={{ scale: 0.7, rotate: -6 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0.7, rotate: 6 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="cutin-ribbon">CONFIDANT RANK UP!</div>
                <div className="cutin-arcana">{rankUpTarget.arcana}</div>
                <div className="cutin-avatar">{rankUpTarget.avatar}</div>
                <h2 className="cutin-name">{rankUpTarget.name}</h2>
                <div className="cutin-rank-display">
                  RANK <span className="highlight-rank">{rankUpTarget.rank}</span>
                </div>
                <p className="cutin-perk-unlocked">
                  ★ NEW ABILITY UNLOCKED: {rankUpTarget.perk}
                </p>
                <button
                  type="button"
                  className="cutin-confirm-btn"
                  onClick={() => {
                    sounds.playClick();
                    setRankUpTarget(null);
                  }}
                >
                  I FEEL A DEEPENING BOND... (CONTINUE)
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ConfidantsDrawer;
