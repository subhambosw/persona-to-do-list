import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { lofiPlayer } from '../../utils/lofiPlayer.js';
import { sounds } from '../../utils/audio.js';
import {
  Radio,
  Timer,
  Users,
  BarChart3,
  Flame,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  CloudRain,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import './BottomCommandDock.css';

const BottomCommandDock = ({
  onOpenPomodoro,
  onOpenConfidants,
  onOpenStats,
  onOpenEvolution,
  streakDays = 5,
  currentFormName = 'FORM 4: KAMAKURA TITAN'
}) => {
  const [isRadioOpen, setIsRadioOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(() => lofiPlayer.getCurrentTrack());
  const [isRainOn, setIsRainOn] = useState(true);
  const [volume, setVolume] = useState(0.5);

  const togglePlay = () => {
    sounds.playClick();
    const playing = lofiPlayer.toggle();
    setIsPlaying(playing);
  };

  const handleNext = () => {
    sounds.playClick();
    const track = lofiPlayer.nextTrack();
    setCurrentTrack(track);
  };

  const handlePrev = () => {
    sounds.playClick();
    const track = lofiPlayer.prevTrack();
    setCurrentTrack(track);
  };

  const handleToggleRain = () => {
    sounds.playClick();
    const rain = lofiPlayer.toggleRain();
    setIsRainOn(rain);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    lofiPlayer.setVolume(val);
  };

  return (
    <div className="bottom-command-dock-root">
      {/* Expandable Cassette Radio Deck */}
      <AnimatePresence>
        {isRadioOpen && (
          <motion.div
            className="lofi-cassette-deck"
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 25 }}
          >
            <div className="cassette-top-row">
              <span className="deck-tag">PHANTOM CASSETTE // STEREO TYPE-II</span>
              <button
                type="button"
                className="deck-close-btn"
                onClick={() => {
                  sounds.playClick();
                  setIsRadioOpen(false);
                }}
              >
                <X size={14} />
              </button>
            </div>

            <div className="cassette-body">
              {/* Dual Spinning Tape Spools */}
              <div className="tape-window">
                <div className={`tape-spool ${isPlaying ? 'spinning' : ''}`} />
                <div className="tape-label-center">
                  <span className="track-title-ticker">{currentTrack.title}</span>
                </div>
                <div className={`tape-spool ${isPlaying ? 'spinning' : ''}`} />
              </div>

              {/* Tape Deck Controls */}
              <div className="tape-controls-row">
                <button
                  type="button"
                  className="tape-ctrl-btn"
                  onClick={handlePrev}
                  title="Previous Track"
                >
                  <SkipBack size={15} />
                </button>

                <button
                  type="button"
                  className={`tape-ctrl-btn play-btn ${isPlaying ? 'is-playing' : ''}`}
                  onClick={togglePlay}
                  title={isPlaying ? "Pause BGM" : "Play Lo-Fi BGM"}
                >
                  {isPlaying ? <Pause size={17} /> : <Play size={17} />}
                </button>

                <button
                  type="button"
                  className="tape-ctrl-btn"
                  onClick={handleNext}
                  title="Next Track"
                >
                  <SkipForward size={15} />
                </button>

                {/* Tokyo Rain Ambiance Button */}
                <button
                  type="button"
                  className={`tape-ctrl-btn rain-btn ${isRainOn ? 'active' : ''}`}
                  onClick={handleToggleRain}
                  title="Toggle Tokyo Rain Sound FX"
                >
                  <CloudRain size={15} />
                  <span>RAIN</span>
                </button>

                {/* Volume Slider */}
                <div className="tape-vol-slider" title="BGM Volume">
                  {volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={handleVolumeChange}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Bottom Command Dock Ribbon */}
      <div className="bottom-dock-ribbon">
        {/* 1. Lo-Fi Radio Button */}
        <button
          type="button"
          className={`dock-action-pill ${isRadioOpen || isPlaying ? 'active-radio' : ''}`}
          onClick={() => {
            sounds.playClick();
            setIsRadioOpen(!isRadioOpen);
          }}
          title="Open Beneath the Mask Lo-Fi Radio Player"
        >
          <Radio size={16} />
          <span>{isPlaying ? '♪ LO-FI PLAYING' : 'LO-FI RADIO'}</span>
        </button>

        {/* 2. Palace Pomodoro Timer Button */}
        <button
          type="button"
          className="dock-action-pill"
          onClick={() => {
            sounds.playClick();
            if (onOpenPomodoro) onOpenPomodoro();
          }}
          title="Open Palace Infiltration Pomodoro Timer"
        >
          <Timer size={16} />
          <span>INFILTRATE [25M]</span>
        </button>

        {/* 3. Confidants & Social Links Button */}
        <button
          type="button"
          className="dock-action-pill"
          onClick={() => {
            sounds.playClick();
            if (onOpenConfidants) onOpenConfidants();
          }}
          title="View Phantom Thieves Confidants and Ranks"
        >
          <Users size={16} />
          <span>CONFIDANTS</span>
        </button>

        {/* 4. Thief Stats Radar Button */}
        <button
          type="button"
          className="dock-action-pill"
          onClick={() => {
            sounds.playClick();
            if (onOpenStats) onOpenStats();
          }}
          title="View 5-Axis Phantom Thief RPG Stats Radar"
        >
          <BarChart3 size={16} />
          <span>THIEF STATS</span>
        </button>

        {/* 5. Shin Godzilla Evolution Button */}
        <button
          type="button"
          className="dock-action-pill evolution-pill"
          onClick={() => {
            sounds.playClick();
            if (onOpenEvolution) onOpenEvolution();
          }}
          title="View Shin Godzilla Evolution Form and Streak"
        >
          <Flame size={16} />
          <span>{streakDays}D STREAK ★</span>
        </button>
      </div>
    </div>
  );
};

export default BottomCommandDock;
