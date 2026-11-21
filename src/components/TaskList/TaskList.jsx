import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio.js';
import { reminderManager } from '../../utils/reminderManager.js';
import { savePriorityTarget, loadPriorityTarget, isTaskTimeNear } from '../DaysUntilBanner/DaysUntilBanner.jsx';
import { asset } from '../../utils/assets.js';
import { Star, Bell, Clock } from 'lucide-react';
import './TaskList.css';

export const STORAGE_KEY = 'taskList_data';

const getInitialTasks = () => {
  const todayStr = dayjs().format('YYYY-MM-DD');
  return [
    {
      id: 'p5-interview-task',
      title: 'THE INTERVIEW PREPARATION',
      isComplete: false,
      isStarred: false,
      reminderTime: '',
      reminderFired: false,
      date: todayStr
    },
    {
      id: 'p5-task-2',
      title: 'CONFIDANT SOCIAL LINK LEVEL UP',
      isComplete: false,
      isStarred: false,
      reminderTime: '',
      reminderFired: false,
      date: todayStr
    },
    {
      id: 'p5-task-3',
      title: 'SHIN GODZILLA ATOMIC PURPLE REVIEW',
      isComplete: true,
      isStarred: false,
      reminderTime: '',
      reminderFired: false,
      date: todayStr
    }
  ];
};

export const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialTasks();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);

    // One-time cleanup for old initial dummy starred tasks so app starts with NO top priority card by default
    const MIGRATION_KEY = 'priority_card_unstarred_clean_v4';
    if (!localStorage.getItem(MIGRATION_KEY)) {
      const cleaned = parsed.map((t) => {
        if (t.id === 'p5-interview-task' || t.id === 'p5-task-2') {
          return { ...t, isStarred: false };
        }
        return t;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      localStorage.setItem(MIGRATION_KEY, 'true');
      return cleaned;
    }

    return parsed;
  } catch {
    return getInitialTasks();
  }
};

export const saveToStorage = (list) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event('taskListUpdated'));
};

const TaskList = ({ currentDate, onTasksChange, onTaskEvent }) => {
  const [newTask, setNewTask] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');
  const [tasksForDate, setTasksForDate] = useState([]);
  const [allTasks, setAllTasks] = useState(loadFromStorage);

  const formattedDate = dayjs(currentDate).format('YYYY-MM-DD');

  const syncTasks = () => {
    const all = loadFromStorage();
    setAllTasks(all);
    const filtered = all.filter((t) => t.date === formattedDate);
    setTasksForDate(filtered);
    if (onTasksChange) onTasksChange(filtered);
  };

  useEffect(() => {
    syncTasks();
  }, [formattedDate]);

  useEffect(() => {
    const handleListUpdate = () => syncTasks();
    window.addEventListener('taskListUpdated', handleListUpdate);
    return () => window.removeEventListener('taskListUpdated', handleListUpdate);
  }, [formattedDate]);

  const persistTasks = (newTasksForDate) => {
    const all = loadFromStorage();
    const otherDates = all.filter((t) => t.date !== formattedDate);
    const updated = [...otherDates, ...newTasksForDate];
    saveToStorage(updated);
    setAllTasks(updated);
    setTasksForDate(newTasksForDate);
    if (onTasksChange) onTasksChange(newTasksForDate);
  };

  const handleAddTask = (e) => {
    if (e) e.preventDefault();
    if (!newTask.trim()) return;

    sounds.playClick();
    // Prompt/request notification permission on adding task with reminder
    if (newReminderTime) {
      reminderManager.requestNotificationPermission();
    }

    const newItem = {
      id: 'task-' + Date.now(),
      title: newTask.trim(),
      isComplete: false,
      isStarred: false,
      reminderTime: newReminderTime,
      reminderFired: false,
      date: formattedDate
    };

    const updated = [...tasksForDate, newItem];
    persistTasks(updated);
    setNewTask('');
    setNewReminderTime('');
  };

  // Quick preset chips for reminder
  const setQuickTime = (type) => {
    sounds.playClick();
    reminderManager.requestNotificationPermission();
    const now = dayjs();
    if (type === '15m') {
      setNewReminderTime(now.add(15, 'minute').format('HH:mm'));
    } else if (type === '1h') {
      setNewReminderTime(now.add(1, 'hour').format('HH:mm'));
    } else if (type === '20:00') {
      setNewReminderTime('20:00');
    } else if (type === 'clear') {
      setNewReminderTime('');
    }
  };

  const handleToggleComplete = (index) => {
    const willBeComplete = !tasksForDate[index].isComplete;

    if (willBeComplete) {
      sounds.playGodzillaRoar();
      if (onTaskEvent) {
        onTaskEvent({
          type: 'TASK_COMPLETED',
          title: tasksForDate[index].title
        });
      }
    } else {
      sounds.playSlash();
    }

    const updated = tasksForDate.map((item, idx) => {
      if (idx === index) {
        return { ...item, isComplete: !item.isComplete };
      }
      return item;
    });
    persistTasks(updated);

    const allDone = updated.length > 0 && updated.every((t) => t.isComplete);
    if (allDone && willBeComplete) {
      triggerAtomicCelebration();
      if (onTaskEvent) {
        onTaskEvent({ type: 'ALL_DONE' });
      }
    }
  };

  const triggerAtomicCelebration = () => {
    sounds.playAtomicBlast();
    confetti({
      particleCount: 130,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#c026d3', '#9333ea', '#e879f9', '#ffffff', '#fc1600']
    });
  };

  const handleDeleteTask = (index) => {
    sounds.playClick();
    const updated = tasksForDate.filter((_, idx) => idx !== index);
    persistTasks(updated);
  };

  // 🌟 INDEPENDENT MULTI-TASK STARRING (Works on both/all tasks!)
  const handleToggleStar = (index) => {
    const targetTask = tasksForDate[index];
    const newStarredState = !targetTask.isStarred;

    if (newStarredState) {
      if (isTaskTimeNear(targetTask, currentDate)) {
        sounds.playAlarmSting();
      } else {
        sounds.playClick();
      }
    } else {
      sounds.playSlash();
    }

    const updated = tasksForDate.map((item, idx) => {
      if (idx === index) {
        return { ...item, isStarred: newStarredState };
      }
      return item;
    });
    persistTasks(updated);

    if (newStarredState) {
      savePriorityTarget({
        title: targetTask.title.toUpperCase(),
        targetDate: targetTask.date || formattedDate,
        theme: 'red',
        note: 'Starred priority mission active!'
      });
    }
  };

  // Completion calculation
  const totalTasks = tasksForDate.length;
  const completedTasks = tasksForDate.filter((t) => t.isComplete).length;
  const percentComplete = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="task-master-container">
      {/* Shin Godzilla Atomic Energy Gauge */}
      <div className="energy-gauge-container">
        <div className="energy-label-row">
          <span>⚡ ATOMIC BLAST OUTPUT: {percentComplete}%</span>
          <span>
            {completedTasks}/{totalTasks} TASKS COMPLETE
          </span>
        </div>
        <div className="energy-track">
          <div
            className="energy-fill"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>

      {/* Main Task Card Box */}
      <div className="task-card-box">
        <div className="task-box-header">
          <h2 className="task-box-title">
            <span>TAKE YOUR TIME</span>
            <span style={{ fontSize: '1rem', color: '#e879f9' }}>// TASKS</span>
          </h2>
          <div className="date-indicator-badge">
            {dayjs(currentDate).format('ddd, MMM DD')}
          </div>
        </div>

        {/* Input Form with Reminder Time Selector */}
        <form onSubmit={handleAddTask} className="task-input-section">
          <div className="task-input-row">
            <input
              type="text"
              className="task-text-input"
              placeholder="Enter mission objective..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />

            {/* Time / Reminder Picker */}
            <div className="reminder-input-wrapper" title="Set a reminder time for this mission!">
              <Bell size={16} color="#ffe600" />
              <input
                type="time"
                className="reminder-time-input"
                value={newReminderTime}
                onChange={(e) => setNewReminderTime(e.target.value)}
              />
            </div>

            <button type="submit" className="task-add-btn">
              + INFILTRATE
            </button>
          </div>

          {/* Quick Preset Time Chips */}
          <div className="reminder-presets-row">
            <span style={{ fontSize: '0.8rem', color: '#a855f7', fontFamily: 'Bebas Neue' }}>
              REMINDER:
            </span>
            <button
              type="button"
              className={`preset-chip ${newReminderTime ? '' : 'active'}`}
              onClick={() => setQuickTime('clear')}
            >
              NONE
            </button>
            <button
              type="button"
              className="preset-chip"
              onClick={() => setQuickTime('15m')}
            >
              +15 MIN
            </button>
            <button
              type="button"
              className="preset-chip"
              onClick={() => setQuickTime('1h')}
            >
              +1 HOUR
            </button>
            <button
              type="button"
              className="preset-chip"
              onClick={() => setQuickTime('20:00')}
            >
              TONIGHT (20:00)
            </button>
            {newReminderTime && (
              <span style={{ fontSize: '0.85rem', color: '#ffe600', fontFamily: 'Bebas Neue', marginLeft: 'auto' }}>
                ⏰ SET FOR {newReminderTime}
              </span>
            )}
          </div>
        </form>

        {/* Tasks List */}
        <ul className="task-items-list">
          {tasksForDate.length === 0 ? (
            <div className="empty-task-placeholder">
              <img src={asset('none.png')} alt="No Tasks" className="empty-task-img" />
              <div className="empty-task-text">NO MISSIONS FOR THIS DAY</div>
            </div>
          ) : (
            <AnimatePresence>
              {tasksForDate.map((task, index) => {
                return (
                  <motion.li
                    key={task.id}
                    className={`task-item-card ${task.isComplete ? 'is-completed' : ''} ${task.isStarred ? 'is-starred-card' : ''}`}
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 60, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  >
                    <div
                      className="task-item-content"
                      onClick={() => handleToggleComplete(index)}
                    >
                      <div
                        className={`task-checkbox-diamond ${task.isComplete ? 'checked' : ''}`}
                      >
                        {task.isComplete && (
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              background: '#000000',
                              borderRadius: '50%'
                            }}
                          />
                        )}
                      </div>

                      <div className="task-item-title-wrapper">
                        <span
                          className={`task-item-title ${task.isComplete ? 'strike' : ''}`}
                          title={task.title}
                        >
                          {task.title}
                        </span>

                        {/* Calling Card Active / Pending indicator */}
                        {task.isStarred && !task.isComplete && (
                          isTaskTimeNear(task, currentDate) ? (
                            <span className="calling-card-active-pill" title="Top priority card active in top right!">
                              ★ CALLING CARD ACTIVE
                            </span>
                          ) : (
                            <span className="calling-card-pending-pill" title="Calling card appears when deadline/time is near!">
                              ★ STARRED (CARD WHEN NEAR)
                            </span>
                          )
                        )}

                        {/* Reminder Badge */}
                        {task.reminderTime && (
                          <div className="task-reminder-pill" title={`Reminder set for ${task.reminderTime}`}>
                            <Clock size={11} />
                            <span>{task.reminderTime}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="task-actions-row">
                      {/* ⭐ INDEPENDENT MULTI-TASK STAR BUTTON */}
                      <button
                        type="button"
                        className="task-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStar(index);
                        }}
                        title={task.isStarred ? 'Starred Priority Mission! Click to unstar' : 'Click to Star as Top Priority Mission!'}
                      >
                        <Star
                          size={20}
                          fill={task.isStarred ? '#ffe600' : 'none'}
                          color={task.isStarred ? '#ffe600' : '#ffffff'}
                        />
                      </button>

                      {/* Delete task button */}
                      <button
                        type="button"
                        className="task-action-btn delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(index);
                        }}
                        title="Delete task"
                      >
                        <img
                          src={asset('redCross.png')}
                          alt="Delete"
                          className="action-icon-img cross-icon"
                        />
                      </button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          )}
        </ul>
      </div>
    </div>
  );
};

export default TaskList;
