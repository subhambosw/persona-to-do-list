import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { sounds } from '../../utils/audio.js';
import './CallingCardAlert.css';

const CallingCardAlert = ({ task, onComplete, onSnooze, onDismiss }) => {
  useEffect(() => {
    // Play both the authentic Godzilla roar AND the dramatic alarm sting on takeover!
    sounds.playGodzillaRoar();
    sounds.playAlarmSting();
  }, [task]);

  if (!task) return null;

  return (
    <div className="calling-card-takeover-overlay" onClick={onDismiss}>
      <div className="takeover-caution-stripes" />
      <div className="takeover-caution-stripes bottom" />

      <motion.div
        className="calling-card-sheet"
        initial={{ scale: 0.5, rotate: -15, opacity: 0 }}
        animate={{ scale: 1, rotate: -2, opacity: 1 }}
        exit={{ scale: 0.7, rotate: 10, opacity: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        <img src="/hat.png" alt="Phantom Hat" className="calling-card-seal" />

        <div className="calling-card-addressed">
          TO THE INDIVIDUAL CONSUMED BY PROCRASTINATION
        </div>

        <h1 className="calling-card-title">CALLING CARD DELIVERED!</h1>

        <div className="calling-card-body">
          <p style={{ margin: '0 0 0.5rem 0' }}>
            We know your distorted desires to postpone what matters most. The deadline has arrived, and there is nowhere left to hide.
          </p>
          <span style={{ fontSize: '0.95rem', color: '#ffaaaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            YOUR MISSION OBJECTIVE:
          </span>
          <span className="calling-card-objective-highlight">
            「 {task.title} 」
          </span>
        </div>

        <div className="calling-card-time-badge">
          ⏰ REMINDER TRIGGERED: {task.reminderTime || 'NOW'}
        </div>

        <div className="calling-card-actions">
          <button
            type="button"
            className="takeover-btn complete-btn"
            onClick={() => {
              sounds.playSlash();
              onComplete(task);
            }}
          >
            ⚔ COMPLETE MISSION
          </button>

          <button
            type="button"
            className="takeover-btn snooze-btn"
            onClick={() => {
              sounds.playClick();
              onSnooze(task);
            }}
          >
            ⏰ SNOOZE 5 MIN
          </button>

          <button
            type="button"
            className="takeover-btn dismiss-btn"
            onClick={() => {
              sounds.playClick();
              onDismiss();
            }}
          >
            ✕ DISMISS
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CallingCardAlert;
