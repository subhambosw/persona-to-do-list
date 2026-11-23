// Web Audio Lo-Fi BGM Synthesizer for Persona 5 & Shin Godzilla
// Synthesizes chill Rhodes jazz chords (Beneath the Mask inspired), vinyl crackle, and Tokyo rain ambiance

class LoFiBGMController {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.currentTrackIndex = 0;
    this.volume = 0.5;
    this.isRainEnabled = true;

    this.rainGain = null;
    this.musicGain = null;
    this.masterGain = null;
    this.sequenceTimer = null;
    this.step = 0;

    this.tracks = [
      {
        id: 'beneath-mask',
        title: 'BENEATH THE MASK // TOKYO RAIN LO-FI',
        bpm: 74,
        scale: [
          // F#m7, Bm7, Em7, A7, Dmaj7 jazz progression
          [370.0, 440.0, 554.37, 659.25], // F#m7
          [493.88, 587.33, 739.99, 880.0], // Bm7
          [329.63, 392.0, 493.88, 587.33], // Em7
          [440.0, 554.37, 659.25, 783.99], // A7
          [293.66, 369.99, 440.0, 554.37]  // Dmaj7
        ]
      },
      {
        id: 'tokyo-daylight',
        title: 'TOKYO DAYLIGHT // SUNNY STUDY BEATS',
        bpm: 96,
        scale: [
          [261.63, 329.63, 392.0, 493.88], // Cmaj7
          [220.0, 261.63, 329.63, 392.0],  // Am7
          [349.23, 440.0, 523.25, 659.25], // Fmaj7
          [392.0, 493.88, 587.33, 698.46]  // G7
        ]
      },
      {
        id: 'shin-requiem',
        title: 'SHIN GODZILLA // SUBTERRANEAN AMBIENT',
        bpm: 56,
        scale: [
          [146.83, 220.0, 293.66, 349.23], // Dm9
          [130.81, 196.0, 261.63, 311.13], // Cm7
          [110.0, 164.81, 220.0, 261.63],  // Am7
          [123.47, 185.0, 246.94, 293.66]  // Bm7b5
        ]
      }
    ];
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);

        this.setupRainGenerator();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Pink noise generator for gentle Tokyo rain and vinyl crackle
  setupRainGenerator() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    // Filter to make it sound like gentle rain outside Cafe Leblanc
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(this.isRainEnabled ? 0.35 : 0.0, this.ctx.currentTime);

    rainSource.connect(filter);
    filter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);
    rainSource.start();
  }

  playChord(frequencies, duration) {
    if (!this.ctx || !this.isPlaying) return;
    const now = this.ctx.currentTime;

    frequencies.forEach((freq, i) => {
      // Warm Rhodes electric piano simulation (sine + gentle triangle harmonics)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Gentle vibrato
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(4.5, now);
      lfoGain.gain.setValueAtTime(1.8, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + duration);

      // ADSR envelope: soft attack, sustained body, gentle release
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.09 / (i + 1), now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.04 / (i + 1), now + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now + i * 0.03); // Slight arpeggiated strum
      osc.stop(now + duration + 0.1);
    });
  }

  startSequence() {
    if (this.sequenceTimer) clearInterval(this.sequenceTimer);
    const track = this.tracks[this.currentTrackIndex];
    const chordDuration = (60 / track.bpm) * 4; // 1 measure per chord
    this.step = 0;

    const playNext = () => {
      if (!this.isPlaying) return;
      const chords = track.scale;
      const chord = chords[this.step % chords.length];
      this.playChord(chord, chordDuration * 0.95);
      this.step++;
    };

    playNext();
    this.sequenceTimer = setInterval(playNext, chordDuration * 1000);
  }

  play() {
    this.init();
    this.isPlaying = true;
    this.startSequence();
    if (this.rainGain) {
      this.rainGain.gain.setValueAtTime(this.isRainEnabled ? 0.35 : 0.0, this.ctx?.currentTime || 0);
    }
  }

  pause() {
    this.isPlaying = false;
    if (this.sequenceTimer) {
      clearInterval(this.sequenceTimer);
      this.sequenceTimer = null;
    }
    if (this.rainGain && this.ctx) {
      this.rainGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    if (this.isPlaying) {
      this.startSequence();
    }
    return this.getCurrentTrack();
  }

  prevTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
    if (this.isPlaying) {
      this.startSequence();
    }
    return this.getCurrentTrack();
  }

  toggleRain() {
    this.isRainEnabled = !this.isRainEnabled;
    if (this.rainGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.rainGain.gain.setValueAtTime(
        this.isPlaying && this.isRainEnabled ? 0.35 : 0.0,
        now
      );
    }
    return this.isRainEnabled;
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  getCurrentTrack() {
    return this.tracks[this.currentTrackIndex];
  }
}

export const lofiPlayer = new LoFiBGMController();
