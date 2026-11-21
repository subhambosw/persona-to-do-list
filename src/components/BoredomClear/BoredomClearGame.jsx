import React, { useRef, useEffect, useState } from 'react';
import { sounds } from '../../utils/audio.js';
import { Gamepad2, Flame, ArrowUp, ArrowDown, RefreshCw, Moon, Sun } from 'lucide-react';
import './BoredomClearGame.css';

const HIGH_SCORE_KEY = 'boredom_clear_high_score';

const BoredomClearGame = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('PLAYING'); // 'PLAYING', 'GAMEOVER'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '5705', 10);
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hp, setHp] = useState(10);
  const [specialEnergy, setSpecialEnergy] = useState(50);
  const [laserReady, setLaserReady] = useState(false);

  const gameRef = useRef({
    score: 0,
    hp: 10,
    specialEnergy: 50,
    isFiringLaser: false,
    laserTimer: 0,
    speed: 6.0,
    tick: 0,
    legFrame: 1, // 1 or 2
    godzilla: {
      x: 60,
      y: 200,
      vy: 0,
      width: 80,
      height: 55,
      isGrounded: true,
      isDucking: false
    },
    groundY: 255,
    groundDots: [],
    clouds: [],
    obstacles: [],
    particles: [],
    sprites: {
      run1: null,
      run2: null,
      idle: null,
      tank: null,
      pterodactyl: null,
      cactus: null
    },
    lastObstacleSpawn: 0,
    lastMilestone: 0
  });

  // Preload sprites
  useEffect(() => {
    const loadSprite = (src) => {
      const img = new Image();
      img.src = src;
      return img;
    };
    gameRef.current.sprites.run1 = loadSprite('/godzilla_dino_run1.png');
    gameRef.current.sprites.run2 = loadSprite('/godzilla_dino_run2.png');
    gameRef.current.sprites.idle = loadSprite('/godzilla_dino_idle.png');
    gameRef.current.sprites.tank = loadSprite('/dino_tank.png');
    gameRef.current.sprites.pterodactyl = loadSprite('/dino_pterodactyl.png');
    gameRef.current.sprites.cactus = loadSprite('/dino_cactus.png');
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationId;
    let running = true;

    const game = gameRef.current;
    game.score = 0;
    game.hp = 10;
    game.specialEnergy = 50;
    game.speed = 6.0;
    game.tick = 0;
    game.obstacles = [];
    game.particles = [];
    game.godzilla.y = 200;
    game.godzilla.vy = 0;
    game.godzilla.isGrounded = true;
    game.godzilla.isDucking = false;
    game.isFiringLaser = false;

    // Initialize ground dots
    game.groundDots = [];
    for (let i = 0; i < 840; i += 18) {
      if (Math.random() > 0.4) {
        game.groundDots.push({ x: i, y: game.groundY + Math.floor(Math.random() * 8) + 2, len: Math.random() > 0.5 ? 4 : 2 });
      }
    }

    // Initialize clouds
    game.clouds = [
      { x: 150, y: 55, speed: 0.6 },
      { x: 420, y: 75, speed: 0.8 },
      { x: 680, y: 45, speed: 0.5 }
    ];

    // Keyboard controls (Chrome Dino standard)
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        jump();
      } else if (e.code === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        duck(true);
      } else if (e.key === 'f' || e.key === 'F' || e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        fireLaser();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        // Variable jump height: release early to shorten jump arc
        if (game.godzilla.vy < -4) {
          game.godzilla.vy = -4;
        }
      } else if (e.code === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        duck(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const jump = () => {
      if (game.godzilla.isGrounded) {
        game.godzilla.vy = -12.5;
        game.godzilla.isGrounded = false;
        sounds.playClick();
      }
    };

    const duck = (isDown) => {
      if (isDown) {
        if (!game.godzilla.isGrounded) {
          // Fast drop to ground
          game.godzilla.vy += 2.5;
        }
        game.godzilla.isDucking = true;
      } else {
        game.godzilla.isDucking = false;
      }
    };

    const fireLaser = () => {
      if (game.specialEnergy >= 50 && !game.isFiringLaser) {
        game.isFiringLaser = true;
        game.laserTimer = 50; // ~0.8s
        game.specialEnergy = 0;
        setSpecialEnergy(0);
        setLaserReady(false);
        sounds.playGodzillaRoar();
        sounds.playAtomicBlast();

        // Obliterate ground and air obstacles in front
        game.obstacles.forEach((obs) => {
          if (obs.x > game.godzilla.x) {
            spawnExplosion(obs.x + obs.w / 2, obs.y + obs.h / 2);
          }
        });
        game.obstacles = game.obstacles.filter((obs) => obs.x <= game.godzilla.x);
        game.score += 250;
      }
    };

    const spawnExplosion = (x, y) => {
      for (let i = 0; i < 18; i++) {
        game.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 9,
          vy: (Math.random() - 0.5) * 9,
          color: Math.random() > 0.5 ? '#ffe600' : '#c026d3',
          life: 28,
          size: Math.random() * 4 + 2
        });
      }
    };

    // Main 60 FPS Game Loop
    let lastTime = performance.now();

    const loop = (currentTime) => {
      if (!running) return;
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      game.tick++;

      // 1. UPDATE STATE
      game.score += 1;
      setScore(game.score);
      game.speed = 6.0 + Math.min(game.score / 600, 8);

      // Chrome Dino milestone chime every 100 points
      if (game.score - game.lastMilestone >= 100) {
        game.lastMilestone = Math.floor(game.score / 100) * 100;
        sounds.playClick();
      }

      // Charge Special Atomic Laser over time
      if (game.specialEnergy < 100) {
        game.specialEnergy += 0.08;
        setSpecialEnergy(Math.floor(game.specialEnergy));
        if (game.specialEnergy >= 50) {
          setLaserReady(true);
        }
      }

      // Laser duration countdown
      if (game.isFiringLaser) {
        game.laserTimer--;
        if (game.laserTimer <= 0) {
          game.isFiringLaser = false;
        }
      }

      // 🏃 LEG RUNNING ANIMATION: Alternates run1 and run2 every 6 frames while grounded!
      if (game.godzilla.isGrounded && game.tick % 6 === 0) {
        game.legFrame = game.legFrame === 1 ? 2 : 1;
      }

      // Godzilla Physics
      game.godzilla.y += game.godzilla.vy;
      game.godzilla.vy += 0.65; // gravity
      const groundLimit = 200;
      if (game.godzilla.y >= groundLimit) {
        game.godzilla.y = groundLimit;
        game.godzilla.vy = 0;
        game.godzilla.isGrounded = true;
      }

      // Clouds movement
      game.clouds.forEach((cloud) => {
        cloud.x -= cloud.speed;
        if (cloud.x < -60) cloud.x = 880;
      });

      // Ground Dots scrolling
      game.groundDots.forEach((dot) => {
        dot.x -= game.speed;
        if (dot.x < -10) {
          dot.x = 840 + Math.random() * 20;
          dot.y = game.groundY + Math.floor(Math.random() * 8) + 2;
        }
      });

      // Spawn Obstacles (Tanks, Cacti, Flying Pterodactyls directly from Image 1!)
      if (currentTime - game.lastObstacleSpawn > 1300 + Math.random() * 1200) {
        const rand = Math.random();
        let obsType = 'CACTUS';
        let y = game.groundY - 25;
        let w = 24;
        let h = 28;

        if (rand > 0.65) {
          // Tank from Image 1!
          obsType = 'TANK';
          w = 46;
          h = 28;
          y = game.groundY - 26;
        } else if (rand > 0.4) {
          // Flying Pterodactyl in the air!
          obsType = 'PTERO';
          w = 28;
          h = 20;
          // Altitudes: high (jump safe), mid (must duck!), low (must jump!)
          const alt = Math.random();
          y = alt > 0.6 ? 160 : alt > 0.3 ? 190 : 215;
        }

        game.obstacles.push({
          x: 860,
          y,
          w,
          h,
          type: obsType,
          wingTick: 0
        });
        game.lastObstacleSpawn = currentTime;
      }

      // Update Obstacles & Collision Detection
      for (let i = game.obstacles.length - 1; i >= 0; i--) {
        const obs = game.obstacles[i];
        obs.x -= game.speed;
        obs.wingTick = (obs.wingTick + 1) % 16;

        // Collision box for Godzilla (adjusted for ducking)
        const gBox = {
          x: game.godzilla.x + 12,
          y: game.godzilla.isDucking ? game.godzilla.y + 20 : game.godzilla.y + 6,
          w: game.godzilla.width - 24,
          h: game.godzilla.isDucking ? game.godzilla.height - 22 : game.godzilla.height - 12
        };

        if (
          !game.isFiringLaser &&
          obs.x < gBox.x + gBox.w &&
          obs.x + obs.w > gBox.x &&
          obs.y < gBox.y + gBox.h &&
          obs.y + obs.h > gBox.y
        ) {
          // Collision occurred!
          spawnExplosion(obs.x + obs.w / 2, obs.y + obs.h / 2);
          game.obstacles.splice(i, 1);
          game.hp -= 1;
          setHp(game.hp);
          sounds.playSlash();

          if (game.hp <= 0) {
            sounds.playGodzillaRoar();
            setGameState('GAMEOVER');
            if (game.score > highScore) {
              setHighScore(game.score);
              localStorage.setItem(HIGH_SCORE_KEY, game.score.toString());
            }
            return;
          }
          continue;
        }

        if (obs.x < -60) {
          game.obstacles.splice(i, 1);
        }
      }

      // Update Particles
      for (let i = game.particles.length - 1; i >= 0; i--) {
        const p = game.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        if (p.life <= 0) {
          game.particles.splice(i, 1);
        }
      }

      // 2. RENDER (Exact Chrome Dino Godzilla Game from Image 1!)
      ctx.fillStyle = isDarkMode ? '#0d041c' : '#ffffff';
      ctx.fillRect(0, 0, 840, 340);

      // Render Clouds
      ctx.fillStyle = isDarkMode ? '#2d144e' : '#dcdcdc';
      game.clouds.forEach((cloud) => {
        ctx.fillRect(cloud.x, cloud.y, 40, 10);
        ctx.fillRect(cloud.x + 8, cloud.y - 6, 24, 6);
      });

      // Ground Line (Chrome Dino style horizon)
      ctx.strokeStyle = isDarkMode ? '#a855f7' : '#535353';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, game.groundY);
      ctx.lineTo(840, game.groundY);
      ctx.stroke();

      // Ground Dots
      ctx.fillStyle = isDarkMode ? '#d946ef' : '#777777';
      game.groundDots.forEach((dot) => {
        ctx.fillRect(dot.x, dot.y, dot.len, 1.5);
      });

      // Render Obstacles (Tanks, Cacti, Pterodactyls directly from Image 1!)
      game.obstacles.forEach((obs) => {
        if (obs.type === 'TANK' && game.sprites.tank && game.sprites.tank.complete) {
          ctx.drawImage(game.sprites.tank, obs.x, obs.y, obs.w, obs.h);
        } else if (obs.type === 'PTERO' && game.sprites.pterodactyl && game.sprites.pterodactyl.complete) {
          // Flapping wings
          const wingOffset = obs.wingTick > 8 ? 2 : -2;
          ctx.drawImage(game.sprites.pterodactyl, obs.x, obs.y + wingOffset, obs.w, obs.h);
        } else if (game.sprites.cactus && game.sprites.cactus.complete) {
          ctx.drawImage(game.sprites.cactus, obs.x, obs.y, obs.w, obs.h);
        } else {
          ctx.fillStyle = '#535353';
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        }
      });

      // Render Godzilla Player with MOVING LEGS!
      let playerSprite = game.sprites.idle;
      if (game.godzilla.isGrounded) {
        playerSprite = game.legFrame === 1 ? game.sprites.run1 : game.sprites.run2;
      }

      if (playerSprite && playerSprite.complete) {
        const renderHeight = game.godzilla.isDucking ? game.godzilla.height * 0.75 : game.godzilla.height;
        const renderY = game.godzilla.isDucking ? game.godzilla.y + (game.godzilla.height * 0.25) : game.godzilla.y;
        ctx.drawImage(playerSprite, game.godzilla.x, renderY, game.godzilla.width, renderHeight);
      } else {
        ctx.fillStyle = '#535353';
        ctx.fillRect(game.godzilla.x, game.godzilla.y, game.godzilla.width, game.godzilla.height);
      }

      // Render Searing Diagonal Atomic Breath Laser Beam (Matching Image 1!)
      if (game.isFiringLaser) {
        const mouthX = game.godzilla.x + game.godzilla.width - 2;
        const mouthY = game.godzilla.y + 12;

        ctx.save();
        ctx.shadowColor = '#e879f9';
        ctx.shadowBlur = 20;

        // Outer Dark/Violet Beam (slanting downward toward the ground ahead, just like Image 1!)
        ctx.strokeStyle = isDarkMode ? '#9d00ff' : '#2b2b2b';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(mouthX, mouthY);
        ctx.lineTo(mouthX + 380, game.groundY + 8);
        ctx.stroke();

        // Inner White-Hot Laser Core
        ctx.strokeStyle = isDarkMode ? '#ffffff' : '#d946ef';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(mouthX, mouthY);
        ctx.lineTo(mouthX + 380, game.groundY + 8);
        ctx.stroke();

        ctx.restore();
      }

      // Render Particles
      game.particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });

      // Render Top HUD (Exact from Image 1!)
      ctx.fillStyle = isDarkMode ? '#ffffff' : '#535353';
      ctx.font = 'bold 18px "Bebas Neue", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(
        `HI ${String(highScore).padStart(5, '0')}  ${String(game.score).padStart(5, '0')}`,
        815,
        28
      );
      ctx.fillText(`GODZILLA x${game.hp}`, 815, 50);

      // HP Bar (from Image 1)
      ctx.fillStyle = isDarkMode ? '#222' : '#e0e0e0';
      ctx.fillRect(720, 58, 95, 9);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(720, 58, (game.hp / 10) * 95, 9);
      ctx.fillStyle = isDarkMode ? '#aaa' : '#777';
      ctx.font = '10px sans-serif';
      ctx.fillText('HP', 712, 66);

      // Special Bar (from Image 1)
      ctx.fillStyle = isDarkMode ? '#222' : '#e0e0e0';
      ctx.fillRect(720, 72, 95, 9);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(720, 72, (game.specialEnergy / 100) * 95, 9);
      ctx.fillStyle = isDarkMode ? '#aaa' : '#777';
      ctx.fillText('Special', 712, 80);

      // "LASER READY!!!" Prompt (Exact from Image 1!)
      if (game.specialEnergy >= 50) {
        ctx.textAlign = 'center';
        ctx.fillStyle = isDarkMode ? '#ffe600' : '#444444';
        ctx.font = 'italic bold 22px "Bebas Neue", "Luckiest Guy", sans-serif';
        ctx.fillText('LASER READY!!!', 420, 48);
      }

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, highScore, isDarkMode]);

  const handleRestart = () => {
    sounds.playClick();
    setHp(10);
    setGameState('PLAYING');
  };

  const handleTriggerLaserButton = () => {
    const game = gameRef.current;
    if (game.specialEnergy >= 50 && !game.isFiringLaser) {
      game.isFiringLaser = true;
      game.laserTimer = 50;
      game.specialEnergy = 0;
      setSpecialEnergy(0);
      setLaserReady(false);
      sounds.playGodzillaRoar();
      sounds.playAtomicBlast();
      game.obstacles.forEach((obs) => {
        if (obs.x > game.godzilla.x) {
          game.score += 200;
        }
      });
      game.obstacles = [];
    }
  };

  const handleTriggerJumpButton = () => {
    const game = gameRef.current;
    if (game.godzilla.isGrounded) {
      game.godzilla.vy = -12.5;
      game.godzilla.isGrounded = false;
      sounds.playClick();
    }
  };

  const handleTriggerDuckButton = (isDown) => {
    const game = gameRef.current;
    game.godzilla.isDucking = isDown;
  };

  return (
    <div className="boredom-modal-overlay" onClick={onClose}>
      <div className={`boredom-game-cabinet ${isDarkMode ? 'dark-mode' : ''}`} onClick={(e) => e.stopPropagation()}>
        {/* Arcade Cabinet Header */}
        <div className="cabinet-header">
          <h2 className="cabinet-title">
            <Gamepad2 size={26} color="#9d00ff" />
            <span>GODZILLA DINO RUNNER // BOREDOM CLEAR</span>
          </h2>

          <div className="cabinet-header-actions">
            <button
              type="button"
              className="mode-toggle-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="Toggle Day / Night Mode"
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
              <span>{isDarkMode ? 'DAY MODE' : 'NIGHT MODE'}</span>
            </button>

            <button type="button" className="cabinet-close-btn" onClick={onClose}>
              ✕ EXIT
            </button>
          </div>
        </div>

        {/* Canvas Screen */}
        <div className="game-canvas-wrapper">
          <canvas
            ref={canvasRef}
            width={840}
            height={340}
            className="game-canvas"
            onClick={handleTriggerJumpButton}
          />

          {/* Game Over Screen */}
          {gameState === 'GAMEOVER' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              <h1
                style={{
                  fontFamily: 'Luckiest Guy',
                  fontSize: '3.2rem',
                  color: '#fc1600',
                  margin: '0 0 0.5rem 0',
                  textShadow: '-3px 3px 0 #000000, 0 0 20px #fc1600'
                }}
              >
                GAME OVER!
              </h1>
              <p
                style={{
                  fontFamily: 'Bebas Neue',
                  fontSize: '1.4rem',
                  color: '#ffffff',
                  letterSpacing: '0.1em',
                  margin: '0 0 1.4rem 0'
                }}
              >
                SCORE: {score} | ALL-TIME HIGH: {highScore}
              </p>
              <button
                type="button"
                className="arcade-action-btn jump-btn"
                onClick={handleRestart}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.3rem' }}
              >
                <RefreshCw size={18} />
                <span>PLAY AGAIN</span>
              </button>
            </div>
          )}
        </div>

        {/* Arcade Controls Bar */}
        <div className="arcade-controls-bar">
          <div className="control-tips">
            <span>
              <span className="control-key">SPACE / ↑</span> JUMP
            </span>
            <span>
              <span className="control-key">↓</span> DUCK
            </span>
            <span>
              <span className="control-key">F / Z</span> ATOMIC BEAM
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.7rem' }}>
            <button
              type="button"
              className="arcade-action-btn jump-btn"
              onClick={handleTriggerJumpButton}
            >
              <ArrowUp size={16} /> JUMP
            </button>
            <button
              type="button"
              className="arcade-action-btn duck-btn"
              onMouseDown={() => handleTriggerDuckButton(true)}
              onMouseUp={() => handleTriggerDuckButton(false)}
              onTouchStart={() => handleTriggerDuckButton(true)}
              onTouchEnd={() => handleTriggerDuckButton(false)}
            >
              <ArrowDown size={16} /> DUCK
            </button>
            <button
              type="button"
              className="arcade-action-btn fire-btn"
              onClick={handleTriggerLaserButton}
            >
              <Flame size={16} /> FIRE ATOMIC BEAM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoredomClearGame;
