// Web Audio & HTML5 Audio Controller for Persona 5 & Original Godzilla Roar
class SoundController {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.godzillaAudio = null;
    this.initAudioElement();
  }

  initAudioElement() {
    if (typeof window !== 'undefined') {
      try {
        this.godzillaAudio = new Audio('/godzilla_roar.mp3');
        this.godzillaAudio.preload = 'auto';
        this.godzillaAudio.volume = 0.85;
      } catch (err) {
        console.warn('Audio element initialization failed, using Web Audio fallback', err);
      }
    }
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.godzillaAudio) {
      this.godzillaAudio.muted = this.muted;
    }
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // 🦖 THE ORIGINAL GODZILLA ROAR VOICE
  playGodzillaRoar() {
    if (this.muted) return;

    if (this.godzillaAudio) {
      try {
        this.godzillaAudio.currentTime = 0;
        const playPromise = this.godzillaAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // If browser autoplay policy blocks it before user gesture, fallback to Web Audio
            this.playSyntheticRoarFallback();
          });
        }
        return;
      } catch {
        this.playSyntheticRoarFallback();
      }
    } else {
      this.playSyntheticRoarFallback();
    }
  }

  // Persona 5 Snappy Menu Move / Select Click
  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.04);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  // Task Completion: Persona Sharp Cut / Sword Slash
  playSlash() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3500, t);
    filter.frequency.exponentialRampToValueAtTime(800, t + 0.12);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.12);
    oscGain.gain.setValueAtTime(0.15, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 0.12);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  // Persona 5 All-Out Attack / Mission Deadline Dramatic Sting
  playAlarmSting() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.25);
      
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35 + (idx * 0.05));

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  }

  // Shin Godzilla Atomic Blast Beam Laser Charge & Fire!
  playAtomicBlast() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(2400, t + 0.2);
    osc.frequency.setValueAtTime(2400, t + 0.4);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.8);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.85);
  }

  // Fallback synthesizer in case local audio element is blocked
  playSyntheticRoarFallback() {
    this.init();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const t = ctx.currentTime;

    const shaper = ctx.createWaveShaper();
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    const k = 45;
    for (let i = 0; i < n_samples; ++i) {
      let x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    shaper.curve = curve;
    shaper.oversample = '4x';

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.5, t);
    masterGain.gain.exponentialRampToValueAtTime(0.001, t + 2.0);

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'square';

    osc1.frequency.setValueAtTime(560, t);
    osc1.frequency.exponentialRampToValueAtTime(890, t + 0.16);
    osc1.frequency.exponentialRampToValueAtTime(140, t + 1.6);

    osc2.frequency.setValueAtTime(568, t);
    osc2.frequency.exponentialRampToValueAtTime(898, t + 0.16);
    osc2.frequency.exponentialRampToValueAtTime(144, t + 1.6);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1700, t);
    filter.frequency.exponentialRampToValueAtTime(500, t + 1.4);
    filter.Q.setValueAtTime(3.5, t);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(shaper);
    shaper.connect(masterGain);
    masterGain.connect(ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 1.8);
    osc2.stop(t + 1.8);
  }
}

export const sounds = new SoundController();
