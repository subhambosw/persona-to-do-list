# Take Your Time // Shin Godzilla Atomic Blast Edition ⚡

A high-octane recreation of the **Persona 5** productivity task tracker inspired by [JigneshParmar24/Take-Your-Time](https://github.com/JigneshParmar24/Take-Your-Time), fully reimagined with the menacing **Shin Godzilla Atomic Blast** purple aesthetic, the iconic in-game **"DAYS UNTIL..."** mission deadline countdown, **Joker (The Persona Person)**, the **Original Godzilla Kaiju Roar**, the **Boredom Clear Dino Runner**, and **Offline PWA** capability!

---

## 💥 Features

### 1. 🎭 Persona Person (Joker / Ren Amamiya)
- **Official Character Background:** The authentic Persona 5 artwork of Joker looking back over his shoulder in his trenchcoat, bathed in Shin Godzilla atomic violet/purple hue.
- **Interactive Character Mascot:** Located at the bottom left with dynamic comic speech bubbles that react to your tasks and recent events.
- **Disguise Toggle:** Click Joker to switch between **Phantom Thief Joker** (mask) and **Shujin High Ren** (glasses).

### 2. 🦖 Authentic Godzilla Roar & Atomic Beam Ray
- **Authentic Kaiju Roar:** Whenever you check off a task as completed, the authentic original Godzilla roar plays (`public/godzilla_roar.mp3`).
- **Screen-Slicing Atomic Laser Ray:** Completing any task automatically triggers a full-screen violet atomic blast laser cutting across the screen with screen shake and comic shockwave burst.
- **All-Out Celebration:** Completing all tasks for the day charges the **Atomic Blast Gauge** to 100%, releasing an atomic purple confetti explosion.

### 3. 🕹️ Boredom Clear Minigame (Shin Godzilla Dino Runner)
- **Chrome Dino × Tomb of the Mask:** A high-speed retro runner minigame where you control Shin Godzilla (with animated running legs and pixel art styling).
- **Controls & Abilities:**
  - `SPACE` / `UP` / Click to jump over military tanks and cacti.
  - `F` / Laser button to unleash the diagonal atomic ray against incoming airborne pterodactyls.
  - Score counter, high score tracker, HP bar, and Special beam energy meter.

### 4. ⏰ Scheduled Mission Reminders & Fullscreen Calling Card Alert
- **Mission Timers:** Set custom reminder times or quick presets (`+15m`, `+1h`, `20:00`) for any mission objective.
- **Persona 5 Calling Card Alert:** When a reminder triggers, a full-screen dramatic Phantom Thieves Calling Card alert takes over the screen with options to Execute, Snooze (+5m), or Dismiss.
- **Offline PWA:** Complete offline functionality with service worker caching, local fonts, and Web App Manifest.

### 5. 🎯 Top-Right "DAYS UNTIL..." Calling Card (On-Demand Priority)
- **On-Demand Appearance:** Appears in the top-right corner **only** when an active task is star-marked (`⭐`) and its deadline or reminder time is **near** (e.g. today or within 1–3 days).
- **Dynamic Stress Meter:** Automatically calculates days/hours remaining and outputs humorous anxiety warnings:
  - `DAYS 1-3`: *MAXIMUM PANIC! Heart Rate Climbing!*
  - `DAYS = 0`: *DO OR DIE! The Heist Commences!*
  - `OVERDUE`: *Expulsion! Mission Failed?*
- **Instant Dismissal:** Unstarring or completing the mission automatically removes the card from view.
- **Multi-Mission Support:** Cycle between multiple near starred missions with `★ 1/2` switcher buttons.

### 6. 📅 Persona 5 Date & Time Calendar with Exit/Back Controls
- Classic Month/Day skewed quads, weather icon (Sun/Moon), and time-of-day indicator (Morning/Afternoon/Evening/Night).
- **Weekly Calendar Ribbon:** Click the day of the week button to open the horizontal 7-day ribbon.
- **Exit Back Button:** Dedicated **`EXIT CALENDAR [ESC]`** button, **`⮌ BACK`** ribbon button, click-outside backdrop, and keyboard `ESC` shortcut to exit back anytime.
- **`⮌ TODAY` Button:** Quick-return button appearing whenever navigating away from today's date.

---

## 🚀 Running the App

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open your browser at `http://localhost:3000`.
