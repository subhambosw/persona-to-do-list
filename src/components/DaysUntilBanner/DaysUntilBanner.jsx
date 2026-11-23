import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../../utils/audio.js';
import { loadFromStorage, saveToStorage } from '../TaskList/TaskList.jsx';
import { ChevronLeft, ChevronRight, Star, Clock } from 'lucide-react';
import './DaysUntilBanner.css';

const STORAGE_KEY = 'daysUntil_priority_target';

/**
 * Checks if a task's deadline / reminder time is considered "near".
 * Rules:
 * 1. Must be starred (isStarred === true) and uncompleted (!isComplete).
 * 2. Date proximity:
 *    - Overdue (diffDays < 0): Near / Critical!
 *    - Due in 1 to 3 days (0 < diffDays <= 3): Near!
 *    - Due today (diffDays === 0):
 *        - If reminderTime is set (e.g. "14:30"):
 *            Near if current time is within 120 minutes (2 hours) of reminder or overdue today.
 *        - If no reminderTime is set:
 *            Due today = deadline is today = Near!
 * 3. If diffDays > 3 or reminder is > 2 hours away: NOT near yet.
 */
export const isTaskTimeNear = (task, currentDate = new Date()) => {
  if (!task || !task.isStarred || task.isComplete) {
    return false;
  }

  const currentDayjs = dayjs(currentDate);
  const now = dayjs();

  const todayStr = currentDayjs.format('YYYY-MM-DD');
  const taskDateStr = task.date || todayStr;

  const todayStart = currentDayjs.startOf('day');
  const targetStart = dayjs(taskDateStr).startOf('day');
  const diffDays = targetStart.diff(todayStart, 'day');

  // More than 3 days away = not near
  if (diffDays > 3) {
    return false;
  }

  // Overdue (negative days) = critical / near
  if (diffDays < 0) {
    return true;
  }

  // 1 to 3 days remaining = near
  if (diffDays > 0) {
    return true;
  }

  // diffDays === 0 (Scheduled for today)
  if (task.reminderTime && typeof task.reminderTime === 'string') {
    const parts = task.reminderTime.split(':').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const reminderMoment = currentDayjs.clone().hour(parts[0]).minute(parts[1]).second(0);
      const diffMinutes = reminderMoment.diff(now, 'minute');

      // Near if within 120 minutes (2 hours) before scheduled time, or if already past reminder time today
      return diffMinutes <= 120;
    }
  }

  // If due today with no reminder time, deadline is today -> near!
  return true;
};

/**
 * Retrieves all starred tasks that are currently "near", sorted by urgency.
 */
export const getNearStarredTasks = (currentDate = new Date()) => {
  const all = loadFromStorage();
  const nearList = all.filter((t) => isTaskTimeNear(t, currentDate));

  const todayStart = dayjs(currentDate).startOf('day');

  return nearList.sort((a, b) => {
    const dateA = dayjs(a.date || todayStart).startOf('day');
    const dateB = dayjs(b.date || todayStart).startOf('day');
    const diffDaysA = dateA.diff(todayStart, 'day');
    const diffDaysB = dateB.diff(todayStart, 'day');

    if (diffDaysA !== diffDaysB) {
      return diffDaysA - diffDaysB; // Earlier date/overdue first
    }

    // If same date, check reminderTime
    if (a.reminderTime && b.reminderTime) {
      return a.reminderTime.localeCompare(b.reminderTime);
    }
    if (a.reminderTime) return -1;
    if (b.reminderTime) return 1;
    return 0;
  });
};

export const loadPriorityTarget = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const savePriorityTarget = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event('priorityTargetUpdated'));
};

const DaysUntilBanner = ({ currentDate, availableTasks = [], isCalendarOpen = false }) => {
  const [nearTasks, setNearTasks] = useState(() => getNearStarredTasks(currentDate));
  const [activeIndex, setActiveIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [bannerTheme, setBannerTheme] = useState(() => {
    const saved = loadPriorityTarget();
    return saved?.theme || 'red';
  });

  const syncNearTasks = () => {
    const list = getNearStarredTasks(currentDate);
    setNearTasks(list);
    if (activeIndex >= list.length) {
      setActiveIndex(0);
    }
  };

  useEffect(() => {
    syncNearTasks();
  }, [currentDate]);

  useEffect(() => {
    const handleUpdate = () => syncNearTasks();
    window.addEventListener('taskListUpdated', handleUpdate);
    window.addEventListener('priorityTargetUpdated', handleUpdate);

    // Periodically re-check every 15 seconds so as time elapses, reminders within 2 hours appear automatically
    const interval = setInterval(() => {
      syncNearTasks();
    }, 15000);

    return () => {
      window.removeEventListener('taskListUpdated', handleUpdate);
      window.removeEventListener('priorityTargetUpdated', handleUpdate);
      clearInterval(interval);
    };
  }, [currentDate, activeIndex]);

  // If calendar is open or NO starred task is near, REMOVE top priority card completely!
  if (isCalendarOpen || nearTasks.length === 0) {
    return null;
  }

  const currentTask = nearTasks[activeIndex % nearTasks.length];
  if (!currentTask) {
    return null;
  }

  const today = dayjs(currentDate).startOf('day');
  const target = dayjs(currentTask.date || currentDate).startOf('day');
  const diffDays = target.diff(today, 'day');
  const now = dayjs();

  let diffMinutes = null;
  if (diffDays === 0 && currentTask.reminderTime) {
    const parts = currentTask.reminderTime.split(':').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const reminderMoment = dayjs(currentDate).clone().hour(parts[0]).minute(parts[1]).second(0);
      diffMinutes = reminderMoment.diff(now, 'minute');
    }
  }

  // Stress Level determination & humorous Persona 5 commentary
  let stressText = '';
  let isCritical = true;
  let isToday = false;
  let isPast = false;

  if (diffDays < 0) {
    stressText = `OVERDUE BY ${Math.abs(diffDays)} DAYS! MISSION FAILED?`;
    isPast = true;
  } else if (diffDays === 0) {
    isToday = true;
    if (currentTask.reminderTime && diffMinutes !== null) {
      if (diffMinutes <= 0) {
        stressText = `REMINDER OVERDUE! (${currentTask.reminderTime}) ACT NOW!`;
      } else if (diffMinutes <= 30) {
        stressText = `CRITICAL PANIC! ${diffMinutes} MINS UNTIL ${currentTask.reminderTime}!`;
      } else {
        stressText = `TIME IS NEAR: ${currentTask.reminderTime} (IN ${diffMinutes}M)!`;
      }
    } else {
      stressText = 'DEADLINE IS TODAY! DO OR DIE!';
    }
  } else if (diffDays === 1) {
    stressText = 'STRESS: TOMORROW! MAXIMUM PANIC! SLEEP IS A TRAP!';
  } else if (diffDays <= 3) {
    stressText = `STRESS: ONLY ${diffDays} DAYS LEFT! HEART RATE CLIMBING!`;
  }

  // Switch between near starred tasks if multiple exist
  const handlePrevStarred = (e) => {
    e.stopPropagation();
    sounds.playClick();
    if (nearTasks.length > 1) {
      setActiveIndex((prev) => (prev - 1 + nearTasks.length) % nearTasks.length);
    }
  };

  const handleNextStarred = (e) => {
    e.stopPropagation();
    sounds.playClick();
    if (nearTasks.length > 1) {
      setActiveIndex((prev) => (prev + 1) % nearTasks.length);
    }
  };

  const handleBannerClick = () => {
    sounds.playAlarmSting();
    setIsEditing(true);
  };

  // Compute number display
  let numberDisplay = `${diffDays}`;
  let labelDisplay = 'DAYS UNTIL';

  if (diffDays < 0) {
    numberDisplay = `-${Math.abs(diffDays)}`;
    labelDisplay = 'OVERDUE';
  } else if (diffDays === 0) {
    if (diffMinutes !== null && diffMinutes > 0 && diffMinutes <= 90) {
      numberDisplay = `${diffMinutes}M`;
      labelDisplay = 'TIME UNTIL';
    } else {
      numberDisplay = '0';
      labelDisplay = 'DAYS UNTIL';
    }
  }

  return (
    <AnimatePresence>
      <div className="days-until-wrapper">
        <motion.div
          className={`days-until-banner ${bannerTheme === 'purple' ? 'theme-purple' : ''} ${isCritical ? 'panic-pulse' : ''}`}
          onClick={handleBannerClick}
          initial={{ y: -60, opacity: 0, rotate: 10 }}
          animate={{ y: 0, opacity: 1, rotate: -2.5 }}
          exit={{ y: -60, opacity: 0, scale: 0.9 }}
          whileHover={{ scale: 1.05, rotate: -1.5 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 350, damping: 20 }}
          title="Top Priority Starred Mission! Click to view declaration."
        >
          <div className="hazard-stripe"></div>

          <div className="banner-header">
            <div className="mission-tag">
              <span className="tag-indicator"></span>
              <span>TOP PRIORITY // CALLING CARD</span>
            </div>

            {/* If multiple near tasks are starred, show switcher arrows */}
            {nearTasks.length > 1 ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#000000',
                  padding: '1px 6px',
                  border: '1px solid #ffe600'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={handlePrevStarred}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ffe600',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex'
                  }}
                  title="Previous Near Starred Mission"
                >
                  <ChevronLeft size={14} />
                </button>
                <span style={{ fontSize: '0.75rem', color: '#ffe600', fontFamily: 'Bebas Neue' }}>
                  ★ {activeIndex + 1}/{nearTasks.length}
                </span>
                <button
                  type="button"
                  onClick={handleNextStarred}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ffe600',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex'
                  }}
                  title="Next Near Starred Mission"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            ) : currentTask.reminderTime ? (
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#ffe600',
                  fontFamily: 'Bebas Neue',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <Clock size={12} /> REMINDER: {currentTask.reminderTime}
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', opacity: 0.9, fontFamily: 'Bebas Neue' }}>
                TARGET: {target.format('MMM DD, YYYY')}
              </div>
            )}
          </div>

          <div className="banner-content">
            <span className="banner-label">{labelDisplay}</span>
            <span className="target-title">{currentTask.title}</span>
            <span className="ellipsis-dots">...</span>
            <div className="days-number-box">
              <span className="days-number critical">
                {numberDisplay}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stress commentary ticker */}
        <motion.div
          className="stress-sub-bar stress-max"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ delay: 0.15 }}
        >
          <span>⚠ {stressText}</span>
        </motion.div>
      </div>

      {/* Calling Card Mission Viewer / Theme Modal */}
      {isEditing && (
        <motion.div
          className="calling-card-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsEditing(false)}
        >
          <motion.div
            className={`calling-card-card ${bannerTheme === 'red' ? 'persona-red-modal' : ''}`}
            initial={{ scale: 0.8, rotate: -5, opacity: 0 }}
            animate={{ scale: 1, rotate: -1, opacity: 1 }}
            exit={{ scale: 0.8, rotate: 5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">CALLING CARD TARGET</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsEditing(false)}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '0.5rem 0' }}>
              <div style={{ background: '#000000', padding: '1rem', border: '2px solid #fc1600', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#ffe600', fontFamily: 'Bebas Neue' }}>
                  ★ TOP PRIORITY ACTIVE MISSION:
                </div>
                <div style={{ fontSize: '1.4rem', color: '#ffffff', fontFamily: 'Luckiest Guy', margin: '0.4rem 0' }}>
                  {currentTask.title}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#e879f9', fontFamily: 'Bebas Neue' }}>
                  DEADLINE: {target.format('YYYY-MM-DD')}
                  {currentTask.reminderTime ? ` // TIME: ${currentTask.reminderTime}` : ''}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">CALLING CARD AESTHETIC</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="theme"
                      value="red"
                      checked={bannerTheme === 'red'}
                      onChange={() => {
                        setBannerTheme('red');
                        savePriorityTarget({ theme: 'red' });
                      }}
                    />
                    <span style={{ color: '#fc1600', fontWeight: 'bold' }}>All-Red (Persona Stress Mode)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="theme"
                      value="purple"
                      checked={bannerTheme === 'purple'}
                      onChange={() => {
                        setBannerTheme('purple');
                        savePriorityTarget({ theme: 'purple' });
                      }}
                    />
                    <span style={{ color: '#c026d3', fontWeight: 'bold' }}>Shin Godzilla Purple</span>
                  </label>
                </div>
              </div>

              {nearTasks.length > 1 && (
                <div className="quick-pick-section">
                  <div className="quick-pick-title">★ URGENT STARRED MISSIONS ({nearTasks.length}):</div>
                  <div className="quick-pick-list">
                    {nearTasks.map((t, idx) => (
                      <button
                        key={t.id}
                        type="button"
                        className={`quick-pick-chip ${idx === activeIndex ? 'active' : ''}`}
                        onClick={() => {
                          sounds.playClick();
                          setActiveIndex(idx);
                        }}
                      >
                        ★ {t.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-actions" style={{ marginTop: '1.2rem' }}>
                <button
                  type="button"
                  className="modal-save-btn"
                  onClick={() => setIsEditing(false)}
                >
                  DISMISS ➔
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DaysUntilBanner;
