// Procedural Web Audio API sound synthesizer for ambient audio and interactive sound effects

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;

  // Ambient nodes
  private rainNoiseNode: AudioNode | null = null;
  private rainGain: GainNode | null = null;

  private oceanNoiseNode: AudioNode | null = null;
  private oceanGain: GainNode | null = null;
  private oceanLfo: OscillatorNode | null = null;

  private fireGain: GainNode | null = null;
  private fireInterval: number | null = null;

  private bowlOsc1: OscillatorNode | null = null;
  private bowlOsc2: OscillatorNode | null = null;
  private bowlGain: GainNode | null = null;

  private windGain: GainNode | null = null;
  private windInterval: number | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 1.2; // High-impact stress release volume
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(vol: number) {
    if (!this.masterGain || !this.ctx) return;
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : vol, this.ctx.currentTime);
  }

  public setMuted(muted: boolean, currentVol: number = 0.8) {
    this.isMuted = muted;
    this.setMasterVolume(muted ? 0 : currentVol);
  }

  // --- SOUND EFFECTS ---

  // Glass & Porcelain Shatter SFX (극강의 챙그랑-! 유리 산산조각)
  public playShatter() {
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // Heavy Initial Impact Punch
    const punchOsc = this.ctx.createOscillator();
    const punchGain = this.ctx.createGain();
    punchOsc.type = 'triangle';
    punchOsc.frequency.setValueAtTime(320, now);
    punchOsc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

    punchGain.gain.setValueAtTime(1.0, now);
    punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    punchOsc.connect(punchGain);
    punchGain.connect(this.masterGain);
    punchOsc.start(now);
    punchOsc.stop(now + 0.16);

    // High-pitched explosive white noise
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.45);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.045));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2800, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.95, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.40);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);

    // Multi-tone glass shatters & high crystalline pings
    [1800, 2600, 3800, 5200, 6800, 8400].forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      const offset = idx * 0.015;
      osc.frequency.setValueAtTime(freq, now + offset);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.45, now + offset + 0.22);

      oscGain.gain.setValueAtTime(0, now + offset);
      oscGain.gain.linearRampToValueAtTime(0.35, now + offset + 0.003);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.25);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);
      osc.start(now + offset);
      osc.stop(now + offset + 0.28);
    });
  }

  // Flame Burn Crackle SFX
  public playBurn() {
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const duration = 2.5;

    // Deep low roar
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.linearRampToValueAtTime(40, now + duration);

    oscGain.gain.setValueAtTime(0.4, now);
    oscGain.gain.linearRampToValueAtTime(0.01, now + duration);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + duration);

    // Crackle bursts
    for (let i = 0; i < 20; i++) {
      const timeOffset = now + Math.random() * duration;
      const clickBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.02, this.ctx.sampleRate);
      const clickData = clickBuffer.getChannelData(0);
      for (let j = 0; j < clickData.length; j++) {
        clickData[j] = (Math.random() * 2 - 1);
      }
      const clickSrc = this.ctx.createBufferSource();
      clickSrc.buffer = clickBuffer;
      const clickGain = this.ctx.createGain();
      clickGain.gain.setValueAtTime(0.3 * Math.random(), timeOffset);
      clickGain.gain.exponentialRampToValueAtTime(0.001, timeOffset + 0.02);

      clickSrc.connect(clickGain);
      clickGain.connect(this.masterGain);
      clickSrc.start(timeOffset);
    }
  }

  // School Bell / Bronze Chime SFX (학교종소리 7연속 "댕~ 댕~ 댕~ 댕~ 댕~ 댕~ 댕~")
  public playSchoolBell() {
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    
    // 7 clear, resonant golden bell strikes ("댕!" x 7)
    const strikeIntervals = [0.0, 0.38, 0.76, 1.14, 1.52, 1.90, 2.28];
    
    strikeIntervals.forEach((strikeTime, strikeIndex) => {
      if (!this.ctx || !this.masterGain) return;
      const t = now + strikeTime;
      const strikeVol = 0.88 - (strikeIndex * 0.02);

      const harmonics = [
        { mult: 1.0, dur: 2.8, vol: 0.7 },    // Base pitch
        { mult: 1.503, dur: 2.2, vol: 0.5 },  // Fifth harmonic
        { mult: 2.0, dur: 2.0, vol: 0.4 },    // Octave
        { mult: 2.76, dur: 1.6, vol: 0.35 },  // Metallic chime
        { mult: 4.07, dur: 1.2, vol: 0.25 },  // High shimmer
      ];

      const baseFreq = 587.33; // D5 pitch

      harmonics.forEach(({ mult, dur, vol }) => {
        if (!this.ctx || !this.masterGain) return;
        const freq = baseFreq * mult;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = mult === 1.0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol * strikeVol, t + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + dur);
      });
    });
  }

  // Funny Fart Sound SFX (방귀소리 7연속 "뿡! 뿡! 뿡! 뿡! 뿡! 뿡! 뿌-웅~!")
  public playFart() {
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // 6 short pops + 1 long sustained fart = 7 consecutive fart bursts
    const fartPuffs = [
      { delay: 0.00, dur: 0.13, startPitch: 160, endPitch: 70, flutterSpeed: 30 },
      { delay: 0.18, dur: 0.13, startPitch: 180, endPitch: 75, flutterSpeed: 35 },
      { delay: 0.36, dur: 0.14, startPitch: 150, endPitch: 65, flutterSpeed: 28 },
      { delay: 0.54, dur: 0.14, startPitch: 170, endPitch: 72, flutterSpeed: 32 },
      { delay: 0.72, dur: 0.15, startPitch: 155, endPitch: 68, flutterSpeed: 30 },
      { delay: 0.90, dur: 0.15, startPitch: 175, endPitch: 70, flutterSpeed: 34 },
      { delay: 1.10, dur: 0.75, startPitch: 140, endPitch: 40, flutterSpeed: 22 },
    ];

    fartPuffs.forEach(({ delay, dur, startPitch, endPitch, flutterSpeed }) => {
      if (!this.ctx || !this.masterGain) return;
      const t = now + delay;

      // Pitch-dropping oscillator for bass puff
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(startPitch, t);
      osc.frequency.exponentialRampToValueAtTime(endPitch, t + dur);

      // Fast LFO flutter for vibrating gas effect
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.type = 'sawtooth';
      lfo.frequency.setValueAtTime(flutterSpeed, t);
      lfoGain.gain.setValueAtTime(0.4, t);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, t);
      filter.Q.value = 3.0;

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.9, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      lfo.connect(gain.gain);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      lfo.start(t);
      lfo.stop(t + dur);
      osc.start(t);
      osc.stop(t + dur + 0.02);

      // Air puff noise burst
      const bufferSize = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(320, t);
      noiseFilter.Q.value = 1.8;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.5, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noise.start(t);
    });
  }

  // Deep Ocean Ship Foghorn SFX (뱃고동 소리 7연속 "부우우웅-!" x 7)
  public playFoghorn() {
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    
    // 7 consecutive foghorn blasts
    const hornIntervals = [0.0, 0.42, 0.84, 1.26, 1.68, 2.10, 2.52];

    hornIntervals.forEach((delay, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const t = now + delay;
      const dur = idx === 6 ? 0.85 : 0.38; // Last one holds slightly longer
      const volScale = 1.0 - (idx * 0.02);

      // Dual low fundamental tones for brassy ship horn beat harmonics (~94Hz & 99Hz)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const osc3 = this.ctx.createOscillator();

      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(94, t);
      osc1.frequency.linearRampToValueAtTime(91, t + dur);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(99, t);
      osc2.frequency.linearRampToValueAtTime(96, t + dur);

      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(188, t); // 1st octave harmonic
      osc3.frequency.linearRampToValueAtTime(182, t + dur);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(240, t);
      filter.frequency.linearRampToValueAtTime(480, t + 0.1);
      filter.frequency.linearRampToValueAtTime(360, t + dur);
      filter.Q.value = 2.5;

      // Smooth swell & envelope
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.92 * volScale, t + 0.05);
      gain.gain.setValueAtTime(0.88 * volScale, t + dur * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(t);
      osc2.start(t);
      osc3.start(t);
      osc1.stop(t + dur + 0.03);
      osc2.stop(t + dur + 0.03);
      osc3.stop(t + dur + 0.03);
    });
  }

  // Aliases for compatibility
  public playBurn() {
    this.playFart();
  }

  public playJanggu() {
    this.playFoghorn();
  }

  // Legacy fallback alias for playLaugh
  public playLaugh() {
    this.playJanggu();
  }

  // Bowling Strike SFX (연속 7회 스트라이크 소리)
  public playLantern() {
    this.playBowling();
  }

  // Realistic 10-Pin Bowling Strike Crash SFX (볼링 스트라이크 7연속 강렬한 타격!)
  public playBowling() {
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    
    // 7 consecutive strikes with rhythmic 0.38s intervals
    const strikeDelays = [0.0, 0.38, 0.76, 1.14, 1.52, 1.90, 2.28];

    strikeDelays.forEach((delay, strikeIdx) => {
      if (!this.ctx || !this.masterGain) return;
      const t = now + delay;
      const volScale = 1.0 - (strikeIdx * 0.02);

      // 1. Heavy 16lb Ball Rolling on Wood Lane ("우르르-")
      const rollBuffer = Math.floor(this.ctx.sampleRate * 0.16);
      const rollBuf = this.ctx.createBuffer(1, rollBuffer, this.ctx.sampleRate);
      const rollData = rollBuf.getChannelData(0);
      for (let i = 0; i < rollBuffer; i++) {
        rollData[i] = (Math.random() * 2 - 1) * 0.5;
      }
      const rollNoise = this.ctx.createBufferSource();
      rollNoise.buffer = rollBuf;

      const rollFilter = this.ctx.createBiquadFilter();
      rollFilter.type = 'lowpass';
      rollFilter.frequency.setValueAtTime(150 + (strikeIdx * 15), t);
      rollFilter.frequency.exponentialRampToValueAtTime(380, t + 0.12);

      const rollGain = this.ctx.createGain();
      rollGain.gain.setValueAtTime(0, t);
      rollGain.gain.linearRampToValueAtTime(0.85 * volScale, t + 0.03);
      rollGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      rollNoise.connect(rollFilter);
      rollFilter.connect(rollGain);
      rollGain.connect(this.masterGain);
      rollNoise.start(t);

      // 2. GRAND STRIKE IMPACT AT PINS (hitTime = t + 0.09s)
      const hitTime = t + 0.09;

      // A. Deep Sub-Bass Ball Impact Punch ("콰쾅!!")
      const impactOsc = this.ctx.createOscillator();
      const impactGain = this.ctx.createGain();
      impactOsc.type = 'triangle';
      impactOsc.frequency.setValueAtTime(460 - (strikeIdx * 15), hitTime);
      impactOsc.frequency.exponentialRampToValueAtTime(36, hitTime + 0.24);

      impactGain.gain.setValueAtTime(1.0 * volScale, hitTime);
      impactGain.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.35);

      impactOsc.connect(impactGain);
      impactGain.connect(this.masterGain);
      impactOsc.start(hitTime);
      impactOsc.stop(hitTime + 0.36);

      // B. REALISTIC 10 PINS CRASHING & TUMBLING (10개 핀 고유 타격음 및 연쇄 충돌)
      const tenPins = [
        { freq: 520,  delay: 0.00, vol: 0.95 }, // Pin 1 (Headpin direct hit)
        { freq: 780,  delay: 0.01, vol: 0.90 }, // Pin 2
        { freq: 840,  delay: 0.02, vol: 0.90 }, // Pin 3
        { freq: 1250, delay: 0.03, vol: 0.85 }, // Pin 4
        { freq: 1680, delay: 0.05, vol: 0.85 }, // Pin 5
        { freq: 2150, delay: 0.07, vol: 0.80 }, // Pin 6
        { freq: 2800, delay: 0.09, vol: 0.80 }, // Pin 7
        { freq: 3600, delay: 0.12, vol: 0.75 }, // Pin 8
        { freq: 4500, delay: 0.15, vol: 0.70 }, // Pin 9
        { freq: 5600, delay: 0.18, vol: 0.65 }, // Pin 10 (Corner pin fly-off)
      ];

      tenPins.forEach(({ freq, delay: pinDelay, vol }, pinIdx) => {
        if (!this.ctx || !this.masterGain) return;
        const pTime = hitTime + pinDelay;
        const pOsc = this.ctx.createOscillator();
        const pGain = this.ctx.createGain();

        pOsc.type = pinIdx % 2 === 0 ? 'triangle' : 'sine';
        const actualFreq = freq + (Math.random() - 0.5) * 70;
        pOsc.frequency.setValueAtTime(actualFreq, pTime);
        pOsc.frequency.exponentialRampToValueAtTime(actualFreq * 0.55, pTime + 0.32);

        pGain.gain.setValueAtTime(0, pTime);
        pGain.gain.linearRampToValueAtTime(vol * volScale, pTime + 0.004);
        pGain.gain.exponentialRampToValueAtTime(0.0001, pTime + 0.32);

        pOsc.connect(pGain);
        pGain.connect(this.masterGain);

        pOsc.start(pTime);
        pOsc.stop(pTime + 0.33);
      });

      // C. 10 Pins Tumbling & Sliding Deck Noise ("와르르르챵!!")
      const scatterBufSize = Math.floor(this.ctx.sampleRate * 0.42);
      const scatterBuf = this.ctx.createBuffer(1, scatterBufSize, this.ctx.sampleRate);
      const scatterData = scatterBuf.getChannelData(0);
      for (let i = 0; i < scatterBufSize; i++) {
        scatterData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.09));
      }
      const scatterNoise = this.ctx.createBufferSource();
      scatterNoise.buffer = scatterBuf;

      const scatterFilter = this.ctx.createBiquadFilter();
      scatterFilter.type = 'bandpass';
      scatterFilter.frequency.setValueAtTime(2200 + (strikeIdx * 100), hitTime);
      scatterFilter.Q.value = 1.2;

      const scatterGain = this.ctx.createGain();
      scatterGain.gain.setValueAtTime(0.95 * volScale, hitTime);
      scatterGain.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.40);

      scatterNoise.connect(scatterFilter);
      scatterFilter.connect(scatterGain);
      scatterGain.connect(this.masterGain);
      scatterNoise.start(hitTime);
    });

    // 3. Triumphant Final Echo Shimmer (10-pin strike clear ring out)
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      const sOsc = this.ctx.createOscillator();
      const sGain = this.ctx.createGain();

      sOsc.type = 'sine';
      sOsc.frequency.setValueAtTime(freq, now + 2.4);

      sGain.gain.setValueAtTime(0, now + 2.4);
      sGain.gain.linearRampToValueAtTime(0.32, now + 2.48);
      sGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.4);

      sOsc.connect(sGain);
      sGain.connect(this.masterGain);

      sOsc.start(now + 2.4);
      sOsc.stop(now + 3.45);
    });
  }

  // Mobile Haptic Feedback Helper
  public triggerHaptic(pattern: number | number[] = 25) {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (e) {
      // Ignore vibration errors
    }
  }

  // Loud & Explosive Neon Bubble Pop SFX ("팡! 팡!" 시원하고 크고 강렬한 네온 폭발 팝핑음)
  public playPop(pitch: number = 1.0) {
    this.triggerHaptic(20);
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // 1. Heavy Sub-Bass "콰쾅!" Impact Punch (극강의 타격감 묵직한 저음 펀치)
    const punchOsc = this.ctx.createOscillator();
    const punchGain = this.ctx.createGain();
    punchOsc.type = 'triangle';
    punchOsc.frequency.setValueAtTime(520 * pitch, now);
    punchOsc.frequency.exponentialRampToValueAtTime(24 * pitch, now + 0.22);

    punchGain.gain.setValueAtTime(2.2, now);
    punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    punchOsc.connect(punchGain);
    punchGain.connect(this.masterGain);
    punchOsc.start(now);
    punchOsc.stop(now + 0.25);

    // 2. Bright Explosive White Noise Burst ("팍-! 콰광-!")
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.20);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.040));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2800 * pitch, now);
    noiseFilter.Q.value = 0.9;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(2.0, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.20);

    noise.connect(noiseFilter);
    noiseFilter.connect(this.masterGain);
    noise.start(now);

    // 3. High Neon Synth Bubble Pop Chirp ("뿅~/삐융-")
    const popOsc = this.ctx.createOscillator();
    const popGain = this.ctx.createGain();

    popOsc.type = 'sawtooth';
    const baseFreq = (550 + Math.random() * 200) * pitch;
    popOsc.frequency.setValueAtTime(baseFreq, now);
    popOsc.frequency.exponentialRampToValueAtTime(baseFreq * 3.8, now + 0.14);

    popGain.gain.setValueAtTime(1.6, now);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    popOsc.connect(popGain);
    popGain.connect(this.masterGain);

    popOsc.start(now);
    popOsc.stop(now + 0.18);

    // 4. Sparkling Harmonic Overtone Ring
    const sparkleOsc = this.ctx.createOscillator();
    const sparkleGain = this.ctx.createGain();
    sparkleOsc.type = 'sine';
    sparkleOsc.frequency.setValueAtTime(2200 * pitch, now + 0.01);
    sparkleOsc.frequency.exponentialRampToValueAtTime(4200 * pitch, now + 0.16);

    sparkleGain.gain.setValueAtTime(0, now);
    sparkleGain.gain.setValueAtTime(1.2, now + 0.01);
    sparkleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    sparkleOsc.connect(sparkleGain);
    sparkleGain.connect(this.masterGain);
    sparkleOsc.start(now + 0.01);
    sparkleOsc.stop(now + 0.20);
  }

  // Alias for Neon Pop
  public playNeonPop(pitch: number = 1.0) {
    this.playPop(pitch);
  }

  // Fireworks Blast SFX
  public playFirework() {
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // Low boom
    const boomOsc = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(160, now);
    boomOsc.frequency.exponentialRampToValueAtTime(30, now + 0.4);

    boomGain.gain.setValueAtTime(0.6, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    boomOsc.connect(boomGain);
    boomGain.connect(this.masterGain);
    boomOsc.start(now);
    boomOsc.stop(now + 0.5);

    // Sparkle high pings
    for (let i = 0; i < 8; i++) {
      const timeOffset = now + 0.05 + Math.random() * 0.3;
      const ping = this.ctx.createOscillator();
      const pingGain = this.ctx.createGain();

      ping.type = 'sine';
      ping.frequency.setValueAtTime(1200 + Math.random() * 2000, timeOffset);

      pingGain.gain.setValueAtTime(0.15, timeOffset);
      pingGain.gain.exponentialRampToValueAtTime(0.0001, timeOffset + 0.15);

      ping.connect(pingGain);
      pingGain.connect(this.masterGain);
      ping.start(timeOffset);
      ping.stop(timeOffset + 0.2);
    }
  }

  // --- AMBIENT SOUNDSCAPES ---

  public toggleRain(enable: boolean, volume: number = 0.5) {
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    if (enable && !this.rainNoiseNode) {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1);
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(volume * 0.5, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(this.rainGain);
      this.rainGain.connect(this.masterGain);

      whiteNoise.start();
      this.rainNoiseNode = whiteNoise;
    } else if (!enable && this.rainNoiseNode) {
      if (this.rainGain && this.ctx) {
        this.rainGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      }
      setTimeout(() => {
        if (this.rainNoiseNode) {
          (this.rainNoiseNode as AudioBufferSourceNode).stop();
          this.rainNoiseNode.disconnect();
          this.rainNoiseNode = null;
        }
      }, 500);
    } else if (enable && this.rainGain && this.ctx) {
      this.rainGain.gain.linearRampToValueAtTime(volume * 0.5, this.ctx.currentTime + 0.2);
    }
  }

  public toggleOcean(enable: boolean, volume: number = 0.5) {
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    if (enable && !this.oceanNoiseNode) {
      const bufferSize = this.ctx.sampleRate * 3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
      }

      const pinkNoise = this.ctx.createBufferSource();
      pinkNoise.buffer = buffer;
      pinkNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';

      // LFO for ocean wave swell
      this.oceanLfo = this.ctx.createOscillator();
      this.oceanLfo.frequency.value = 0.12; // wave every ~8 sec

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 400;

      this.oceanLfo.connect(lfoGain);
      filter.frequency.value = 350;
      lfoGain.connect(filter.frequency);

      this.oceanGain = this.ctx.createGain();
      this.oceanGain.gain.setValueAtTime(volume * 0.6, this.ctx.currentTime);

      pinkNoise.connect(filter);
      filter.connect(this.oceanGain);
      this.oceanGain.connect(this.masterGain);

      pinkNoise.start();
      this.oceanLfo.start();
      this.oceanNoiseNode = pinkNoise;
    } else if (!enable && this.oceanNoiseNode) {
      if (this.oceanGain && this.ctx) {
        this.oceanGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      }
      setTimeout(() => {
        if (this.oceanNoiseNode) {
          (this.oceanNoiseNode as AudioBufferSourceNode).stop();
          this.oceanNoiseNode.disconnect();
          this.oceanNoiseNode = null;
        }
        if (this.oceanLfo) {
          this.oceanLfo.stop();
          this.oceanLfo = null;
        }
      }, 500);
    } else if (enable && this.oceanGain && this.ctx) {
      this.oceanGain.gain.linearRampToValueAtTime(volume * 0.6, this.ctx.currentTime + 0.2);
    }
  }

  public toggleBowl(enable: boolean, volume: number = 0.5) {
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    if (enable && !this.bowlOsc1) {
      // 528 Hz Solfeggio frequency + 532 Hz binaural beat
      this.bowlOsc1 = this.ctx.createOscillator();
      this.bowlOsc2 = this.ctx.createOscillator();

      this.bowlOsc1.type = 'sine';
      this.bowlOsc2.type = 'sine';

      this.bowlOsc1.frequency.value = 528.0;
      this.bowlOsc2.frequency.value = 531.5; // 3.5 Hz Theta binaural beat for deep relaxation

      this.bowlGain = this.ctx.createGain();
      this.bowlGain.gain.setValueAtTime(volume * 0.3, this.ctx.currentTime);

      this.bowlOsc1.connect(this.bowlGain);
      this.bowlOsc2.connect(this.bowlGain);
      this.bowlGain.connect(this.masterGain);

      this.bowlOsc1.start();
      this.bowlOsc2.start();
    } else if (!enable && this.bowlOsc1) {
      if (this.bowlGain && this.ctx) {
        this.bowlGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      }
      setTimeout(() => {
        if (this.bowlOsc1) {
          this.bowlOsc1.stop();
          this.bowlOsc1 = null;
        }
        if (this.bowlOsc2) {
          this.bowlOsc2.stop();
          this.bowlOsc2 = null;
        }
      }, 500);
    } else if (enable && this.bowlGain && this.ctx) {
      this.bowlGain.gain.linearRampToValueAtTime(volume * 0.3, this.ctx.currentTime + 0.2);
    }
  }
}

export const audioSynth = new AudioSynthesizer();
