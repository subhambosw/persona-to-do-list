import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'framer-motion';
import DateDisplay from './components/DateDisplay/DateDisplay.jsx';
import DaysUntilBanner from './components/DaysUntilBanner/DaysUntilBanner.jsx';
import TaskList, { loadFromStorage, saveToStorage } from './components/TaskList/TaskList.jsx';
import WeeklyDisplay from './components/WeeklyDisplay/WeeklyDisplay.jsx';
import TakeYourTime from './components/TakeYourTime/TakeYourTime.jsx';
import AtomicBeamEffect from './components/AtomicBeam/AtomicBeamEffect.jsx';
import PersonaMascot from './components/PersonaMascot/PersonaMascot.jsx';
import CallingCardAlert from './components/ReminderAlert/CallingCardAlert.jsx';
import BoredomClearGame from './components/BoredomClear/BoredomClearGame.jsx';
import { reminderManager } from './utils/reminderManager.js';
import { sounds } from './utils/audio.js';
import { Gamepad2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import './index.css';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isWeek, setIsWeek] = useState(false);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [isFiringBeam, setIsFiringBeam] = useState(false);
  const [recentTaskEvent, setRecentTaskEvent] = useState(null);
  const [isTremorActive, setIsTremorActive] = useState(false);
  const [activeReminderTask, setActiveReminderTask] = useState(null);
  const [isBoredomOpen, setIsBoredomOpen] = useState(false);

  const goToNextDay = () => {
    setCurrentDate((prev) => dayjs(prev).add(1, 'day').toDate());
  };

  const goToPreviousDay = () => {
    setCurrentDate((prev) => dayjs(prev).subtract(1, 'day').toDate());
  };

  const goToToday = () => {
    sounds.playClick();
    setCurrentDate(new Date());
  };

  const handleTriggerBeam = () => {
    setIsFiringBeam(true);
  };

  // ⚡ AUTOMATIC ATOMIC RAY ON ANY TASK COMPLETED
  const handleTaskEvent = (event) => {
    setRecentTaskEvent(event);
    if (event.type === 'TASK_COMPLETED' || event.type === 'ALL_DONE') {
      setIsTremorActive(true);
      // 🔥 Automatically fire the Shin Godzilla purple atomic beam whenever a task is finished!
      setIsFiringBeam(true);
      setTimeout(() => setIsTremorActive(false), 650);
    }
  };

  // Start checking for scheduled mission reminders
  useEffect(() => {
    reminderManager.startChecking(
      loadFromStorage,
      (triggeredTask) => {
        setActiveReminderTask(triggeredTask);
        setIsTremorActive(true);
        setIsFiringBeam(true);
        setTimeout(() => setIsTremorActive(false), 800);
        setRecentTaskEvent({
          type: 'REMINDER_TRIGGERED',
          title: triggeredTask.title
        });
      }
    );

    return () => reminderManager.stopChecking();
  }, []);

  // Calling Card Alert Handlers:
  const handleCompleteFromAlert = (task) => {
    sounds.playGodzillaRoar();
    sounds.playAtomicBlast();
    const all = loadFromStorage();
    const updated = all.map((t) => (t.id === task.id ? { ...t, isComplete: true } : t));
    saveToStorage(updated);
    setActiveReminderTask(null);

    // Confetti & Atomic Beam celebration
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#c026d3', '#ffe600', '#fc1600', '#ffffff']
    });
    handleTaskEvent({ type: 'TASK_COMPLETED', title: task.title });
  };

  const handleSnoozeFromAlert = (task) => {
    const all = loadFromStorage();
    const snoozedTime = dayjs().add(5, 'minute').format('HH:mm');
    const updated = all.map((t) =>
      t.id === task.id
        ? { ...t, reminderTime: snoozedTime, reminderFired: false }
        : t
    );
    saveToStorage(updated);
    setActiveReminderTask(null);
  };

  const handleDismissAlert = () => {
    setActiveReminderTask(null);
  };

  return (
    <div className={`app-viewport-root ${isTremorActive ? 'kaiju-tremor' : ''}`}>
      {/* 🎭 Official Persona 5 Background Artwork (featuring Joker) with Shin Godzilla Atomic Purple Hue */}
      <div className="persona-background-layer" />
      <div className="persona-bg-vignette" />

      {/* Halftone Comics Overlay */}
      <div className="halftone-overlay" />

      {/* Atmospheric Shin Godzilla Atomic Laser Streak across the background */}
      <div className="atomic-beam-streak" />

      {/* ⚡ Full screen Shin Godzilla Atomic Laser Beam effect when triggered */}
      {isFiringBeam && (
        <AtomicBeamEffect onComplete={() => setIsFiringBeam(false)} />
      )}

      {/* 🎮 BOREDOM CLEAR LAUNCHER BUTTON */}
      <button
        type="button"
        className="boredom-launcher-pill"
        onClick={() => {
          sounds.playClick();
          setIsBoredomOpen(true);
        }}
        title="Play Shin Godzilla Dino Runner inspired by Tomb of the Mask!"
      >
        <Gamepad2 size={18} color="#ffe600" />
        <span>BOREDOM CLEAR</span>
      </button>

      {/* 🕹️ Boredom Clear Minigame Modal */}
      {isBoredomOpen && (
        <BoredomClearGame onClose={() => setIsBoredomOpen(false)} />
      )}

      {/* Full-Screen Calling Card Reminder Takeover Alert */}
      <AnimatePresence>
        {activeReminderTask && (
          <CallingCardAlert
            task={activeReminderTask}
            onComplete={handleCompleteFromAlert}
            onSnooze={handleSnoozeFromAlert}
            onDismiss={handleDismissAlert}
          />
        )}
      </AnimatePresence>

      {/* Top Right: Persona 5 DAYS UNTIL UI */}
      <DaysUntilBanner
        currentDate={currentDate}
        availableTasks={availableTasks}
      />

      {/* Top Left: Persona 5 Date & Time Calendar Widget */}
      <AnimatePresence mode="wait">
        {isWeek ? (
          <WeeklyDisplay
            key="week-ribbon"
            currentDate={currentDate}
            onChangeDate={setCurrentDate}
            onClose={() => setIsWeek(false)}
          />
        ) : (
          <motion.div
            key="date-single"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DateDisplay
              currentDate={currentDate}
              onToggleWeek={() => setIsWeek(true)}
              onPrevDay={goToPreviousDay}
              onNextDay={goToNextDay}
              onGoToToday={goToToday}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center: Shin Godzilla × Persona 5 Task List */}
      <TaskList
        currentDate={currentDate}
        onTasksChange={setAvailableTasks}
        onTaskEvent={handleTaskEvent}
      />

      {/* Bottom Left: Interactive Persona Person (Joker) with dynamic speech & Roar tester */}
      <PersonaMascot
        recentEvent={recentTaskEvent}
        onTriggerRoar={() => {
          setIsTremorActive(true);
          setIsFiringBeam(true);
          setTimeout(() => setIsTremorActive(false), 650);
        }}
      />

      {/* Bottom Right: "Take Your Time" Hat & Logo with SFX and Beam trigger */}
      <TakeYourTime onTriggerBeam={handleTriggerBeam} />
    </div>
  );
}

export default App;
