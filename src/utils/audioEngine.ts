/**
 * DRAGON 9 Web Audio Synthesis Engine
 * Synthesizes 528Hz Solfeggio, 432Hz Theta waves, Quantum 808s, and Phonk/Synthwave pulses,
 * alongside Speech Synthesis for character dialogue.
 */

class Dragon9AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private activeGainNodes: GainNode[] = [];
  private isMuted: boolean = false;
  private volume: number = 0.6;
  private currentFrequency: number = 432;
  private isPlayingAudio: boolean = false;
  private isSpeaking: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    this.initContext();
    return this.analyser;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public stopAllSound() {
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore already stopped
      }
    });
    this.activeGainNodes.forEach((gain) => {
      try {
        gain.disconnect();
      } catch {
        // ignore
      }
    });
    this.activeOscillators = [];
    this.activeGainNodes = [];
    this.isPlayingAudio = false;
  }

  /**
   * Play real-time synthesized audio sync cue based on shot frequency and scale type
   */
  public playCue(frequencyHz: number, scaleType: string, bpm?: number) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.stopAllSound();
    this.currentFrequency = frequencyHz;
    this.isPlayingAudio = true;

    const now = this.ctx.currentTime;

    if (scaleType === 'solfeggio') {
      // 528Hz DNA Healing Drone with gentle harmonic tape flutter
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const subOsc = this.ctx.createOscillator();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();

      const toneGain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(frequencyHz, now);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(frequencyHz * 1.5, now); // 5th harmonic

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(frequencyHz / 2, now); // sub-octave

      // Tape flutter LFO
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(1.2, now);
      lfoGain.gain.setValueAtTime(2.5, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);

      toneGain.gain.setValueAtTime(0, now);
      toneGain.gain.linearRampToValueAtTime(0.28, now + 0.8);

      osc1.connect(toneGain);
      osc2.connect(toneGain);
      subOsc.connect(toneGain);
      toneGain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      subOsc.start(now);
      lfo.start(now);

      this.activeOscillators.push(osc1, osc2, subOsc, lfo);
      this.activeGainNodes.push(toneGain, lfoGain);

    } else if (scaleType === 'theta') {
      // 432Hz Warm analog Rhodes chords with vinyl sub pulse
      const oscRoot = this.ctx.createOscillator();
      const oscMinor = this.ctx.createOscillator();
      const oscFifth = this.ctx.createOscillator();
      const sub = this.ctx.createOscillator();
      const toneGain = this.ctx.createGain();

      oscRoot.type = 'sine';
      oscRoot.frequency.setValueAtTime(frequencyHz, now);

      // Minor triad for warm cyber ambient vibe
      oscMinor.type = 'sine';
      oscMinor.frequency.setValueAtTime(frequencyHz * 1.1892, now); // Minor 3rd

      oscFifth.type = 'triangle';
      oscFifth.frequency.setValueAtTime(frequencyHz * 1.4983, now); // Perfect 5th

      sub.type = 'sine';
      sub.frequency.setValueAtTime(frequencyHz / 4, now); // Deep 108Hz sub

      toneGain.gain.setValueAtTime(0, now);
      toneGain.gain.linearRampToValueAtTime(0.32, now + 0.5);

      oscRoot.connect(toneGain);
      oscMinor.connect(toneGain);
      oscFifth.connect(toneGain);
      sub.connect(toneGain);
      toneGain.connect(this.masterGain);

      oscRoot.start(now);
      oscMinor.start(now);
      oscFifth.start(now);
      sub.start(now);

      this.activeOscillators.push(oscRoot, oscMinor, oscFifth, sub);
      this.activeGainNodes.push(toneGain);

    } else if (scaleType === '808-trap') {
      // Quantum Bodega 808 Sub-Drop with syncopated rhythm
      const tempo = bpm || 86;
      const beatInterval = 60 / tempo;

      const triggerSubDrop = (timeOffset: number) => {
        if (!this.ctx || !this.masterGain) return;
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();

        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(140, timeOffset);
        kickOsc.frequency.exponentialRampToValueAtTime(frequencyHz / 8, timeOffset + 0.08); // drops to 54Hz

        kickGain.gain.setValueAtTime(0.5, timeOffset);
        kickGain.gain.exponentialRampToValueAtTime(0.001, timeOffset + 0.7);

        kickOsc.connect(kickGain);
        kickGain.connect(this.masterGain);

        kickOsc.start(timeOffset);
        kickOsc.stop(timeOffset + 0.75);

        this.activeOscillators.push(kickOsc);
        this.activeGainNodes.push(kickGain);
      };

      // Play 4 syncopated trap drop bars
      for (let i = 0; i < 4; i++) {
        triggerSubDrop(now + i * beatInterval);
        if (i % 2 === 1) {
          triggerSubDrop(now + i * beatInterval + beatInterval * 0.5);
        }
      }

      // Continuous drone bed underneath
      const drone = this.ctx.createOscillator();
      const droneGain = this.ctx.createGain();
      drone.type = 'triangle';
      drone.frequency.setValueAtTime(frequencyHz / 4, now);
      droneGain.gain.setValueAtTime(0.15, now);
      drone.connect(droneGain);
      droneGain.connect(this.masterGain);
      drone.start(now);

      this.activeOscillators.push(drone);
      this.activeGainNodes.push(droneGain);

    } else if (scaleType === 'phonk') {
      // High Voltage Phonk breakbeat (140 BPM)
      const tempo = bpm || 140;
      const beatInterval = 60 / tempo;

      const triggerCowbell = (timeOffset: number, pitchMult: number) => {
        if (!this.ctx || !this.masterGain) return;
        const cbOsc = this.ctx.createOscillator();
        const cbGain = this.ctx.createGain();

        cbOsc.type = 'square';
        cbOsc.frequency.setValueAtTime(frequencyHz * pitchMult, timeOffset);

        cbGain.gain.setValueAtTime(0.18, timeOffset);
        cbGain.gain.exponentialRampToValueAtTime(0.001, timeOffset + 0.22);

        cbOsc.connect(cbGain);
        cbGain.connect(this.masterGain);

        cbOsc.start(timeOffset);
        cbOsc.stop(timeOffset + 0.25);
        this.activeOscillators.push(cbOsc);
        this.activeGainNodes.push(cbGain);
      };

      for (let b = 0; b < 8; b++) {
        const t = now + b * (beatInterval / 2);
        const pitch = b % 4 === 0 ? 1.0 : b % 4 === 2 ? 1.25 : 1.5;
        triggerCowbell(t, pitch);
      }

      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(frequencyHz / 4, now);
      bassGain.gain.setValueAtTime(0.2, now);
      bassOsc.connect(bassGain);
      bassGain.connect(this.masterGain);
      bassOsc.start(now);

      this.activeOscillators.push(bassOsc);
      this.activeGainNodes.push(bassGain);

    } else {
      // Synthwave / Crystal Soundbath default
      const osc = this.ctx.createOscillator();
      const oscDetune = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = scaleType === 'crystal-soundbath' ? 'sine' : 'sawtooth';
      oscDetune.type = 'sine';

      osc.frequency.setValueAtTime(frequencyHz, now);
      oscDetune.frequency.setValueAtTime(frequencyHz * 2, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.4);

      osc.connect(gain);
      oscDetune.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      oscDetune.start(now);

      this.activeOscillators.push(osc, oscDetune);
      this.activeGainNodes.push(gain);
    }
  }

  /**
   * Character Performance Speech Synthesizer
   */
  public speakDialogue(text: string, onStart?: () => void, onEnd?: () => void) {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Urban relaxed cadence
    utterance.pitch = 0.82; // Deep resonant bass timbre
    utterance.volume = this.isMuted ? 0 : this.volume;

    // Pick best natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Daniel') || v.name.includes('Alex')) && v.lang.startsWith('en')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopDialogue() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  public getIsPlayingAudio(): boolean {
    return this.isPlayingAudio;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getCurrentFrequency(): number {
    return this.currentFrequency;
  }
}

export const audioEngine = new Dragon9AudioEngine();
