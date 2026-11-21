import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { sounds } from '../../utils/audio.js';
import { Undo2, ArrowLeft, RotateCcw } from 'lucide-react';
import './WeeklyDisplay.css';

const WeeklyDisplay = ({ currentDate, onChangeDate, onClose }) => {
  const [weekDays, setWeekDays] = useState([]);

  useEffect(() => {
    const list = [];
    const dayOfWeek = parseInt(dayjs(currentDate).format('d')); // 0 = Sunday

    for (let i = dayOfWeek; i > 0; i--) {
      list.push(dayjs(currentDate).subtract(i, 'day').toDate());
    }
    list.push(dayjs(currentDate).toDate());
    for (let i = 1; i <= 6 - dayOfWeek; i++) {
      list.push(dayjs(currentDate).add(i, 'day').toDate());
    }
    setWeekDays(list);
  }, [currentDate]);

  // Keyboard shortcut: ESC to exit calendar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        sounds.playClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePrevWeek = () => {
    sounds.playClick();
    if (weekDays.length > 0) {
      const prev = dayjs(weekDays[0]).subtract(1, 'day').toDate();
      onChangeDate(prev);
    }
  };

  const handleNextWeek = () => {
    sounds.playClick();
    if (weekDays.length > 0) {
      const next = dayjs(weekDays[6]).add(1, 'day').toDate();
      onChangeDate(next);
    }
  };

  const handleSelectDay = (day) => {
    sounds.playClick();
    onChangeDate(day);
    onClose();
  };

  const curDayIndex = parseInt(dayjs(currentDate).format('d'));
  const isCurrentDayToday = dayjs(currentDate).isSame(dayjs(), 'day');

  return (
    <>
      {/* Clickable darkened backdrop to easily exit calendar */}
      <motion.div
        className="weekly-calendar-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          sounds.playClick();
          onClose();
        }}
      />

      <div className="weekly-ribbon-container">
        {/* Top Control Bar with Persona 5 "EXIT CALENDAR / BACK" Button */}
        <motion.div
          className="weekly-ribbon-top-bar"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
        >
          <button
            type="button"
            className="calendar-exit-back-btn"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            title="Exit Weekly Calendar and return to main view (ESC)"
          >
            <Undo2 size={18} strokeWidth={2.5} />
            <span>EXIT CALENDAR</span>
            <span className="kbd-shortcut-chip">ESC</span>
          </button>

          {/* Jump back to Today if not on today */}
          {!isCurrentDayToday && (
            <button
              type="button"
              className="calendar-today-reset-btn"
              onClick={() => {
                sounds.playClick();
                onChangeDate(new Date());
              }}
              title="Return back to Today's date"
            >
              <RotateCcw size={14} />
              <span>BACK TO TODAY</span>
            </button>
          )}
        </motion.div>

        {/* Main Weekly Ribbon */}
        <motion.ul
          className="weekly-ribbon"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
        >
          <button
            type="button"
            className="ribbon-nav-btn"
            onClick={handlePrevWeek}
            title="Previous Week"
          >
            <img src="/arrowLeft.png" alt="Prev" className="ribbon-arrow-img" />
          </button>

          {weekDays.map((item, index) => {
            const dayAbbr = dayjs(item).format('ddd').toLowerCase();
            const dayNum = parseInt(dayjs(item).format('D'));
            const d1 = Math.floor(dayNum / 10);
            const d2 = dayNum % 10;
            const isSelected = index === curDayIndex;

            return (
              <motion.li
                key={dayjs(item).format('YYYY-MM-DD')}
                className={`week-day-card ${isSelected ? 'active-day' : ''}`}
                onClick={() => handleSelectDay(item)}
                whileHover={{ scale: 1.15, rotate: isSelected ? 0 : 3 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSelected && (
                  <img
                    src="/tracker.png"
                    alt="Current"
                    className="active-tracker-badge"
                  />
                )}
                <div className="date-digits-row">
                  <img src={`/nos/${d1}.png`} alt={`${d1}`} className="digit-img" />
                  <img src={`/nos/${d2}.png`} alt={`${d2}`} className="digit-img" />
                </div>
                <img
                  src={`/days2/${dayAbbr}.png`}
                  alt={dayAbbr}
                  className="day-abbr-img"
                />
              </motion.li>
            );
          })}

          <button
            type="button"
            className="ribbon-nav-btn"
            onClick={handleNextWeek}
            title="Next Week"
          >
            <img src="/arrowRight.png" alt="Next" className="ribbon-arrow-img" />
          </button>

          {/* Persona 5 ⮌ BACK Exit Button on the right of the ribbon */}
          <button
            type="button"
            className="ribbon-exit-btn"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            title="Exit Calendar (ESC)"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            <span>BACK</span>
          </button>
        </motion.ul>
      </div>
    </>
  );
};

export default WeeklyDisplay;
