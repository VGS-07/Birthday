/**
 * Sound FX & Background Music Synthesizer
 * Built using pure Web Audio API for zero-dependency instant sound playback!
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgMusicAudio = null;
    this.synthMusicInterval = null;
    this.isSynthPlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Sound Effects ---

  // Balloon Pop Sound
  playPop() {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Pop Oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);

    // Noise burst
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
  }

  // Candle Extinguish / Whoosh
  playBlow() {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.4);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  }

  // Ribbon Untie / Zip
  playRibbon() {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.18);
    });
  }

  // Cake Slice Sound
  playSlice() {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.2);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Romantic Harp Chime (for photo views, letter open)
  playChime() {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const chords = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    chords.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.6);
    });
  }

  // Runaway Button Boing / Dodge
  playDodged() {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.15);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Celebration Fanfare / Success
  playFanfare() {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const notes = [
      { f: 523.25, d: 0.15 }, // C5
      { f: 659.25, d: 0.15 }, // E5
      { f: 783.99, d: 0.15 }, // G5
      { f: 1046.5, d: 0.45 }, // C6
    ];

    let offset = 0;
    notes.forEach(n => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + offset;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, t);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + n.d);
      offset += 0.12;
    });
  }

  // --- Background Music Synthesizer (Happy Birthday Music Box) ---
  startSynthMusic() {
    if (this.isSynthPlaying || this.isMuted) return;
    this.init();
    this.isSynthPlaying = true;

    // Melody notes for Happy Birthday (freq in Hz, duration in seconds)
    // C4=261.6, D4=293.7, E4=329.6, F4=349.2, G4=392.0, A4=440, Bb4=466.2, C5=523.3, B4=493.9
    const melody = [
      { f: 261.6, d: 0.35 }, { f: 261.6, d: 0.35 }, { f: 293.7, d: 0.7 }, { f: 261.6, d: 0.7 }, { f: 349.2, d: 0.7 }, { f: 329.6, d: 1.2 },
      { f: 261.6, d: 0.35 }, { f: 261.6, d: 0.35 }, { f: 293.7, d: 0.7 }, { f: 261.6, d: 0.7 }, { f: 392.0, d: 0.7 }, { f: 349.2, d: 1.2 },
      { f: 261.6, d: 0.35 }, { f: 261.6, d: 0.35 }, { f: 523.3, d: 0.7 }, { f: 440.0, d: 0.7 }, { f: 349.2, d: 0.7 }, { f: 329.6, d: 0.7 }, { f: 293.7, d: 1.2 },
      { f: 466.2, d: 0.35 }, { f: 466.2, d: 0.35 }, { f: 440.0, d: 0.7 }, { f: 349.2, d: 0.7 }, { f: 392.0, d: 0.7 }, { f: 349.2, d: 1.5 }
    ];

    let noteIdx = 0;
    const playNextNote = () => {
      if (!this.isSynthPlaying || this.isMuted) return;
      const note = melody[noteIdx];
      const now = this.ctx.currentTime;

      // Music box sound: sine + subtle harmonic
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f * 1.5, now); // Sweet music box octave

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + note.d);

      noteIdx = (noteIdx + 1) % melody.length;
      const delay = (note.d + 0.05) * 1000;
      this.synthMusicInterval = setTimeout(playNextNote, delay);
    };

    playNextNote();
  }

  stopSynthMusic() {
    this.isSynthPlaying = false;
    if (this.synthMusicInterval) {
      clearTimeout(this.synthMusicInterval);
      this.synthMusicInterval = null;
    }
  }

  // Play background music (either custom audio file or synthesized melody)
  playBackgroundMusic(audioUrl = null) {
    this.init();
    if (audioUrl) {
      this.stopSynthMusic();
      if (!this.bgMusicAudio) {
        this.bgMusicAudio = new Audio(audioUrl);
        this.bgMusicAudio.loop = true;
      } else if (this.bgMusicAudio.src !== audioUrl) {
        this.bgMusicAudio.src = audioUrl;
      }
      this.bgMusicAudio.volume = 0.5;
      this.bgMusicAudio.play().catch(e => {
        console.log("Audio autoplay prevented, will start on user tap", e);
      });
    } else {
      if (this.bgMusicAudio) {
        this.bgMusicAudio.pause();
      }
      this.startSynthMusic();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      if (this.bgMusicAudio) this.bgMusicAudio.pause();
      this.stopSynthMusic();
    } else {
      if (this.bgMusicAudio && this.bgMusicAudio.src) {
        this.bgMusicAudio.play().catch(() => {});
      } else {
        this.startSynthMusic();
      }
    }
    return this.isMuted;
  }
}

// Global sound instance
window.soundEngine = new SoundEngine();
