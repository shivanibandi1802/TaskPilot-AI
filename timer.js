/**
 * TaskPilot AI — Focus Pomodoro Companion & Web Audio Synthesizer
 * Features customizable intervals, task time tracking, chime alerts, and procedural ambient focus sounds.
 */

class FocusTimer {
  constructor() {
    this.durations = {
      focus: 25 * 60,
      shortBreak: 5 * 60,
      longBreak: 15 * 60,
    };

    this.currentMode = 'focus';
    this.timeLeft = this.durations.focus;
    this.isRunning = false;
    this.interval = null;
    this.activeTaskId = null;

    // Web Audio Context for offline synthesis
    this.audioCtx = null;
    this.ambientSource = null;
    this.ambientGain = null;
    this.currentAmbientSound = null;

    this.initAudio();
  }

  initAudio() {
    // AudioContext will resume on first user interaction
    window.addEventListener('click', () => {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      } else if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    }, { once: true });
  }

  setMode(mode) {
    if (this.durations[mode]) {
      this.currentMode = mode;
      this.pause();
      this.timeLeft = this.durations[mode];
      this.updateDisplay();
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.updateDisplay();
      } else {
        this.onTimerComplete();
      }
    }, 1000);
  }

  pause() {
    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  reset() {
    this.pause();
    this.timeLeft = this.durations[this.currentMode];
    this.updateDisplay();
  }

  onTimerComplete() {
    this.pause();
    this.playCelebrationChime();

    // If attached to a task, record spent time
    if (this.activeTaskId && window.storageManager) {
      const task = window.storageManager.getTaskById(this.activeTaskId);
      if (task) {
        const addedMins = Math.round(this.durations[this.currentMode] / 60);
        window.storageManager.updateTask(task.id, {
          timeSpentMins: (task.timeSpentMins || 0) + addedMins
        });
        if (window.app) window.app.showToast(`Logged ${addedMins} mins to "${task.title}"!`);
      }
    }

    // Trigger visual confetti
    if (window.app && window.app.triggerConfetti) {
      window.app.triggerConfetti();
    }

    if (this.currentMode === 'focus') {
      this.setMode('shortBreak');
      if (window.app) window.app.showToast('🎯 Focus session complete! Take a well-deserved 5-minute break.');
    } else {
      this.setMode('focus');
      if (window.app) window.app.showToast('☕ Break ended! Ready to enter deep focus?');
    }
  }

  updateDisplay() {
    const mins = Math.floor(this.timeLeft / 60);
    const secs = this.timeLeft % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const displayEl = document.getElementById('timer-display');
    if (displayEl) {
      displayEl.textContent = formatted;
    }

    // Update document title for background tab productivity
    document.title = `${formatted} - ${this.currentMode.toUpperCase()} | TaskPilot AI`;
  }

  setActiveTask(taskId) {
    this.activeTaskId = taskId;
    const taskNameEl = document.getElementById('timer-task-name');
    if (taskNameEl && window.storageManager) {
      const task = window.storageManager.getTaskById(taskId);
      taskNameEl.textContent = task ? task.title : 'General Deep Focus';
    }
  }

  /**
   * Synthesize a melodic gong/chime via Web Audio API
   */
  playCelebrationChime() {
    try {
      const ctx = this.audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;

      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 chord
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        gain.gain.setValueAtTime(0.001, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.3, now + i * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 2);
      });
    } catch (e) {
      console.warn('Audio chime unsupported or blocked', e);
    }
  }

  /**
   * Toggle procedural ambient focus generator (rain / binaural beats)
   */
  toggleAmbient(type) {
    if (this.currentAmbientSound === type) {
      this.stopAmbient();
      return false;
    }

    this.stopAmbient();

    try {
      const ctx = this.audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      this.audioCtx = ctx;

      if (type === 'binaural') {
        // Binaural theta drone (190Hz Left, 196Hz Right)
        const merger = ctx.createChannelMerger(2);
        
        const oscLeft = ctx.createOscillator();
        oscLeft.type = 'sine';
        oscLeft.frequency.value = 190;

        const oscRight = ctx.createOscillator();
        oscRight.type = 'sine';
        oscRight.frequency.value = 196;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.06, ctx.currentTime);

        oscLeft.connect(merger, 0, 0);
        oscRight.connect(merger, 0, 1);
        merger.connect(gain);
        gain.connect(ctx.destination);

        oscLeft.start();
        oscRight.start();

        this.ambientSource = { stop: () => { oscLeft.stop(); oscRight.stop(); } };
        this.currentAmbientSound = 'binaural';
        return true;
      } else if (type === 'rain') {
        // Pink noise filtered through bandpass for soft soothing rain
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
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

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.08, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        whiteNoise.start();
        this.ambientSource = whiteNoise;
        this.currentAmbientSound = 'rain';
        return true;
      }
    } catch (e) {
      console.warn('Ambient synthesis failed', e);
      return false;
    }
    return false;
  }

  stopAmbient() {
    if (this.ambientSource) {
      try {
        this.ambientSource.stop();
      } catch (e) {}
      this.ambientSource = null;
    }
    this.currentAmbientSound = null;
  }
}

// Global instance
window.focusTimer = new FocusTimer();
