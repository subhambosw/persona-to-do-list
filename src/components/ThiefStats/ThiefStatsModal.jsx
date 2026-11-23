import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Shield, Wrench, Heart, Sparkles, Award } from 'lucide-react';
import { sounds } from '../../utils/audio.js';
import './ThiefStatsModal.css';

const STAT_CONFIG = [
  {
    key: 'knowledge',
    label: 'KNOWLEDGE',
    icon: BookOpen,
    color: '#00f0ff',
    titles: ['Oblivious', 'Learned', 'Scholarly', 'Encyclopedic', 'Erudite'],
    desc: 'Deep study, research, technical documentation, and tactical planning.'
  },
  {
    key: 'guts',
    label: 'GUTS',
    icon: Shield,
    color: '#e60012',
    titles: ['Milquetoast', 'Bold', 'Staunch', 'Dauntless', 'Lionhearted'],
    desc: 'High priority alerts, tough deadlines, and conquering intimidating bugs.'
  },
  {
    key: 'proficiency',
    label: 'PROFICIENCY',
    icon: Wrench,
    color: '#ffe600',
    titles: ['Bumbling', 'Decent', 'Skilled', 'Masterful', 'Transcendent'],
    desc: 'Hands-on coding, prototyping, tool craftsmanship, and execution speed.'
  },
  {
    key: 'kindness',
    label: 'KINDNESS',
    icon: Heart,
    color: '#10b981',
    titles: ['Inoffensive', 'Considerate', 'Empathetic', 'Affectionate', 'Angelic'],
    desc: 'Team mentoring, peer reviews, code health, and self-care balance.'
  },
  {
    key: 'charm',
    label: 'CHARM',
    icon: Sparkles,
    color: '#d946ef',
    titles: ['Existent', 'Dauntless', 'Confident', 'Charismatic', 'Debonair'],
    desc: 'Presentations, release announcements, UI aesthetics, and demos.'
  }
];

const ThiefStatsModal = ({ isOpen, onClose, tasks = [] }) => {
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('p5_thief_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      knowledge: 3.4,
      guts: 4.1,
      proficiency: 4.8,
      kindness: 3.2,
      charm: 3.9
    };
  });

  const [selectedStat, setSelectedStat] = useState(STAT_CONFIG[0]);
  const canvasRef = useRef(null);

  // Save stats to localStorage
  useEffect(() => {
    localStorage.setItem('p5_thief_stats', JSON.stringify(stats));
  }, [stats]);

  // Train a specific stat
  const handleTrainStat = (key) => {
    sounds.playSuccess();
    setStats((prev) => {
      const current = prev[key] || 1;
      const updated = Math.min(5, Number((current + 0.2).toFixed(1)));
      return { ...prev, [key]: updated };
    });
  };

  // Draw 5-axis Pentagon Radar Chart
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = width * 0.38;
    const sides = 5;
    const angleStep = (2 * Math.PI) / sides;
    const startAngle = -Math.PI / 2; // Point top

    ctx.clearRect(0, 0, width, height);

    // 1. Draw concentric background pentagon webs (Ranks 1 to 5)
    for (let level = 1; level <= 5; level++) {
      const radius = (maxRadius / 5) * level;
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = startAngle + i * angleStep;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = level === 5 ? 'rgba(157, 0, 255, 0.6)' : 'rgba(157, 0, 255, 0.2)';
      ctx.lineWidth = level === 5 ? 2 : 1;
      ctx.stroke();
    }

    // 2. Draw axis spines from center to vertices
    for (let i = 0; i < sides; i++) {
      const angle = startAngle + i * angleStep;
      const x = centerX + maxRadius * Math.cos(angle);
      const y = centerY + maxRadius * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(157, 0, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 3. Draw stat filled polygon
    const points = STAT_CONFIG.map((conf, i) => {
      const val = Math.min(5, Math.max(0.5, stats[conf.key] || 1));
      const radius = (maxRadius / 5) * val;
      const angle = startAngle + i * angleStep;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });

    // Fill polygon
    ctx.beginPath();
    points.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();

    const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, maxRadius);
    gradient.addColorStop(0, 'rgba(255, 230, 0, 0.45)');
    gradient.addColorStop(0.6, 'rgba(157, 0, 255, 0.55)');
    gradient.addColorStop(1, 'rgba(230, 0, 18, 0.65)');
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = '#ffe600';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#ffe600';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 4. Draw glowing nodes
    points.forEach((pt, idx) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = STAT_CONFIG[idx].color;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    });
  }, [isOpen, stats]);

  if (!isOpen) return null;

  return (
    <div className="thief-stats-backdrop" onClick={onClose}>
      <motion.div
        className="thief-stats-container"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.9, opacity: 0, rotate: 2 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      >
        {/* Header */}
        <div className="stats-header">
          <div>
            <span className="stats-badge">PHANTOM THIEF ATTRIBUTES</span>
            <h2 className="stats-heading">PROTAGONIST STATS // RADAR</h2>
          </div>
          <button type="button" className="stats-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content Layout */}
        <div className="stats-body-grid">
          {/* Left: Canvas Pentagon */}
          <div className="radar-canvas-column">
            <div className="canvas-wrapper">
              <canvas
                ref={canvasRef}
                width={320}
                height={320}
                className="radar-canvas"
              />
            </div>
            <div className="overall-rating-card">
              <Award className="rating-icon" size={24} />
              <div>
                <span className="rating-label">THIEF PROFICIENCY TIER</span>
                <div className="rating-value">RANK S // MASTER PHANTOM</div>
              </div>
            </div>
          </div>

          {/* Right: Stat Breakdown & Training */}
          <div className="stats-breakdown-column">
            <div className="stat-cards-vertical">
              {STAT_CONFIG.map((cfg) => {
                const Icon = cfg.icon;
                const value = stats[cfg.key] || 1;
                const intRank = Math.min(5, Math.max(1, Math.floor(value)));
                const titleStr = cfg.titles[intRank - 1];
                const isSelected = selectedStat.key === cfg.key;

                return (
                  <div
                    key={cfg.key}
                    className={`stat-pill-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedStat(cfg);
                    }}
                    style={{ '--stat-accent': cfg.color }}
                  >
                    <div className="stat-icon-square">
                      <Icon size={16} />
                    </div>

                    <div className="stat-meta-mid">
                      <div className="stat-label-line">
                        <span className="stat-name">{cfg.label}</span>
                        <span className="stat-rank-text">LV {intRank} // {titleStr}</span>
                      </div>
                      <div className="stat-gauge-track">
                        <div
                          className="stat-gauge-bar"
                          style={{
                            width: `${(value / 5) * 100}%`,
                            backgroundColor: cfg.color
                          }}
                        />
                      </div>
                    </div>

                    <div className="stat-val-score">{value.toFixed(1)}</div>
                  </div>
                );
              })}
            </div>

            {/* Selected Stat Detail & Boost */}
            <div className="selected-stat-box">
              <div className="stat-box-title" style={{ color: selectedStat.color }}>
                {selectedStat.label}: HOW TO ELEVATE
              </div>
              <p className="stat-box-desc">{selectedStat.desc}</p>
              <button
                type="button"
                className="btn-train-stat"
                style={{ '--stat-accent': selectedStat.color }}
                onClick={() => handleTrainStat(selectedStat.key)}
              >
                <Sparkles size={14} />
                <span>TRAIN {selectedStat.label} (+0.2 EXP)</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ThiefStatsModal;
