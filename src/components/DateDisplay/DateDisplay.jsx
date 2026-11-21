import React from 'react';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { sounds } from '../../utils/audio.js';
import './DateDisplay.css';

const DateDisplay = ({ currentDate, onToggleWeek, onPrevDay, onNextDay, onGoToToday }) => {
  const date = dayjs(currentDate);
  const day = date.date();
  const month = date.month() + 1;
  const hour = date.hour();
  const dayAbbr = date.format('ddd').toLowerCase();

  let timeOfDayText = 'Morning';
  let isNight = false;
  if (hour >= 5 && hour < 12) timeOfDayText = 'Morning';
  else if (hour >= 12 && hour < 17) timeOfDayText = 'Afternoon';
  else if (hour >= 17 && hour < 21) timeOfDayText = 'Evening';
  else {
    timeOfDayText = 'Nighttime';
    isNight = true;
  }

  const weatherIcon = isNight ? '/moon.png' : '/sun.png';

  const handleArrow = (callback) => {
    sounds.playClick();
    callback();
  };

  const handleToggle = () => {
    sounds.playClick();
    onToggleWeek();
  };

  return (
    <div className="date-display-wrapper">
      <div className="date-canvas-box" onClick={handleToggle} title="Click to view weekly calendar!">
        <svg viewBox="0 0 500 500" className="date-svg">
          <defs>
            {/* Shin Godzilla Atomic Glow Filter */}
            <filter id="atomic-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c026d3" />
              <stop offset="50%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#581c87" />
            </linearGradient>

            <linearGradient id="neonLaser" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#e879f9" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          {/* Group translated matching original Persona 5 canvas (45, -30) */}
          <g transform="translate(45, -30)">
            {/* White/Glowing backdrop polygons */}
            <polygon
              points="38,310 149,244 161,257 60,340"
              fill="#ffffff"
              stroke="#d946ef"
              strokeWidth="6"
            />
            <polygon
              points="60,324 160,245 170,256 87,340"
              fill="#ffffff"
              stroke="#9d00ff"
              strokeWidth="4"
            />
            <polygon
              points="186,180 271,172 260,323 210,329"
              fill="#ffffff"
              stroke="#c026d3"
              strokeWidth="5"
            />
            <polygon
              points="113,214 200,224 189,272 95,265"
              fill="#ffffff"
              stroke="#ffffff"
              strokeWidth="3"
            />

            {/* Rotated background square for the weather icon */}
            <g transform="rotate(-20.3 215 260)">
              <rect
                x="215"
                y="260"
                width="118"
                height="118"
                fill="#170428"
                stroke="#c026d3"
                strokeWidth="4"
                rx="6"
              />
              {/* Weather icon inside */}
              <image
                href={weatherIcon}
                x="234"
                y="279"
                width="80"
                height="80"
                preserveAspectRatio="xMidYMid meet"
                style={{ filter: isNight ? 'drop-shadow(0 0 10px #e879f9)' : 'drop-shadow(0 0 12px #ffe600)' }}
              />
            </g>

            {/* Inner Dark Persona Quads */}
            <polygon points="38,310 149,244 161,257 60,340" fill="#0b0213" />
            <polygon points="55,324 160,245 170,256 87,340" fill="#12041e" />
            <polygon points="186,180 271,172 260,323 210,329" fill="#0b0213" />
            {month >= 10 ? (
              <polygon points="30,214 200,224 189,272 50,310" fill="#000000" />
            ) : month === 7 ? (
              <polygon points="50,214 200,224 189,272 80,300" fill="#000000" />
            ) : (
              <polygon points="95,214 200,224 189,272 80,300" fill="#000000" />
            )}

            {/* Month Slash Accent */}
            <polygon points="67,304 134,261 138,267 72,313" fill="#e879f9" />

            {/* Time of Day text (Slanted) */}
            <g transform="rotate(-23.6 160 120)">
              <text
                x="80"
                y="90"
                textAnchor="middle"
                fontFamily="PersonaHelvetica, Bebas Neue, sans-serif"
                fontSize="38"
                fontWeight="900"
                letterSpacing="4"
                fill="#ffffff"
                stroke="#0b0213"
                strokeWidth="6"
                paintOrder="stroke fill"
                style={{ textTransform: 'uppercase' }}
              >
                {timeOfDayText}
              </text>
            </g>

            {/* Month Number */}
            <g transform="translate(0, 40)">
              <text
                x="130"
                y="210"
                textAnchor="center"
                fontFamily="PersonaBodoni, Times New Roman, serif"
                fontSize="120"
                fontWeight="bold"
                fill="#ffffff"
                stroke="#0b0213"
                strokeWidth="12"
                paintOrder="stroke fill"
                transform="rotate(4.9 130 210) skewX(-8.3)"
              >
                {month}
              </text>
            </g>

            {/* Day Number */}
            <g transform="scale(0.85 1)">
              {day < 10 ? (
                <text
                  x="280"
                  y="215"
                  textAnchor="center"
                  fontFamily="PersonaHelvetica, Luckiest Guy, sans-serif"
                  fontSize="150"
                  fontWeight="bold"
                  fill="#ffffff"
                  stroke="#9d00ff"
                  strokeWidth="8"
                  paintOrder="stroke fill"
                  transform="rotate(3.6 280 215)"
                >
                  {day}
                </text>
              ) : (
                <>
                  <text
                    x="215"
                    y="240"
                    textAnchor="center"
                    fontFamily="PersonaHelvetica, Luckiest Guy, sans-serif"
                    fontSize="140"
                    fontWeight="bold"
                    fill="#ffffff"
                    stroke="#9d00ff"
                    strokeWidth="8"
                    paintOrder="stroke fill"
                    transform="rotate(-5.6 215 240)"
                  >
                    {Math.floor(day / 10)}
                  </text>
                  <text
                    x="355"
                    y="200"
                    textAnchor="center"
                    fontFamily="PersonaHelvetica, Luckiest Guy, sans-serif"
                    fontSize="140"
                    fontWeight="bold"
                    fill="#ffffff"
                    stroke="#d946ef"
                    strokeWidth="8"
                    paintOrder="stroke fill"
                    transform="rotate(3.6 355 200)"
                  >
                    {day % 10}
                  </text>
                </>
              )}
            </g>
          </g>
        </svg>
      </div>

      {/* Day of Week Pill */}
      <motion.div
        className="day-of-week-pill"
        onClick={handleToggle}
        whileHover={{ scale: 1.15, rotate: -6 }}
        whileTap={{ scale: 0.95 }}
      >
        <img
          src={`/days/${dayAbbr}.png`}
          alt={dayAbbr}
          className="day-img"
          style={{ filter: 'hue-rotate(270deg) brightness(1.2)' }}
        />
      </motion.div>

      {/* Navigation Arrows */}
      <div className="date-nav-controls">
        <button
          type="button"
          className="nav-arrow-btn"
          onClick={() => handleArrow(onPrevDay)}
          title="Previous Day"
        >
          <img src="/arrowLeft.png" alt="Prev" className="nav-arrow-img" />
        </button>

        {!date.isSame(dayjs(), 'day') && onGoToToday && (
          <button
            type="button"
            className="nav-today-btn"
            onClick={onGoToToday}
            title="Return back to Today"
          >
            ⮌ TODAY
          </button>
        )}

        <button
          type="button"
          className="nav-arrow-btn"
          onClick={() => handleArrow(onNextDay)}
          title="Next Day"
        >
          <img src="/arrowRight.png" alt="Next" className="nav-arrow-img" />
        </button>
      </div>
    </div>
  );
};

export default DateDisplay;
