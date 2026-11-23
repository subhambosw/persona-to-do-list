# DESIGN SYSTEM // PERSONA 5 × SHIN GODZILLA HUD

## 1. VISION & PHILOSOPHY
The **Persona 5 × Shin Godzilla HUD** is a high-voltage fusion of Atlus's iconic acid-jazz comic aesthetic (*Persona 5*) and Toho's apocalyptic biomorphic titan (*Shin Godzilla*). 

The interface trades flat, sterile SaaS minimalism for high-drama kinetic energy:
- **Asymmetrical Polygons:** Skewed containers, sharp diagonal cuts (`clip-path: polygon(...)`), and comic panel layouts.
- **Atomic Radiance:** Glowing radiation violet (`#9d00ff`, `#c026d3`) colliding with stark Persona crimson (`#e60012`) and electric Tokyo neon yellow (`#ffe600`).
- **Tactical Retro-Futurism:** Cassette-tape tactile controls, analog VU-meters, CRT halftone grain, and military Kaiju threat warning telemetry.

---

## 2. COLOR PALETTE & TOKENS

### Primary Brand & Theme Colors
| Token | Hex Value | Semantic Role |
| :--- | :--- | :--- |
| `--color-p5-red` | `#e60012` | Phantom Thieves signature crimson, urgency, attack execution |
| `--color-p5-red-hover` | `#ff1a35` | Interactive hover highlight for primary actions |
| `--color-godzilla-purple` | `#9d00ff` | Shin Godzilla dorsal fin radiation glow, primary borders |
| `--color-godzilla-neon` | `#c026d3` | Secondary bioluminescent accent, energetic pulse |
| `--color-tokyo-yellow` | `#ffe600` | High-contrast text highlights, rank stars, cassette spool accents |
| `--color-cyber-cyan` | `#00f0ff` | Velvet Room / Safe Room respite, knowledge metrics |
| `--color-obsidian-900` | `#080410` | Deep cosmic backdrop, comic shadow panels |
| `--color-obsidian-800` | `#120924` | Secondary panel backgrounds, modal containers |
| `--color-obsidian-700` | `#1c0e38` | Interactive cards, input fields, and tab states |
| `--color-text-primary` | `#ffffff` | Pure white typography with heavy dropshadows |
| `--color-text-secondary` | `#c4b5fd` | Violet tinted secondary metadata and descriptions |

### Halftone & Shadow Tokens
- **Drop Shadows:** `-4px 4px 0 #000000`, `-6px 6px 0 #000000` (Stark comic ink block shadows)
- **Radiation Bloom:** `0 0 25px rgba(157, 0, 255, 0.45)`, `0 0 35px rgba(192, 38, 211, 0.6)`
- **Comic Halftone:** Repeated 3px radial dot matrix on dark background (`background-image: radial-gradient(#20083b 15%, transparent 16%)`)

---

## 3. TYPOGRAPHY SYSTEM

### Typefaces
1. **Headline & Titles:** `Persona5`, `Impact`, `Bebas Neue`, `Luckiest Guy`, cursive/sans-serif.
2. **Data & Telemetry:** `JetBrains Mono`, `Share Tech Mono`, monospace.
3. **Body & Dialogue:** `Inter`, `Source Sans 3`, sans-serif.

### Type Scale
- **Display Hero (All-Out Attack):** 48px - 64px / Line-Height: 1.05 / Skew: -6deg / Weight: 900
- **Modal Heading:** 20px - 24px / Letter-Spacing: 1.5px / Uppercase / Weight: 900
- **Card Title:** 15px - 17px / Letter-Spacing: 1px / Weight: 900
- **Pill / Button Label:** 11px - 13px / Letter-Spacing: 1px / Uppercase / Weight: 800
- **Telemetry Tag:** 9px - 10px / Letter-Spacing: 2px / Monospace / Weight: 800
- **Body & Captions:** 12px - 14px / Line-Height: 1.4 / Weight: 400

---

## 4. GEOMETRY & SHAPE SYSTEM

### Slanted Polygons (`clip-path`)
- **Action Ribbon Pill:** `polygon(0 0, calc(100% - 15px) 0, 100% 100%, 15px 100%)`
- **Modal Hero Frame:** `polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))`
- **Task Item Card:** `polygon(4% 0%, 100% 0%, 96% 100%, 0% 100%)`
- **Joker Mascot Frame:** `polygon(0 8%, 92% 0, 100% 92%, 8% 100%)` with -3deg rotation

### Skew Angles
- Standard interactive elements are skewed along the X-axis: `transform: skewX(-6deg)` or `transform: skewX(-8deg)`.
- Internal text counter-skews (`transform: skewX(6deg)`) for crisp horizontal readability.

---

## 5. CORE UI COMPONENTS

### Component 1: Tactical Bottom Command Dock
- **Structure:** Anchored bottom ribbon with semi-transparent frosted glass backdrop (`rgba(10, 7, 20, 0.94)`, `backdrop-filter: blur(10px)`).
- **Navigation Pills:**
  1. `[♪ LO-FI RADIO]` (Toggles Cassette Player)
  2. `[INFILTRATE 25M]` (Launches Pomodoro Timer)
  3. `[CONFIDANTS]` (Opens Social Links Drawer)
  4. `[THIEF STATS]` (Opens 5-Axis Pentagon Radar)
  5. `[5D STREAK ★]` (Opens Shin Godzilla Evolution Stage)

### Component 2: Phantom Cassette Deck (Lo-Fi Radio Player)
- **Aesthetic:** 90s vintage portable cassette player with stereo TYPE-II chrome styling.
- **Elements:**
  - Dual spinning tape spools animated with pure CSS keyframes (`transform: rotate(360deg)`).
  - Skewed central label displaying the current synth-jazz track.
  - Controls: Previous Track, Play/Pause, Next Track, Rain Weather Toggle, Volume Slider.
  - Audio Engine: Zero-latency Web Audio synthesizing Rhodes jazz chords & pink-noise rain.

### Component 3: Palace Pomodoro Focus Clock
- **Aesthetic:** Palace alert system clock with neon progress ring.
- **States:** 
  - `PALACE INFILTRATION` (25m Focus / Red `#e60012`)
  - `SAFE ROOM RESPITE` (5m Short Rest / Cyan `#00f0ff`)
  - `VELVET ROOM RECOVERY` (15m Long Regeneration / Purple `#9d00ff`)
- **Telemetry:** Live Security Alert Level meter (0% to 100%) + Completion Reward (+25% Atomic Energy).

### Component 4: Confidants & Social Links System
- **Aesthetic:** Slide-in tactical companion roster.
- **Character Cards:**
  - Morgana (I. The Magician / Infiltration Maestro)
  - Ryuji Sakamoto (VII. The Chariot / Punk Blitz)
  - Makoto Niijima (II. The Priestess / Tactical Analysis)
  - Futaba Sakura (IX. The Hermit / Position Hack)
  - Ann Takamaki (VI. The Lovers / Femme Fatale)
- **Rank Up Ceremony:** Full-screen Tarot Arcana cut-in modal with ascending chime and perk unlocking.

### Component 5: 5-Axis Phantom Thief Pentagon Radar Chart
- **Aesthetic:** Persona 5 protagonist status screen.
- **Axes:** Knowledge, Guts, Proficiency, Kindness, Charm (Levels 1 to 5).
- **Canvas Rendering:** Concentric pentagon web rings with glowing radial gradient fill and vertex indicator dots.

### Component 6: Shin Godzilla Evolution Streak Meter
- **Aesthetic:** Biohazard Kaiju threat classification dossier.
- **Evolutionary Stages:**
  - Form 2: Kamata-kun (1-2 Days) — Crawling primordial
  - Form 3: Shinagawa-kun (3-5 Days) — Thermodynamic biped
  - Form 4: Kamakura Titan (6-9 Days) — 118.5m colossus with violet dorsal rays
  - Form 5: Awakened Hybrid (10+ Days) — Humanoid tail-spawn apex
- **Interactive Action:** Unleash Dorsal Atomic Beam (Screen laser streak + camera tremor).

### Component 7: All-Out Attack Cinematic Finisher Screen
- **Aesthetic:** Instant full-screen victory comic screen.
- **Visuals:** Diagonal split-screen comic tear, Joker + Godzilla silhouette backdrop, bold finisher typography:
  *"THE PROCRASTINATION HAS BEEN EXECUTED."*
- **Stats:** Missions Cleared tally, Total Thief EXP (+2,500 EXP), Max Overload Atomic Rad.

---

## 6. MOTION & SOUND PRINCIPLES
- **Transitions:** Snappy spring physics (`stiffness: 350, damping: 25`).
- **Feedback:** Every button triggers tactile mechanical click sounds (`sounds.playClick()`), rank-up chords (`sounds.playSuccess()`), or atomic laser bursts (`sounds.playAtomicBlast()`).
- **Screen Shake:** `.kaiju-tremor` applies rapid $\pm 3\text{px}$ X/Y vibration when high-impact actions occur.
