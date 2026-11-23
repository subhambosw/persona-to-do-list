import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw, FastForward, ShieldAlert, Coffee, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/audio.js';
import './PalacePomodoroModal.css';

const MODES = {
  INFILTRATION: {
    id: 'INFILTRATION',
    label: 'PALACE INFILTRATION',
    tag: 'HIGH ALERT FOCUS',
    duration: 25 * 60,
    color: '#e60012',
    accent: '#ffe600',
    atomicBonus: 25
  },
  SAFE_ROOM: {
    id: 'SAFE_ROOM',
    label: 'SAFE ROOM RESPITE',
    tag: 'SHORT REST',
    duration: 5 * 60,
    color: '#00f0ff',
    accent: '#ffffff',
    atomicBonus: 5
  },
  VELVET_ROOM: {
    id: 'VELVET_ROOM',
    label: 'VELVET ROOM RECOVERY',
    tag: 'LONG REGENERATION',
    duration: 15 * 60,
    color: '#9d00ff',
    accent: '#ffe600',
    atomicBonus: 10
  }
};

const PalacePomodoroModal = ({ isOpen, onClose, onRewardEnergy }) => {
  const [currentMode, setCurrentMode] = useState(MODES.INFILTRATION);
  const [timeLeft, setTimeLeft] = useState(MODES.INFILTRATION.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [alertLevel, setAlertLevel] = useState(15);
  const timerRef = useRef(null);

  // Synchronize when mode changes
  const switchMode = (mode) => {
    sounds.playClick();
    setIsRunning(false);
    setCurrentMode(mode);
    setTimeLeft(mode.duration);
  };

  // Timer interval handling
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, currentMode]);

  const handleComplete = () => {
    setIsRunning(false);
    sounds.playSuccess();
    if (currentMode.id === 'INFILTRATION') {
      setCompletedSessions((prev) => prev + 1);
      setAlertLevel((prev) => Math.min(100, prev + 20));
      if (onRewardEnergy) {
        onRewardEnergy(currentMode.atomicBonus, 'Palace Infiltration Complete!');
      }
    } else {
      setAlertLevel((prev) => Math.max(0, prev - 30));
    }
  };

  const toggleTimer = () => {
    sounds.playClick();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    sounds.playClick();
    setIsRunning(false);
    setTimeLeft(currentMode.duration);
  };

  const skipTimer = () => {
    sounds.playClick();
    handleComplete();
    setTimeLeft(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressPercent = ((currentMode.duration - timeLeft) / currentMode.duration) * 100;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="pomodoro-modal-backdrop" onClick={onClose}>
        <motion.div
          className="pomodoro-modal-container"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.88, opacity: 0, rotate: -2 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.88, opacity: 0, rotate: 2 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
        >
          {/* Header */}
          <div className="pomodoro-header">
            <div className="pomodoro-title-group">
              <span className="p5-badge">PALACE TIMER</span>
              <h2 className="pomodoro-heading">MISSION CLOCK // INFILTRATION</h2>
            </div>
            <button type="button" className="pomodoro-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          {/* Mode Selector Tabs */}
          <div className="pomodoro-mode-selector">
            {Object.values(MODES).map((mode) => (
              <button
                key={mode.id}
                type="button"
                className={`pomodoro-tab-btn ${currentMode.id === mode.id ? 'active' : ''}`}
                style={{
                  '--accent-color': mode.color
                }}
                onClick={() => switchMode(mode)}
              >
                {mode.id === 'INFILTRATION' && <ShieldAlert size={14} />}
                {mode.id === 'SAFE_ROOM' && <Coffee size={14} />}
                {mode.id === 'VELVET_ROOM' && <Sparkles size={14} />}
                <span>{mode.label}</span>
              </button>
            ))}
          </div>

          {/* Dial / Circular Display */}
          <div className="pomodoro-display-card">
            <div className="pomodoro-subtag">{currentMode.tag}</div>

            {/* Angular Progress Gauge */}
            <div className="pomodoro-timer-frame">
              <svg className="pomodoro-svg-ring" viewBox="0 0 240 240">
                <circle
                  className="ring-bg"
                  cx="120"
                  cy="120"
                  r="100"
                  strokeWidth="8"
                />
                <circle
                  className="ring-progress"
                  cx="120"
                  cy="120"
                  r="100"
                  strokeWidth="10"
                  stroke={currentMode.color}
                  strokeDasharray={2 * Math.PI * 100}
                  strokeDashoffset={2 * Math.PI * 100 * (1 - progressPercent / 100)}
                />
              </svg>

              <div className="pomodoro-time-center">
                <span className="time-digits">{formatTime(timeLeft)}</span>
                <span className="time-status-pill" style={{ color: currentMode.accent }}>
                  {isRunning ? 'TACTICAL FOCUS ACTIVE' : 'OPERATION STANDBY'}
                </span>
              </div>
            </div>

            {/* Alert Level / Stealth Meter */}
            <div className="pomodoro-stealth-bar-wrap">
              <div className="stealth-meta">
                <span>SECURITY ALERT LEVEL</span>
                <span className="stealth-pct">{alertLevel}%</span>
              </div>
              <div className="stealth-track">
                <div
                  className="stealth-fill"
                  style={{
                    width: `${alertLevel}%`,
                    backgroundColor: alertLevel > 70 ? '#e60012' : '#9d00ff'
                  }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="pomodoro-ctrl-row">
              <button
                type="button"
                className="pomodoro-btn secondary"
                onClick={resetTimer}
                title="Reset Clock"
              >
                <RotateCcw size={16} />
                <span>RESET</span>
              </button>

              <button
                type="button"
                className={`pomodoro-btn primary ${isRunning ? 'running' : ''}`}
                onClick={toggleTimer}
              >
                {isRunning ? <Pause size={20} /> : <Play size={20} />}
                <span>{isRunning ? 'HOLD' : 'COMMENCE'}</span>
              </button>

              <button
                type="button"
                className="pomodoro-btn secondary"
                onClick={skipTimer}
                title="Fast-Forward Session"
              >
                <FastForward size={16} />
                <span>SKIP</span>
              </button>
            </div>

            {/* Reward Notification Banner */}
            <div className="pomodoro-reward-info">
              <span>★ COMPLETION REWARD:</span>
              <strong>+{currentMode.atomicBonus}% ATOMIC ENERGY</strong>
              <span className="session-count">SESSIONS COMPLETED: {completedSessions}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PalacePomodoroModal;
