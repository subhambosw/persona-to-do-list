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
import BottomCommandDock from './components/BottomCommandDock/BottomCommandDock.jsx';
import PalacePomodoroModal from './components/PomodoroTimer/PalacePomodoroModal.jsx';
import ConfidantsDrawer from './components/Confidants/ConfidantsDrawer.jsx';
import ThiefStatsModal from './components/ThiefStats/ThiefStatsModal.jsx';
import GodzillaEvolutionWidget from './components/GodzillaEvolution/GodzillaEvolutionWidget.jsx';
import AllOutAttackCutin from './components/AllOutAttack/AllOutAttackCutin.jsx';
import PocketWatchMenu from './components/PocketWatchMenu/PocketWatchMenu.jsx';
import { lofiPlayer } from './utils/lofiPlayer.js';
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

  // New P5 × Shin Godzilla Tactical Features
  const [isPocketWatchOpen, setIsPocketWatchOpen] = useState(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [isConfidantsOpen, setIsConfidantsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isEvolutionOpen, setIsEvolutionOpen] = useState(false);
  const [isAllOutAttackOpen, setIsAllOutAttackOpen] = useState(false);
  const [activeConfidantId, setActiveConfidantId] = useState('morgana');
  const [atomicEnergy, setAtomicEnergy] = useState(75);
  const [streakDays, setStreakDays] = useState(() => {
    const saved = localStorage.getItem('p5_godzilla_streak');
    return saved ? parseInt(saved, 10) : 5;
  });

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

  // ⚡ AUTOMATIC ATOMIC RAY ON ANY TASK COMPLETED & ALL-OUT ATTACK ON 100%
  const handleTaskEvent = (event) => {
    setRecentTaskEvent(event);
    if (event.type === 'TASK_COMPLETED') {
      setIsTremorActive(true);
      setIsFiringBeam(true);
      setAtomicEnergy((prev) => Math.min(100, prev + 15));
      setTimeout(() => setIsTremorActive(false), 650);
    } else if (event.type === 'ALL_DONE') {
      setIsTremorActive(true);
      setIsFiringBeam(true);
      setAtomicEnergy(100);
      setTimeout(() => {
        setIsTremorActive(false);
        setIsAllOutAttackOpen(true);
      }, 500);
    }
  };

  const handleRewardEnergy = (amount, reason) => {
    setAtomicEnergy((prev) => Math.min(100, prev + amount));
    setRecentTaskEvent({
      type: 'ENERGY_REWARDED',
      title: reason || `+${amount}% Atomic Energy`
    });
  };

  const handleTriggerAtomicPulse = () => {
    setIsTremorActive(true);
    setIsFiringBeam(true);
    setTimeout(() => setIsTremorActive(false), 800);
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
      <AnimatePresence>
        {!isWeek && (
          <DaysUntilBanner
            currentDate={currentDate}
            availableTasks={availableTasks}
            isCalendarOpen={isWeek}
          />
        )}
      </AnimatePresence>

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

      {/* Bottom Left: Interactive Persona Mascot (Joker) with animated stopwatch & Chrono dive */}
      <PersonaMascot
        recentEvent={recentTaskEvent}
        onOpenPocketWatch={() => setIsPocketWatchOpen(true)}
        onTriggerRoar={() => {
          setIsTremorActive(true);
          setIsFiringBeam(true);
          setTimeout(() => setIsTremorActive(false), 650);
        }}
      />

      {/* Bottom Right: "Take Your Time" Hat & Logo with SFX and Beam trigger */}
      <TakeYourTime onTriggerBeam={handleTriggerBeam} />

      {/* ⚡ Tactical Bottom Command Dock & Lo-Fi Cassette Radio */}
      <BottomCommandDock
        onOpenPomodoro={() => setIsPomodoroOpen(true)}
        onOpenConfidants={() => setIsConfidantsOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenEvolution={() => setIsEvolutionOpen(true)}
        streakDays={streakDays}
      />

      {/* ⏳ Palace Infiltration Pomodoro Timer */}
      <PalacePomodoroModal
        isOpen={isPomodoroOpen}
        onClose={() => setIsPomodoroOpen(false)}
        onRewardEnergy={handleRewardEnergy}
      />

      {/* 👥 Phantom Thieves Confidants / Social Links Drawer */}
      <ConfidantsDrawer
        isOpen={isConfidantsOpen}
        onClose={() => setIsConfidantsOpen(false)}
        activeConfidantId={activeConfidantId}
        onActiveConfidantChange={setActiveConfidantId}
      />

      {/* 📊 5-Axis Phantom Thief Stats Pentagon Radar */}
      <ThiefStatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        tasks={availableTasks}
      />

      {/* 🦖 Shin Godzilla Mutation & Evolution Streak Modal */}
      <GodzillaEvolutionWidget
        isOpen={isEvolutionOpen}
        onClose={() => setIsEvolutionOpen(false)}
        streakDays={streakDays}
        atomicEnergy={atomicEnergy}
        onTriggerAtomicPulse={handleTriggerAtomicPulse}
      />

      {/* 💥 All-Out Attack Cinematic Finisher Cut-in */}
      <AllOutAttackCutin
        isOpen={isAllOutAttackOpen}
        onClose={() => setIsAllOutAttackOpen(false)}
        tasksClearedCount={availableTasks.filter((t) => t.isComplete).length || 5}
      />

      {/* ⏱️ Persona 5 Over-The-Shoulder Chrono Pocket Watch Menu */}
      <PocketWatchMenu
        isOpen={isPocketWatchOpen}
        onClose={() => setIsPocketWatchOpen(false)}
        onOpenPomodoro={() => setIsPomodoroOpen(true)}
        onOpenBoredom={() => setIsBoredomOpen(true)}
        onToggleRadio={() => {
          sounds.playClick();
          lofiPlayer.toggle();
        }}
        onOpenConfidants={() => setIsConfidantsOpen(true)}
        onOpenEvolution={() => setIsEvolutionOpen(true)}
      />
    </div>
  );
}

export default App;
