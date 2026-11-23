import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Zap, Award, Sparkles, AlertTriangle } from 'lucide-react';
import { sounds } from '../../utils/audio.js';
import './GodzillaEvolutionWidget.css';

const EVOLUTION_FORMS = [
  {
    id: 2,
    name: 'FORM 2: KAMATA-KUN',
    codename: 'EMERGENCE',
    minStreak: 1,
    desc: 'Crawling primordial amphibious terror with fluid vents and unblinking amber eyes.',
    perk: 'Gains +10% base atomic energy per task.',
    color: '#ffcc00',
    glyph: '🦎'
  },
  {
    id: 3,
    name: 'FORM 3: SHINAGAWA-KUN',
    codename: 'THERMODYNAMIC BIPED',
    minStreak: 3,
    desc: 'Erect posture standing on hind legs, venting superheated steam from throat gills.',
    perk: 'Unlocks +15% Pomodoro focus stamina and 1.5x streak EXP.',
    color: '#ff4400',
    glyph: '🦖'
  },
  {
    id: 4,
    name: 'FORM 4: KAMAKURA TITAN',
    codename: 'CALAMITY INCARNATE',
    minStreak: 6,
    desc: '118.5m atomic colossus. Phased-array dorsal spines emit high-energy violet radiation beams.',
    perk: 'All-Out Attack threshold lowered to 80% task completion.',
    color: '#9d00ff',
    glyph: '⚡'
  },
  {
    id: 5,
    name: 'FORM 5: AWAKENED HYBRID',
    codename: 'HUMANOID TAIL SPAWN',
    minStreak: 10,
    desc: 'Apex hyper-evolution. Winged humanoid micro-entities erupt from the atomic tail.',
    perk: 'Passive automatic task completion multiplier & infinite radiation pulse.',
    color: '#ff0055',
    glyph: '👑'
  }
];

const GodzillaEvolutionWidget = ({
  isOpen,
  onClose,
  streakDays = 5,
  atomicEnergy = 75,
  onTriggerAtomicPulse
}) => {
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('p5_godzilla_streak');
    return saved ? parseInt(saved, 10) : streakDays;
  });

  const [isLaserFiring, setIsLaserFiring] = useState(false);

  useEffect(() => {
    localStorage.setItem('p5_godzilla_streak', streak.toString());
  }, [streak]);

  // Determine current form
  const currentForm =
    [...EVOLUTION_FORMS].reverse().find((f) => streak >= f.minStreak) || EVOLUTION_FORMS[0];

  const nextForm = EVOLUTION_FORMS.find((f) => f.minStreak > streak);

  const handleTestStreakIncrement = () => {
    sounds.playSuccess();
    setStreak((prev) => prev + 1);
  };

  const handleFireAtomicLaser = () => {
    sounds.playBeam();
    setIsLaserFiring(true);
    if (onTriggerAtomicPulse) onTriggerAtomicPulse();
    setTimeout(() => {
      setIsLaserFiring(false);
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="godzilla-evo-backdrop" onClick={onClose}>
      {/* Screen Laser Overlay */}
      {isLaserFiring && (
        <div className="atomic-screen-laser-beam">
          <div className="laser-flash-overlay" />
          <div className="laser-core-line" />
        </div>
      )}

      <motion.div
        className="godzilla-evo-container"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      >
        {/* Header */}
        <div className="evo-header">
          <div>
            <span className="evo-badge">BIOLOGICAL THREAT LEVEL // SSS</span>
            <h2 className="evo-heading">SHIN GODZILLA // EVOLUTION STREAK</h2>
          </div>
          <button type="button" className="evo-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Current Titan Hero Banner */}
        <div className="current-form-banner" style={{ '--form-glow': currentForm.color }}>
          <div className="form-glyph-box">
            <span className="glyph-symbol">{currentForm.glyph}</span>
          </div>

          <div className="form-details-box">
            <div className="form-codename">{currentForm.codename}</div>
            <h3 className="form-title">{currentForm.name}</h3>
            <p className="form-desc">{currentForm.desc}</p>
            <div className="form-active-perk">
              <Zap size={14} className="spark-icon" />
              <span>{currentForm.perk}</span>
            </div>
          </div>

          <div className="streak-counter-box">
            <span className="streak-label">STREAK</span>
            <span className="streak-number">{streak}</span>
            <span className="streak-unit">DAYS</span>
          </div>
        </div>

        {/* Radiation Energy Bar & Laser Trigger */}
        <div className="radiation-meter-card">
          <div className="rad-meta-row">
            <span className="rad-title">DORSAL SPINE RADIATION CORE</span>
            <span className="rad-pct">{atomicEnergy}% ATOMIC CHARGE</span>
          </div>
          <div className="rad-track">
            <div
              className="rad-fill"
              style={{
                width: `${atomicEnergy}%`
              }}
            />
          </div>

          <div className="laser-trigger-row">
            <button
              type="button"
              className="btn-atomic-beam"
              onClick={handleFireAtomicLaser}
              disabled={isLaserFiring}
            >
              <Flame size={16} />
              <span>UNLEASH DORSAL ATOMIC BEAM</span>
            </button>

            <button
              type="button"
              className="btn-streak-boost"
              onClick={handleTestStreakIncrement}
              title="Add 1 Day to Streak"
            >
              <Sparkles size={14} />
              <span>+1 STREAK DAY</span>
            </button>
          </div>
        </div>

        {/* Evolution Roadmap */}
        <div className="evo-roadmap-title">MUTATION TIMELINE // FORMS</div>
        <div className="forms-timeline-grid">
          {EVOLUTION_FORMS.map((form) => {
            const isUnlocked = streak >= form.minStreak;
            const isCurrent = form.id === currentForm.id;

            return (
              <div
                key={form.id}
                className={`form-timeline-card ${isUnlocked ? 'unlocked' : 'locked'} ${
                  isCurrent ? 'current' : ''
                }`}
                style={{ '--f-color': form.color }}
              >
                <div className="timeline-card-header">
                  <span className="timeline-glyph">{form.glyph}</span>
                  <span className="timeline-streak-req">{form.minStreak}+ DAYS</span>
                </div>
                <div className="timeline-card-name">{form.name}</div>
                <div className="timeline-status-pill">
                  {isCurrent ? 'CURRENT FORM' : isUnlocked ? 'MUTATED' : 'LOCKED'}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default GodzillaEvolutionWidget;
