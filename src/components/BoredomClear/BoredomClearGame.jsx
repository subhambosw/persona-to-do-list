import React, { useRef, useEffect, useState } from 'react';
import { sounds } from '../../utils/audio.js';
import { Gamepad2, Flame, ArrowUp, ArrowDown, RefreshCw, Palette, Sparkles, X } from 'lucide-react';
import './BoredomClearGame.css';

const HIGH_SCORE_KEY = 'boredom_clear_high_score';

const BoredomClearGame = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('PLAYING'); // 'PLAYING', 'GAMEOVER'
  const [score, setScore] = useState(0);
  const [dotsCount, setDotsCount] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '5705', 10);
  });
  // Theme variants: 'totm' (Tomb of the Mask Neon), 'godzilla' (Shin Godzilla Purple), 'mono' (Chrome Dino)
  const [theme, setTheme] = useState('totm');
  const [hp, setHp] = useState(10);
  const [specialEnergy, setSpecialEnergy] = useState(50);
  const [laserReady, setLaserReady] = useState(false);

  const gameRef = useRef({
    score: 0,
    dotsCount: 0,
    hp: 10,
    specialEnergy: 50,
    isFiringLaser: false,
    laserTimer: 0,
    speed: 6.0,
    tick: 0,
    legFrame: 1, // 1 or 2
    godzilla: {
      x: 60,
      y: 199,
      vy: 0,
      width: 74,
      height: 74,
      isGrounded: true,
      isDucking: false
    },
    groundY: 265,
    groundDots: [],
    collectibles: [], // Tomb of the Mask glowing neon dots/coins
    obstacles: [],
    particles: [],
    sprites: {
      run1: null,
      run2: null,
      jump: null,
      duck: null,
      fire: null,
      spikes: null,
      tank: null,
      bat1: null,
      bat2: null,
      dot: null,
      cactus: null
    },
    lastObstacleSpawn: 0,
    lastDotSpawn: 0,
    lastMilestone: 0
  });

  // Preload all sprites
  useEffect(() => {
    const base = import.meta.env.BASE_URL || './';
    const resolve = (p) => {
      const clean = p.startsWith('/') ? p.slice(1) : p;
      return base.endsWith('/') ? `${base}${clean}` : `${base}/${clean}`;
    };
    const loadSprite = (src) => {
      const img = new Image();
      img.src = resolve(src);
      return img;
    };
    gameRef.current.sprites.run1 = loadSprite('/godzilla_totm_run1.png');
    gameRef.current.sprites.run2 = loadSprite('/godzilla_totm_run2.png');
    gameRef.current.sprites.jump = loadSprite('/godzilla_totm_jump.png');
    gameRef.current.sprites.duck = loadSprite('/godzilla_totm_duck.png');
    gameRef.current.sprites.fire = loadSprite('/godzilla_totm_fire.png');
    gameRef.current.sprites.spikes = loadSprite('/totm_spikes.png');
    gameRef.current.sprites.tank = loadSprite('/totm_tank.png');
    gameRef.current.sprites.bat1 = loadSprite('/totm_bat1.png');
    gameRef.current.sprites.bat2 = loadSprite('/totm_bat2.png');
    gameRef.current.sprites.dot = loadSprite('/totm_dot.png');
    gameRef.current.sprites.cactus = loadSprite('/dino_cactus.png');
  }, []);

  // Main Game Loop Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationId;
    let running = true;

    const game = gameRef.current;
    game.score = 0;
    game.dotsCount = 0;
    game.hp = 10;
    game.specialEnergy = 50;
    game.speed = 3.6;
    game.tick = 0;
    game.obstacles = [];
    game.collectibles = [];
    game.particles = [];
    game.godzilla.y = 199;
    game.godzilla.vy = 0;
    game.godzilla.isGrounded = true;
    game.godzilla.isDucking = false;
    game.isFiringLaser = false;

    // Initialize ground decoration dots
    game.groundDots = [];
    for (let i = 0; i < 860; i += 20) {
      if (Math.random() > 0.4) {
        game.groundDots.push({
          x: i,
          y: game.groundY + Math.floor(Math.random() * 10) + 4,
          len: Math.random() > 0.5 ? 5 : 2
        });
      }
    }

    // Keyboard handlers (Chrome Dino standard + Tomb of the Mask)
    const handleKeyDown = (e) => {
      if (gameState === 'GAMEOVER') {
        if (e.code === 'Space' || e.key === 'r' || e.key === 'R') {
          handleRestart();
        }
        return;
      }

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        jump();
      } else if (e.code === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        duck(true);
      } else if (e.key === 'f' || e.key === 'F' || e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        fireLaser();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        // Variable jump height: release early to shorten jump arc (classic Chrome Dino)
        if (game.godzilla.vy < -4.5) {
          game.godzilla.vy = -4.5;
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
          // Fast drop in air
          game.godzilla.vy += 3.0;
        }
        game.godzilla.isDucking = true;
      } else {
        game.godzilla.isDucking = false;
      }
    };

    const fireLaser = () => {
      if (game.specialEnergy >= 50 && !game.isFiringLaser) {
        game.isFiringLaser = true;
        game.laserTimer = 55; // ~0.9s duration
        game.specialEnergy = 0;
        setSpecialEnergy(0);
        setLaserReady(false);
        sounds.playGodzillaRoar();
        sounds.playAtomicBlast();

        // Incinerate all obstacles in front into glowing neon particles!
        game.obstacles.forEach((obs) => {
          if (obs.x > game.godzilla.x) {
            spawnExplosion(obs.x + obs.w / 2, obs.y + obs.h / 2, '#00f0ff');
            game.score += 250;
          }
        });
        game.obstacles = game.obstacles.filter((obs) => obs.x <= game.godzilla.x);
      }
    };

    const spawnExplosion = (x, y, color = '#ffe600') => {
      for (let i = 0; i < 20; i++) {
        game.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 11,
          vy: (Math.random() - 0.5) * 11,
          color: Math.random() > 0.5 ? color : '#e879f9',
          life: 25,
          size: Math.random() * 4 + 2
        });
      }
    };

    let lastTime = performance.now();

    const loop = (currentTime) => {
      if (!running) return;
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      game.tick++;

      // 1. UPDATE STATE
      game.score += 1;
      setScore(game.score);
      // Progressive speed scaling (relaxed start, gradual arcade acceleration)
      game.speed = 3.6 + Math.min(game.score / 1500, 5.0);

      // Milestone chime every 100 points
      if (game.score - game.lastMilestone >= 100) {
        game.lastMilestone = Math.floor(game.score / 100) * 100;
        sounds.playClick();
      }

      // Charge Special Atomic Laser over time
      if (game.specialEnergy < 100) {
        game.specialEnergy += 0.07;
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

      // 🏃 LEG RUNNING ANIMATION: Alternates between run1 and run2 every 5 frames when grounded!
      if (game.godzilla.isGrounded && game.tick % 5 === 0) {
        game.legFrame = game.legFrame === 1 ? 2 : 1;
      }

      // Godzilla Physics
      game.godzilla.y += game.godzilla.vy;
      game.godzilla.vy += 0.68; // gravity
      const groundLimit = 199;
      if (game.godzilla.y >= groundLimit) {
        game.godzilla.y = groundLimit;
        game.godzilla.vy = 0;
        game.godzilla.isGrounded = true;
      }

      // Ground Dots scrolling
      game.groundDots.forEach((dot) => {
        dot.x -= game.speed;
        if (dot.x < -10) {
          dot.x = 860 + Math.random() * 20;
          dot.y = game.groundY + Math.floor(Math.random() * 10) + 4;
        }
      });

      // 🟡 SPAWN TOMB OF THE MASK COLLECTIBLE NEON DOTS
      if (currentTime - game.lastDotSpawn > 1800 + Math.random() * 1500) {
        const pattern = Math.random();
        const baseDotX = 860;

        if (pattern > 0.5) {
          // Horizontal trail of 4 dots along ground
          for (let d = 0; d < 4; d++) {
            game.collectibles.push({
              x: baseDotX + d * 26,
              y: game.groundY - 18,
              size: 8,
              collected: false
            });
          }
        } else {
          // Arc of dots inviting jump!
          const arcHeights = [game.groundY - 25, game.groundY - 60, game.groundY - 75, game.groundY - 60, game.groundY - 25];
          arcHeights.forEach((ay, idx) => {
            game.collectibles.push({
              x: baseDotX + idx * 28,
              y: ay,
              size: 8,
              collected: false
            });
          });
        }
        game.lastDotSpawn = currentTime;
      }

      // Update Collectibles & Collection Detection
      for (let i = game.collectibles.length - 1; i >= 0; i--) {
        const dot = game.collectibles[i];
        dot.x -= game.speed;

        // Player bounds
        const gBox = {
          x: game.godzilla.x + 8,
          y: game.godzilla.isDucking ? game.godzilla.y + 30 : game.godzilla.y + 10,
          w: game.godzilla.width - 16,
          h: game.godzilla.isDucking ? game.godzilla.height - 30 : game.godzilla.height - 10
        };

        if (
          !dot.collected &&
          dot.x < gBox.x + gBox.w &&
          dot.x + dot.size > gBox.x &&
          dot.y < gBox.y + gBox.h &&
          dot.y + dot.size > gBox.y
        ) {
          dot.collected = true;
          game.dotsCount += 1;
          setDotsCount(game.dotsCount);
          game.score += 15;
          game.specialEnergy = Math.min(100, game.specialEnergy + 3);
          setSpecialEnergy(Math.floor(game.specialEnergy));
          if (game.specialEnergy >= 50) setLaserReady(true);
          sounds.playDotChime();

          // Spark particle on collect
          for (let p = 0; p < 6; p++) {
            game.particles.push({
              x: dot.x,
              y: dot.y,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              color: '#ffe600',
              life: 14,
              size: 2
            });
          }
          game.collectibles.splice(i, 1);
          continue;
        }

        if (dot.x < -20) {
          game.collectibles.splice(i, 1);
        }
      }

      // ⚔️ SPAWN OBSTACLES (Tomb of the Mask Spikes, Cyber Tanks, 3-tier Flying Bats)
      const minObstacleDelay = Math.max(1200, 2200 - (game.speed - 3.6) * 180);
      if (currentTime - game.lastObstacleSpawn > minObstacleDelay + Math.random() * 1100) {
        const rand = Math.random();
        let obsType = 'SPIKES';
        let y = game.groundY - 26;
        let w = 36;
        let h = 26;

        if (rand > 0.65) {
          // Cyber Tank
          obsType = 'TANK';
          w = 46;
          h = 26;
          y = game.groundY - 25;
        } else if (rand > 0.35) {
          // Airborne Flying Bat/Pterodactyl at 3 distinct heights!
          obsType = 'BAT';
          w = 32;
          h = 22;
          const alt = Math.random();
          // High (155): run under safely; Mid (195): MUST DUCK!; Low (225): MUST JUMP!
          y = alt > 0.65 ? 155 : alt > 0.3 ? 195 : 225;
        } else {
          // Spikes cluster
          obsType = 'SPIKES';
          w = 36;
          h = 26;
          y = game.groundY - 26;
        }

        game.obstacles.push({
          x: 870,
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

        // Collision box for Godzilla (adjusted for ducking / jumping)
        const gBox = {
          x: game.godzilla.x + 14,
          y: game.godzilla.isDucking ? game.godzilla.y + 34 : game.godzilla.y + 12,
          w: game.godzilla.width - 24,
          h: game.godzilla.isDucking ? game.godzilla.height - 38 : game.godzilla.height - 18
        };

        if (
          !game.isFiringLaser &&
          obs.x < gBox.x + gBox.w &&
          obs.x + obs.w > gBox.x &&
          obs.y < gBox.y + gBox.h &&
          obs.y + obs.h > gBox.y
        ) {
          // Collision occurred!
          spawnExplosion(obs.x + obs.w / 2, obs.y + obs.h / 2, '#ff0055');
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

      // 2. RENDER (Tomb of the Mask × Chrome Dino Godzilla!)
      // Background styling
      if (theme === 'totm') {
        ctx.fillStyle = '#080112';
      } else if (theme === 'godzilla') {
        ctx.fillStyle = '#110424';
      } else {
        ctx.fillStyle = '#ffffff';
      }
      ctx.fillRect(0, 0, 840, 340);

      // Tomb of the Mask Neon Grid & Parallax Maze Columns
      if (theme !== 'mono') {
        ctx.save();
        ctx.strokeStyle = theme === 'totm' ? 'rgba(0, 240, 255, 0.08)' : 'rgba(168, 85, 247, 0.08)';
        ctx.lineWidth = 1;
        // Horizontal grid
        for (let gy = 40; gy < game.groundY; gy += 30) {
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.lineTo(840, gy);
          ctx.stroke();
        }
        // Vertical parallax columns
        const colShift = (game.score * 0.4) % 60;
        for (let gx = -colShift; gx < 840; gx += 60) {
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, game.groundY);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Glowing Ground Track (Tomb of the Mask style neon circuit)
      ctx.save();
      if (theme === 'totm') {
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#00f0ff';
      } else if (theme === 'godzilla') {
        ctx.shadowColor = '#c026d3';
        ctx.shadowBlur = 12;
        ctx.strokeStyle = '#c026d3';
      } else {
        ctx.strokeStyle = '#535353';
      }
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, game.groundY);
      ctx.lineTo(840, game.groundY);
      ctx.stroke();
      ctx.restore();

      // Ground pattern dots
      ctx.fillStyle = theme === 'totm' ? '#ffe600' : theme === 'godzilla' ? '#e879f9' : '#777777';
      game.groundDots.forEach((dot) => {
        ctx.fillRect(dot.x, dot.y, dot.len, 1.5);
      });

      // 🟡 Render Tomb of the Mask Glowing Dots / Pellets
      game.collectibles.forEach((dot) => {
        if (game.sprites.dot && game.sprites.dot.complete) {
          ctx.drawImage(game.sprites.dot, dot.x, dot.y, dot.size, dot.size);
        } else {
          ctx.fillStyle = '#ffe600';
          ctx.fillRect(dot.x, dot.y, dot.size, dot.size);
        }
      });

      // Render Obstacles (Tomb of the Mask Spikes, Cyber Tanks, Flying Bats)
      game.obstacles.forEach((obs) => {
        if (obs.type === 'SPIKES' && game.sprites.spikes && game.sprites.spikes.complete) {
          ctx.drawImage(game.sprites.spikes, obs.x, obs.y, obs.w, obs.h);
        } else if (obs.type === 'TANK' && game.sprites.tank && game.sprites.tank.complete) {
          ctx.drawImage(game.sprites.tank, obs.x, obs.y, obs.w, obs.h);
        } else if (obs.type === 'BAT') {
          // 2-frame flapping wings
          const batSprite = obs.wingTick > 8 ? game.sprites.bat2 : game.sprites.bat1;
          if (batSprite && batSprite.complete) {
            ctx.drawImage(batSprite, obs.x, obs.y, obs.w, obs.h);
          } else {
            ctx.fillStyle = '#00f0ff';
            ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
          }
        } else if (game.sprites.cactus && game.sprites.cactus.complete) {
          ctx.drawImage(game.sprites.cactus, obs.x, obs.y, obs.w, obs.h);
        } else {
          ctx.fillStyle = '#fc1600';
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        }
      });

      // 🦖 RENDER GODZILLA (Using user uploaded sprite at correct forward-facing angle!)
      let godzillaSprite = game.sprites.run1;
      let renderW = game.godzilla.width;
      let renderH = game.godzilla.height;
      let renderX = game.godzilla.x;
      let renderY = game.godzilla.y;

      if (game.isFiringLaser) {
        // Full atomic firing pose with mouth blast!
        godzillaSprite = game.sprites.fire;
      } else if (game.godzilla.isDucking) {
        // Ducking / Sliding pose
        godzillaSprite = game.sprites.duck;
        renderH = game.godzilla.height * 0.62;
        renderY = game.groundY - renderH + 4;
      } else if (!game.godzilla.isGrounded) {
        // Jump pose
        godzillaSprite = game.sprites.jump;
      } else {
        // Grounded: 2-frame running legs animation!
        godzillaSprite = game.legFrame === 1 ? game.sprites.run1 : game.sprites.run2;
      }

      if (godzillaSprite && godzillaSprite.complete) {
        ctx.drawImage(godzillaSprite, renderX, renderY, renderW, renderH);
      } else {
        ctx.fillStyle = '#9d00ff';
        ctx.fillRect(renderX, renderY, renderW, renderH);
      }

      // ⚡ RENDER CONTINUOUS SEARING ATOMIC BREATH LASER RAY
      if (game.isFiringLaser) {
        const mouthX = game.godzilla.x + 58;
        const mouthY = game.godzilla.y + 20;

        ctx.save();
        ctx.shadowColor = '#e879f9';
        ctx.shadowBlur = 24;

        // Outer Violet/Plasma Beam
        ctx.strokeStyle = '#c026d3';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(mouthX, mouthY);
        ctx.lineTo(840, mouthY + 10);
        ctx.stroke();

        // Inner White-Hot Laser Core
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(mouthX, mouthY);
        ctx.lineTo(840, mouthY + 10);
        ctx.stroke();

        // Ground secondary beam burn
        ctx.strokeStyle = '#ffe600';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(mouthX, mouthY);
        ctx.lineTo(mouthX + 380, game.groundY);
        ctx.stroke();

        ctx.restore();
      }

      // Render Particles
      game.particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });

      // 📊 RENDER TOMB OF THE MASK / ARCADE HUD
      ctx.textAlign = 'right';

      // HI SCORE & SCORE (Tomb of the Mask Neon Gold)
      ctx.fillStyle = theme === 'mono' ? '#535353' : '#ffe600';
      ctx.font = 'bold 18px "Bebas Neue", sans-serif';
      ctx.fillText(
        `HI ${String(highScore).padStart(5, '0')}   ${String(game.score).padStart(5, '0')}`,
        815,
        28
      );

      // DOTS COLLECTED COUNTER (Tomb of the Mask feature!)
      ctx.fillStyle = theme === 'mono' ? '#535353' : '#00f0ff';
      ctx.font = 'bold 16px "Bebas Neue", sans-serif';
      ctx.fillText(`🟡 DOTS: ${String(game.dotsCount).padStart(3, '0')}`, 815, 48);

      // HP Bar (Neon Green)
      ctx.fillStyle = '#222222';
      ctx.fillRect(720, 56, 95, 9);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(720, 56, (game.hp / 10) * 95, 9);
      ctx.fillStyle = theme === 'mono' ? '#777' : '#aaaaaa';
      ctx.font = '10px sans-serif';
      ctx.fillText('HP', 712, 64);

      // Special Energy Bar (Neon Violet)
      ctx.fillStyle = '#222222';
      ctx.fillRect(720, 70, 95, 9);
      ctx.fillStyle = '#c026d3';
      ctx.fillRect(720, 70, (game.specialEnergy / 100) * 95, 9);
      ctx.fillStyle = theme === 'mono' ? '#777' : '#aaaaaa';
      ctx.fillText('Special', 712, 78);

      // "LASER READY!!!" Prompt (Exact from User Reference!)
      if (game.specialEnergy >= 50) {
        ctx.textAlign = 'center';
        ctx.fillStyle = theme === 'mono' ? '#444' : '#ffe600';
        ctx.font = 'italic bold 22px "Bebas Neue", "Luckiest Guy", sans-serif';
        ctx.fillText('⚡ LASER READY!!! [PRESS F]', 420, 44);
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
  }, [gameState, highScore, theme]);

  const handleRestart = () => {
    sounds.playClick();
    setHp(10);
    setDotsCount(0);
    setGameState('PLAYING');
  };

  const handleTriggerLaserButton = () => {
    const game = gameRef.current;
    if (game.specialEnergy >= 50 && !game.isFiringLaser) {
      game.isFiringLaser = true;
      game.laserTimer = 55;
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

  const toggleTheme = () => {
    sounds.playClick();
    if (theme === 'totm') setTheme('godzilla');
    else if (theme === 'godzilla') setTheme('mono');
    else setTheme('totm');
  };

  return (
    <div className="boredom-modal-overlay" onClick={onClose}>
      <div className={`boredom-game-cabinet theme-${theme}`} onClick={(e) => e.stopPropagation()}>
        {/* Arcade Cabinet Header */}
        <div className="cabinet-header">
          <h2 className="cabinet-title">
            <Gamepad2 size={24} color="#ffe600" />
            <span>SHIN GODZILLA DINO RUNNER // TOMB OF THE MASK</span>
          </h2>

          <div className="cabinet-header-actions">
            <button
              type="button"
              className="mode-toggle-btn"
              onClick={toggleTheme}
              title="Switch Visual Style (Tomb of the Mask / Shin Godzilla / Classic Mono)"
            >
              <Palette size={14} />
              <span>
                {theme === 'totm'
                  ? 'TOMB OF THE MASK'
                  : theme === 'godzilla'
                  ? 'SHIN GODZILLA'
                  : 'MONO DINO'}
              </span>
            </button>

            <button type="button" className="cabinet-close-btn" onClick={onClose} title="Exit Game">
              <X size={16} />
              <span>EXIT</span>
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

          {/* CRT scanline effect */}
          <div className="crt-scanline-overlay" />

          {/* Game Over Screen */}
          {gameState === 'GAMEOVER' && (
            <div className="game-over-modal-backdrop">
              <h1 className="game-over-title">GAME OVER!</h1>
              <p className="game-over-stats">
                SCORE: {score} | DOTS: {dotsCount} | HIGH SCORE: {highScore}
              </p>
              <button
                type="button"
                className="arcade-action-btn jump-btn play-again-btn"
                onClick={handleRestart}
              >
                <RefreshCw size={18} />
                <span>PLAY AGAIN (SPACE)</span>
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
