export class StudyPlayerController {
  player: any = null;
  metronomeEnabled = false;
  metronomeVolume = 0.5;

  private metronomeTimer: number | null = null;
  private metronomeSyncTimer: number | null = null;
  private audioContext: AudioContext | null = null;
  private metronomeBeat = 0;
  private metronomeLastBeatIndex: number | null = null;
  private metronomeLastMeasureIndex: number | null = null;

  stopMetronome() {
    if (this.metronomeTimer) {
      window.clearInterval(this.metronomeTimer);
      this.metronomeTimer = null;
    }
    if (this.metronomeSyncTimer) {
      window.clearInterval(this.metronomeSyncTimer);
      this.metronomeSyncTimer = null;
    }
    this.metronomeBeat = 0;
    this.metronomeLastBeatIndex = null;
    this.metronomeLastMeasureIndex = null;
  }

  restartMetronome(isPlaying: boolean, bpm: number, beatsPerMeasure: number) {
    if (!this.metronomeEnabled) return;
    this.stopMetronome();
    if (isPlaying) this.startMetronomeSync(bpm, beatsPerMeasure);
    else this.startMetronome(bpm, beatsPerMeasure);
  }

  startMetronome(bpm: number, beatsPerMeasure: number) {
    if (this.metronomeTimer) return;
    this.ensureAudioContext();
    const interval = this.getMetronomeIntervalMs(bpm);
    this.metronomeBeat = 0;
    this.clickMetronome(true, beatsPerMeasure);
    this.metronomeTimer = window.setInterval(() => this.clickMetronome(false, beatsPerMeasure), interval);
  }

  startMetronomeSync(bpm: number, beatsPerMeasure: number) {
    if (this.metronomeSyncTimer) return;
    this.ensureAudioContext();
    this.metronomeLastBeatIndex = null;
    this.metronomeLastMeasureIndex = null;
    this.metronomeSyncTimer = window.setInterval(() => {
      if (!this.player) return;
      const posMs = this.getPlayerPositionMs(bpm);
      if (posMs == null) return;
      const beatInfo = this.getBeatIndexFromTimemap(posMs, beatsPerMeasure);
      if (!beatInfo) return;
      if (this.metronomeLastBeatIndex === beatInfo.globalBeat) return;
      const accent = beatInfo.beatInMeasure === 0;
      this.clickMetronome(accent, beatsPerMeasure);
      this.metronomeLastBeatIndex = beatInfo.globalBeat;
      this.metronomeLastMeasureIndex = beatInfo.measureIndex;
    }, 30);
  }

  private getMetronomeIntervalMs(bpm: number): number {
    const safeBpm = Math.max(30, bpm);
    return Math.round(60000 / safeBpm);
  }

  private ensureAudioContext() {
    if (this.audioContext) return;
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    this.audioContext = new AudioCtx();
  }

  private clickMetronome(forceAccent: boolean, beatsPerMeasure: number) {
    if (!this.audioContext) return;
    if (this.audioContext.state === 'suspended') {
      void this.audioContext.resume();
    }
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const isAccent = forceAccent || this.metronomeBeat === 0;
    osc.frequency.value = isAccent ? 1400 : 1000;
    const baseVol = Math.max(0, Math.min(1, this.metronomeVolume));
    const vol = isAccent ? Math.min(1, baseVol * 1.4) : baseVol;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
    this.metronomeBeat = (this.metronomeBeat + 1) % Math.max(1, beatsPerMeasure);
  }

  private getPlayerPositionMs(bpm: number): number | null {
    const pos = (this.player as any)?.position;
    if (pos == null || Number.isNaN(pos)) return null;
    const timemap = (this.player as any)?._options?.converter?.timemap;
    if (!Array.isArray(timemap) || timemap.length === 0) {
      return pos > 1000 ? pos : pos * 1000;
    }
    const last = timemap[timemap.length - 1];
    const lastTs = last?.timestamp ?? 0;
    const isMs = lastTs > 1000 || pos > 1000;
    return isMs ? pos : pos * 1000;
  }

  private getBeatIndexFromTimemap(posMs: number, beatsPerMeasure: number): {
    globalBeat: number;
    beatInMeasure: number;
    measureIndex: number;
  } | null {
    const timemap = (this.player as any)?._options?.converter?.timemap;
    if (!Array.isArray(timemap) || timemap.length === 0) return null;
    const beats = Math.max(1, beatsPerMeasure);

    let index = this.metronomeLastMeasureIndex ?? 0;
    if (index >= timemap.length) index = 0;

    const pos = posMs;
    const forward =
      index < timemap.length - 1 &&
      pos >= (timemap[index + 1]?.timestamp ?? Infinity);
    const backward = pos < (timemap[index]?.timestamp ?? 0);

    if (forward || backward) {
      index = 0;
      for (let i = 0; i < timemap.length - 1; i++) {
        const start = timemap[i]?.timestamp ?? 0;
        const nextStart = timemap[i + 1]?.timestamp ?? Infinity;
        if (pos >= start && pos < nextStart) {
          index = i;
          break;
        }
        if (pos < start) {
          index = Math.max(0, i - 1);
          break;
        }
      }
    }

    const current = timemap[index];
    if (!current) return null;
    const measureStart = current.timestamp ?? 0;
    let measureDuration = current.duration ?? 0;
    if (!measureDuration || measureDuration <= 0) {
      const next = timemap[index + 1];
      if (next?.timestamp != null) {
        const nextTs = next.timestamp;
        measureDuration = Math.max(0, nextTs - measureStart);
      }
    }
    if (!measureDuration || measureDuration <= 0) return null;

    const beatDuration = measureDuration / beats;
    const beatInMeasure = Math.min(
      beats - 1,
      Math.max(0, Math.floor((pos - measureStart) / beatDuration))
    );
    const globalBeat = index * beats + beatInMeasure;
    return { globalBeat, beatInMeasure, measureIndex: index };
  }
}
