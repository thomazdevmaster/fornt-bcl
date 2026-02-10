import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AppMaterialModule } from '../../../shared/app-material/app-material-module';
import { MatSliderModule } from '@angular/material/slider';
import { StudyService } from '../services/study.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, firstValueFrom } from 'rxjs';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { Player, VerovioConverter, VerovioRenderer } from 'musicxml-player';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DEFAULT_INSTRUMENT_METADATA, resolveInstrumentMetadata } from '../../Instruments/Helpers/instrument-helper';

@Component({
  selector: 'app-study',
  standalone: true,
  imports: [CommonModule, RouterModule, AppMaterialModule, MatSliderModule, ReactiveFormsModule, FormsModule],
  templateUrl: './study.html',
  styleUrl: './study.scss',
})
export class StudyComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private studyService = inject(StudyService);
  private snackBar = inject(MatSnackBar);

  @ViewChild('osmdContainer', { static: true }) osmdContainer!: ElementRef<HTMLDivElement>;

  idControl = new FormControl('');
  instrumentFilterControl = new FormControl('');
  exampleControl = new FormControl('score.xml');
  exampleOptions = [
    { id: 'score.xml', label: 'Hino Francisco Diniz' },
    { id: 'nossa.xml', label: 'Hino de Nossa Senhora' },
    { id: 'vento.musicxml', label: 'Vento Ventania' },
    { id: 'rock.musicxml', label: 'Rock you like a hurricane' },
    { id: 'vila.musicxml', label: 'Vila do sossego' }
  ];
  selectedExampleId: string | null = null;
  currentScoreName = 'Nenhuma selecionada';
  loading = false;
  error: string | null = null;
  playerReady = false;
  xmlLoaded = false;
  midiLoaded = false;
  midiLoading = false;
  playerLoading = false;
  playerError: string | null = null;
  private loopTimer: number | null = null;
  private loopStartTs: number | null = null;
  private loopEndTs: number | null = null;

  tempo = 1.0;
  bpm = 100;
  timeSignature = '4/4';
  beatsPerMeasure = 4;
  beatUnit = 4;
  bpmMin = 40;
  bpmMax = 200;
  isPlaying = false;
  loopEnabled = false;
  loopStartMeasure: number | null = null;
  loopEndMeasure: number | null = null;
  availableInstruments: { id: string; name: string; iconPath: string; title: string }[] = [];
  selectedInstrumentIds: string[] = [];
  private lastAppliedInstrumentIds: string[] = [];
  showInstrumentSelection = true;
  instrumentCardCollapsed = false;
  playerExpanded = false;
  fullscreenScore = false;
  private sourceXml: string | null = null;
  private currentScoreId = 'local';
  private xmlCache = new Map<string, string>();
  private midiCache = new Map<string, ArrayBuffer>();
  private lastRenderedSelectionKey: string | null = null;
  private midiPrefetchScheduled = false;
  private xmlPrefetchScheduled = false;

  private osmd: OpenSheetMusicDisplay | null = null;
  private player: any = null;
  private routeSub?: Subscription;
  private cursorTimer: number | null = null;
  baseBpm = 100;
  private workletPatched = false;
  private scrollPatched = false;
  metronomeEnabled = false;
  metronomeVolume = 0.5;
  private metronomeTimer: number | null = null;
  private metronomeSyncTimer: number | null = null;
  private audioContext: AudioContext | null = null;
  private metronomeBeat = 0;
  private metronomeLastBeatIndex: number | null = null;
  private metronomeLastMeasureIndex: number | null = null;

  ngOnInit() {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.idControl.setValue(id);
        void this.loadStudy(id);
      }
    });
    this.scheduleXmlPrefetch();
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
    this.stopMetronome();
    this.destroyPlayer();
  }

  async loadStudy(id: string) {
    this.loading = true;
    this.error = null;
    this.destroyPlayer();
    this.currentScoreId = id;
    this.currentScoreName = `ID ${id}`;

    try {
      const cachedXml = this.xmlCache.get(id);
      const xml = cachedXml ?? (await firstValueFrom(this.studyService.getMusicXmlById(id)));
      if (!cachedXml) this.xmlCache.set(id, xml);
      await this.prepareStudy(xml, id);
    } catch (err: any) {
      await this.loadFallbackAssets();
    } finally {
      this.loading = false;
    }
  }

  async renderXml(xml: string) {
    if (!this.osmd) {
      this.osmd = new OpenSheetMusicDisplay(this.osmdContainer.nativeElement, {
        drawingParameters: 'default',
        autoResize: true,
      });
    }

    await this.osmd.load(xml);
    await this.osmd.render();
    this.osmd.cursor?.show();
    this.osmd.cursor?.reset();
    this.xmlLoaded = true;
  }

  private async prepareStudy(xml: string, id: string) {
    this.sourceXml = xml;
    const tempoInfo = this.extractTempoInfoFromXml(xml);
    this.baseBpm = tempoInfo?.bpm ?? 100;
    this.timeSignature = tempoInfo?.timeSignature ?? '4/4';
    this.beatsPerMeasure = tempoInfo?.beatsPerMeasure ?? 4;
    this.beatUnit = tempoInfo?.beatUnit ?? 4;
    this.bpm = this.baseBpm;
    this.tempo = this.bpm / this.baseBpm;
    this.updateBpmRange();
    if (this.metronomeEnabled) this.restartMetronome();
    this.availableInstruments = this.extractInstruments(xml);
    const availableIds = new Set(this.availableInstruments.map((instrument) => instrument.id));
    const stored = this.readStoredSelection(id).filter((instrumentId) => availableIds.has(instrumentId));
    this.selectedInstrumentIds =
      stored.length > 0
        ? stored
        : this.availableInstruments.map((instrument) => instrument.id);
    this.lastAppliedInstrumentIds = [...this.selectedInstrumentIds];
    this.showInstrumentSelection = false;
    await this.applyInstrumentSelection(id);
  }

  async initPlayer(xml: string, id: string) {
    this.playerReady = false;
    this.midiLoaded = false;
    this.playerError = null;
    this.playerLoading = true;
    try {
      this.clearScoreContainer();
      this.patchAudioWorklet();
      this.patchScrollIntoView();
      await this.waitNextFrame();
      const container = this.osmdContainer?.nativeElement;
      if (!container || !container.isConnected) {
        await this.waitNextFrame();
      }
      const safeContainer = this.osmdContainer?.nativeElement;
      if (!safeContainer || !safeContainer.isConnected) {
        throw new Error('score_container_not_ready');
      }
      const converter = new (VerovioConverter as any)();
      const renderer = new (VerovioRenderer as any)();
      this.player = await (Player as any).create({
        container: safeContainer,
        musicXml: xml,
        converter,
        renderer,
        followCursor: !this.isMobileView(),
        velocity: this.tempo,
        repeat: this.loopEnabled ? -1 : 1,
      });
      this.playerReady = true;
      this.xmlLoaded = true;
      this.applyTempo();
      this.applyLoop();
    } catch (err: any) {
      this.player = null;
      this.playerReady = false;
      this.playerError =
        err?.message === 'score_container_not_ready'
          ? 'Contêiner da partitura indisponível.'
          : err?.message || 'Falha ao iniciar o player.';
    } finally {
      this.playerLoading = false;
    }
  }

  private async tryGetMidi(id: string): Promise<ArrayBuffer | null> {
    try {
      return await firstValueFrom(this.studyService.getMidiById(id));
    } catch {
      try {
        return await firstValueFrom(this.studyService.generateMidiFromXml(id));
      } catch {
        return null;
      }
    }
  }

  async loadFallbackAssets(assetName: string = 'score.xml') {
    this.loading = true;
    this.error = null;
    this.destroyPlayer();
    try {
      const bust = `?v=${Date.now()}`;
      const safeAsset = assetName?.trim() || 'score.xml';
      const cacheKey = `local:${safeAsset}`;
      const cachedXml = this.xmlCache.get(cacheKey);
      const cachedMidi = this.midiCache.get(cacheKey);
      const xmlPromise = cachedXml
        ? Promise.resolve(cachedXml)
        : fetch(`assets/${safeAsset}${bust}`).then(async (res) => {
            if (!res.ok) throw new Error('musicxml_not_found');
            return await res.text();
          });
      const midiName = safeAsset.replace(/\.musicxml$/i, '.mid').replace(/\.xml$/i, '.mid');
      const midiPromise = cachedMidi
        ? Promise.resolve(cachedMidi)
        : fetch(`assets/${midiName}${bust}`)
            .then(async (res) => (res.ok ? await res.arrayBuffer() : null))
            .catch(() => null);
      const [xml, midi] = await Promise.all([xmlPromise, midiPromise]);
      if (!xml || xml.trim().length < 20) throw new Error('musicxml_empty');
      this.currentScoreId = cacheKey;
      this.currentScoreName = this.getExampleLabel(safeAsset);
      this.xmlCache.set(this.currentScoreId, xml);
      if (midi) this.midiCache.set(this.currentScoreId, midi);
      await this.prepareStudy(xml, this.currentScoreId);
      this.error = null;
    } catch {
      this.error = 'Não foi possível carregar a partitura.';
      this.snackBar.open(this.error, 'Fechar', { duration: 4000 });
    } finally {
      this.loading = false;
    }
  }

  onExampleChange() {
    if (this.route.snapshot.paramMap.get('id')) return;
    const selected = this.exampleControl.value || 'score.xml';
    this.currentScoreName = this.getExampleLabel(selected);
    this.clearScoreContainer();
    this.xmlLoaded = false;
    this.midiLoaded = false;
    this.playerReady = false;
    this.stopMetronome();
  }

  selectExampleFromEmptyState(id: string) {
    if (this.route.snapshot.paramMap.get('id')) return;
    this.selectedExampleId = id;
    this.exampleControl.setValue(id);
    this.currentScoreName = this.getExampleLabel(id);
    void this.loadFallbackAssets(id);
  }

  private getExampleLabel(assetName: string): string {
    const match = this.exampleOptions.find((option) => option.id === assetName);
    return match?.label || assetName;
  }

  play() {
    void this.playWithMidi();
  }

  private async playWithMidi() {
    if (!this.player || this.isPlaying) return;
    if (!this.midiLoaded) {
      this.midiLoading = true;
      try {
        await this.loadMidiForCurrentScore();
      } finally {
        this.midiLoading = false;
      }
    }
    if (this.player?.play) this.player.play();
    this.isPlaying = true;
    this.startLoopMonitor();
    if (this.metronomeEnabled) {
      this.startMetronomeSync();
    }
  }

  pause() {
    if (!this.player) return;
    if (this.player?.pause) this.player.pause();
    this.isPlaying = false;
    this.stopLoopMonitor();
    this.stopMetronome();
  }

  stop() {
    if (!this.player) return;
    if (this.player?.pause) this.player.pause();
    if (this.player?.rewind) this.player.rewind();
    else if (this.player?.moveTo) this.player.moveTo(0, 0, 0);
    this.isPlaying = false;
    this.stopLoopMonitor();
    this.stopMetronome();
  }

  toggleMetronome() {
    this.metronomeEnabled = !this.metronomeEnabled;
    if (this.metronomeEnabled) this.startMetronome();
    else this.stopMetronome();
  }

  setMetronomeVolume(event: any) {
    const value = typeof event === 'number' ? event : event?.value;
    if (value == null) return;
    this.metronomeVolume = value;
  }

  setTempo(event: any) {
    const value = typeof event === 'number' ? event : event?.value;
    if (value == null) return;
    this.bpm = value;
    this.tempo = this.bpm / this.baseBpm;
    this.applyTempo();
  }

  private startMetronome() {
    if (this.metronomeTimer) return;
    this.ensureAudioContext();
    const interval = this.getMetronomeIntervalMs();
    this.metronomeBeat = 0;
    this.clickMetronome(true);
    this.metronomeTimer = window.setInterval(() => this.clickMetronome(), interval);
  }

  private startMetronomeSync() {
    if (this.metronomeSyncTimer) return;
    this.ensureAudioContext();
    this.metronomeLastBeatIndex = null;
    this.metronomeLastMeasureIndex = null;
    this.metronomeSyncTimer = window.setInterval(() => {
      if (!this.player) return;
      const posMs = this.getPlayerPositionMs();
      if (posMs == null) return;
      const beatInfo = this.getBeatIndexFromTimemap(posMs);
      if (!beatInfo) return;
      if (this.metronomeLastBeatIndex === beatInfo.globalBeat) return;
      const accent = beatInfo.beatInMeasure === 0;
      this.clickMetronome(accent);
      this.metronomeLastBeatIndex = beatInfo.globalBeat;
      this.metronomeLastMeasureIndex = beatInfo.measureIndex;
    }, 30);
  }

  private stopMetronome() {
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

  private restartMetronome() {
    if (!this.metronomeEnabled) return;
    this.stopMetronome();
    if (this.isPlaying) this.startMetronomeSync();
    else this.startMetronome();
  }

  private getMetronomeIntervalMs(): number {
    const bpm = Math.max(30, this.bpm);
    return Math.round(60000 / bpm);
  }

  private getPlayerPositionMs(): number | null {
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

  private getBeatIndexFromTimemap(posMs: number): {
    globalBeat: number;
    beatInMeasure: number;
    measureIndex: number;
  } | null {
    const timemap = (this.player as any)?._options?.converter?.timemap;
    if (!Array.isArray(timemap) || timemap.length === 0) return null;
    const beatsPerMeasure = Math.max(1, this.beatsPerMeasure);

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

    const beatDuration = measureDuration / beatsPerMeasure;
    const beatInMeasure = Math.min(
      beatsPerMeasure - 1,
      Math.max(0, Math.floor((pos - measureStart) / beatDuration))
    );
    const globalBeat = index * beatsPerMeasure + beatInMeasure;
    return { globalBeat, beatInMeasure, measureIndex: index };
  }

  private updateBpmRange() {
    const base = Math.max(30, this.baseBpm);
    const min = Math.max(30, Math.round(base * 0.5));
    const max = Math.max(min + 10, Math.round(base * 2));
    this.bpmMin = min;
    this.bpmMax = max;
  }

  private ensureAudioContext() {
    if (this.audioContext) return;
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    this.audioContext = new AudioCtx();
  }

  private clickMetronome(forceAccent = false) {
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
    this.metronomeBeat = (this.metronomeBeat + 1) % Math.max(1, this.beatsPerMeasure);
  }

  private applyTempo() {
    if (!this.player) return;
    if ('velocity' in this.player) this.player.velocity = this.tempo;
    if (this.metronomeEnabled) this.restartMetronome();
  }

  toggleLoop() {
    this.loopEnabled = !this.loopEnabled;
    this.applyLoop();
    if (this.loopEnabled && this.isPlaying) {
      this.startLoopMonitor();
    } else {
      this.stopLoopMonitor();
    }
  }

  setLoopStartFromCursor() {
    this.loopStartMeasure = this.loopStartMeasure ?? 1;
    this.applyLoop();
  }

  setLoopEndFromCursor() {
    this.loopEndMeasure = this.loopEndMeasure ?? 2;
    this.applyLoop();
  }

  applyLoop() {
    if (!this.player) return;
    if ('repeat' in this.player) this.player.repeat = this.loopEnabled ? -1 : 1;
    if (!this.loopEnabled) {
      this.loopStartTs = null;
      this.loopEndTs = null;
      return;
    }
    this.computeLoopTimestamps();
    if (this.isPlaying) {
      this.stopLoopMonitor();
      this.startLoopMonitor();
      if (this.metronomeEnabled) this.restartMetronome();
    }
  }

  private getCursorMeasure(): number {
    // Sem cursor do OSMD, usamos último valor definido pelo usuário
    return 0;
  }

  private destroyPlayer() {
    if (this.player?.stop) this.player.stop();
    this.player = null;
    this.isPlaying = false;
    this.playerReady = false;
    this.stopMetronome();
    this.stopLoopMonitor();
  }

  @HostListener('window:blur')
  onWindowBlur() {
    this.pause();
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange() {
    if (typeof document !== 'undefined' && document.hidden) {
      this.pause();
    }
  }

  private computeLoopTimestamps() {
    if (!this.player) return;
    const timemap = (this.player as any)?._options?.converter?.timemap;
    if (!timemap || !this.loopStartMeasure || !this.loopEndMeasure) {
      this.loopStartTs = null;
      this.loopEndTs = null;
      return;
    }
    const startMeasure = (this.loopStartMeasure ?? 0) - 1;
    const endMeasure = (this.loopEndMeasure ?? 0) - 1;
    if (startMeasure < 0 || endMeasure < 0) {
      this.loopStartTs = null;
      this.loopEndTs = null;
      return;
    }
    const startEntry = timemap.find((t: any) => t.measure === startMeasure);
    const endEntry = timemap.find((t: any) => t.measure === endMeasure);
    this.loopStartTs = startEntry?.timestamp ?? null;
    this.loopEndTs =
      endEntry?.timestamp != null ? endEntry.timestamp + (endEntry.duration ?? 0) : null;
  }

  private startLoopMonitor() {
    if (this.loopTimer || !this.loopEnabled || this.loopStartTs == null || this.loopEndTs == null)
      return;
    this.loopTimer = window.setInterval(() => {
      if (!this.player) return;
      const pos = (this.player as any).position;
      if (pos != null && this.loopEndTs != null && pos >= this.loopEndTs) {
        const measure = this.loopStartMeasure ?? 0;
        const start = this.loopStartTs ?? 0;
        if (this.player?.moveTo) this.player.moveTo(measure, start, 0);
        if (this.metronomeEnabled) this.restartMetronome();
      }
    }, 120);
  }

  private stopLoopMonitor() {
    if (this.loopTimer) {
      window.clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
  }

  private clearScoreContainer() {
    const el = this.osmdContainer?.nativeElement;
    if (!el) return;
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  private patchAudioWorklet() {
    if (this.workletPatched || typeof window === 'undefined') return;
    const awProto = (window as any).AudioWorklet?.prototype;
    if (!awProto?.addModule) return;
    const original = awProto.addModule;
    awProto.addModule = function (moduleURL: string | URL, options?: any) {
      try {
        const url = typeof moduleURL === 'string' ? moduleURL : moduleURL?.toString?.();
        if (url && url.includes('spessasynth_processor.js')) {
          return original.call(this, '/spessasynth_processor.js', options);
        }
      } catch {
        // fallback to original module url
      }
      return original.call(this, moduleURL as any, options);
    };
    this.workletPatched = true;
  }

  private patchScrollIntoView() {
    if (this.scrollPatched || typeof window === 'undefined') return;
    const proto = (window as any).Element?.prototype;
    if (!proto?.scrollIntoView) return;
    const original = proto.scrollIntoView;
    proto.scrollIntoView = function (
      arg?: boolean | ScrollIntoViewOptions
    ) {
      try {
        const el = this as HTMLElement;
        const container = el?.closest?.('.score-container') as HTMLElement | null;
        const containerHeight = container?.clientHeight;
        if (!container || !containerHeight || !container.getBoundingClientRect || !el.getBoundingClientRect) {
          return original.call(this, arg as any);
        }
        const elRect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const offsetTop = elRect.top - containerRect.top + container.scrollTop;
        const target =
          offsetTop - containerHeight / 2 + elRect.height / 2;
        const behavior =
          typeof arg === 'object' && arg?.behavior ? arg.behavior : 'smooth';
        container.scrollTo({
          top: Math.max(0, target),
          behavior,
        });
        return;
      } catch {
        return original.call(this, arg as any);
      }
    };
    this.scrollPatched = true;
  }

  onInstrumentSelectionChange() {
    if (!this.sourceXml || this.availableInstruments.length === 0) return;
    if (this.selectedInstrumentIds.length === 0) {
      this.snackBar.open('Selecione ao menos um instrumento.', 'Fechar', { duration: 3000 });
      this.selectedInstrumentIds = [...this.lastAppliedInstrumentIds];
      return;
    }
  }

  toggleInstrument(id: string, checked: boolean) {
    const selected = new Set(this.selectedInstrumentIds);
    if (checked) selected.add(id);
    else selected.delete(id);
    this.selectedInstrumentIds = Array.from(selected);
    this.onInstrumentSelectionChange();
  }

  selectOnlyInstrument(id: string) {
    this.selectedInstrumentIds = [id];
    this.onInstrumentSelectionChange();
  }

  selectAllInstruments() {
    if (this.availableInstruments.length === 0) return;
    this.selectedInstrumentIds = this.availableInstruments.map((instrument) => instrument.id);
    this.onInstrumentSelectionChange();
  }

  restoreAppliedInstruments() {
    if (this.lastAppliedInstrumentIds.length === 0) return;
    this.selectedInstrumentIds = [...this.lastAppliedInstrumentIds];
    this.onInstrumentSelectionChange();
  }

  get selectedInstrumentSummary(): string {
    if (this.selectedInstrumentIds.length === 0) return 'Nenhum';
    const selected = new Set(this.selectedInstrumentIds);
    const names = this.availableInstruments
      .filter((instrument) => selected.has(instrument.id))
      .map((instrument) => instrument.name);
    if (names.length <= 2) return names.join(', ');
    return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
  }

  get allInstrumentsSelected(): boolean {
    return (
      this.availableInstruments.length > 0 &&
      this.selectedInstrumentIds.length === this.availableInstruments.length
    );
  }

  get selectionMatchesApplied(): boolean {
    if (this.selectedInstrumentIds.length !== this.lastAppliedInstrumentIds.length) return false;
    const current = new Set(this.selectedInstrumentIds);
    return this.lastAppliedInstrumentIds.every((id) => current.has(id));
  }

  get hasScoreLoaded(): boolean {
    return this.xmlLoaded && !this.loading;
  }

  applySelectedInstruments() {
    if (!this.sourceXml || this.availableInstruments.length === 0) return;
    if (this.selectedInstrumentIds.length === 0) {
      this.snackBar.open('Selecione ao menos um instrumento.', 'Fechar', { duration: 3000 });
      this.selectedInstrumentIds = [...this.lastAppliedInstrumentIds];
      return;
    }
    this.instrumentFilterControl.setValue('');
    this.showInstrumentSelection = false;
    void this.applyInstrumentSelection(this.currentScoreId);
  }

  openInstrumentSelection() {
    this.instrumentFilterControl.setValue('');
    this.pause();
    this.showInstrumentSelection = true;
    this.instrumentCardCollapsed = false;
  }

  cancelInstrumentSelection() {
    this.selectedInstrumentIds = [...this.lastAppliedInstrumentIds];
    this.instrumentFilterControl.setValue('');
    this.pause();
    this.showInstrumentSelection = false;
  }

  togglePlayerExpanded() {
    this.playerExpanded = !this.playerExpanded;
  }

  backToExamples() {
    this.destroyPlayer();
    this.clearScoreContainer();
    this.xmlLoaded = false;
    this.midiLoaded = false;
    this.midiLoading = false;
    this.playerReady = false;
    this.availableInstruments = [];
    this.selectedInstrumentIds = [];
    this.lastAppliedInstrumentIds = [];
    this.currentScoreId = 'local';
    this.currentScoreName = 'Nenhuma selecionada';
    this.idControl.setValue('');
    this.showInstrumentSelection = false;
  }

  toggleFullscreenScore() {
    this.fullscreenScore = !this.fullscreenScore;
  }

  private isMobileView() {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 600px)').matches;
  }

  private async applyInstrumentSelection(id: string) {
    if (!this.sourceXml) return;
    this.loading = true;
    this.destroyPlayer();
    try {
      const selectedIds =
        this.selectedInstrumentIds.length > 0
          ? this.selectedInstrumentIds
          : this.availableInstruments.map((instrument) => instrument.id);
      const selectionKey = selectedIds.slice().sort().join('|');
      if (selectionKey === this.lastRenderedSelectionKey && this.playerReady) {
        this.loading = false;
        return;
      }
      const shouldFilter =
        this.availableInstruments.length > 0 &&
        selectedIds.length > 0 &&
        selectedIds.length < this.availableInstruments.length;
      const xmlToUse = shouldFilter
        ? this.filterXmlByPartIds(this.sourceXml, selectedIds)
        : this.sourceXml;
      await this.renderXml(xmlToUse);
      await this.waitNextFrame();
      await this.initPlayer(xmlToUse, id);
      this.lastAppliedInstrumentIds = [...selectedIds];
      this.lastRenderedSelectionKey = selectionKey;
      this.persistSelection(id, selectedIds);
      this.scheduleMidiPrefetch();
    } finally {
      this.loading = false;
    }
  }

  private async loadMidiForCurrentScore() {
    this.midiLoaded = false;
    if (!this.player) return;
    if (this.currentScoreId.startsWith('local:')) {
      const cached = this.midiCache.get(this.currentScoreId);
      if (!cached) return;
      if (this.player?.loadMIDI) this.player.loadMIDI(cached);
      else if (this.player?.loadMidi) this.player.loadMidi(cached);
      else if (this.player?.setMidi) this.player.setMidi(cached);
      this.midiLoaded = true;
      return;
    }

    const cached = this.midiCache.get(this.currentScoreId);
    const midi = cached ?? (await this.tryGetMidi(this.currentScoreId));
    if (!midi) return;
    if (!cached) this.midiCache.set(this.currentScoreId, midi);
    if (this.player?.loadMIDI) this.player.loadMIDI(midi);
    else if (this.player?.loadMidi) this.player.loadMidi(midi);
    else if (this.player?.setMidi) this.player.setMidi(midi);
    this.midiLoaded = true;
  }

  private scheduleXmlPrefetch() {
    if (this.xmlPrefetchScheduled) return;
    this.xmlPrefetchScheduled = true;
    const run = () => {
      this.xmlPrefetchScheduled = false;
      void this.prefetchExampleXmls();
    };
    const idle = (window as any)?.requestIdleCallback;
    if (typeof idle === 'function') {
      idle(run, { timeout: 2000 });
    } else {
      window.setTimeout(run, 0);
    }
  }

  private async prefetchExampleXmls() {
    if (typeof window === 'undefined') return;
    const bust = `?v=${Date.now()}`;
    await Promise.all(
      this.exampleOptions.map(async (example) => {
        const cacheKey = `local:${example.id}`;
        if (this.xmlCache.has(cacheKey)) return;
        try {
          const res = await fetch(`assets/${example.id}${bust}`);
          if (!res.ok) return;
          const xml = await res.text();
          if (xml && xml.trim().length > 20) {
            this.xmlCache.set(cacheKey, xml);
          }
        } catch {
          return;
        }
      })
    );
  }

  private async waitNextFrame() {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }

  private scheduleMidiPrefetch() {
    if (this.midiPrefetchScheduled || this.midiLoading || this.midiLoaded || this.isPlaying) return;
    this.midiPrefetchScheduled = true;
    const run = () => {
      this.midiPrefetchScheduled = false;
      void this.prefetchMidiForCurrentScore();
    };
    const idle = (window as any)?.requestIdleCallback;
    if (typeof idle === 'function') {
      idle(run, { timeout: 1500 });
    } else {
      window.setTimeout(run, 0);
    }
  }

  private async prefetchMidiForCurrentScore() {
    if (this.midiLoading || this.midiLoaded || this.isPlaying) return;
    if (this.currentScoreId.startsWith('local:')) {
      if (this.midiCache.has(this.currentScoreId)) return;
      const assetName = this.currentScoreId.replace('local:', '');
      const midiName = assetName.replace(/\.musicxml$/i, '.mid').replace(/\.xml$/i, '.mid');
      try {
        const res = await fetch(`assets/${midiName}?v=${Date.now()}`);
        if (!res.ok) return;
        const midi = await res.arrayBuffer();
        this.midiCache.set(this.currentScoreId, midi);
      } catch {
        return;
      }
      return;
    }
    if (this.midiCache.has(this.currentScoreId)) return;
    const midi = await this.tryGetMidi(this.currentScoreId);
    if (midi) this.midiCache.set(this.currentScoreId, midi);
  }

  get filteredInstruments(): { id: string; name: string; iconPath: string; title: string }[] {
    const raw = this.instrumentFilterControl.value || '';
    const query = raw.toString().trim().toLowerCase();
    if (!query) return this.availableInstruments;
    return this.availableInstruments.filter((instrument) =>
      instrument.name.toLowerCase().includes(query)
    );
  }

  isInstrumentSelected(id: string): boolean {
    return this.selectedInstrumentIds.includes(id);
  }

  private storageKey(id: string): string {
    return `study_instruments_${id}`;
  }

  private readStoredSelection(id: string): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(this.storageKey(id));
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string') : [];
    } catch {
      return [];
    }
  }

  private persistSelection(id: string, selection: string[]) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(this.storageKey(id), JSON.stringify(selection));
    } catch {
      // ignore storage errors
    }
  }

  private extractInstruments(xml: string): { id: string; name: string; iconPath: string; title: string }[] {
    if (typeof window === 'undefined') return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const parserError = doc.querySelector('parsererror');
    if (parserError) return [];
    const scoreParts = Array.from(doc.querySelectorAll('part-list > score-part'));
    return scoreParts
      .map((part) => {
        const id = part.getAttribute('id') || '';
        const partName = part.querySelector('part-name')?.textContent?.trim() || '';
        const instrumentName =
          part.querySelector('score-instrument > instrument-name')?.textContent?.trim() || '';
        const partAbbrev = part.querySelector('part-abbreviation')?.textContent?.trim() || '';
        const instrumentAbbrev =
          part.querySelector('score-instrument > instrument-abbreviation')?.textContent?.trim() || '';
        const candidates = [partName, instrumentName, partAbbrev, instrumentAbbrev].filter(Boolean);
        const meta = this.resolveInstrumentMeta(candidates);
        const fallbackName = candidates[0] || 'Instrumento';
        return {
          id,
          name: meta?.name || fallbackName,
          iconPath: meta?.iconPath || DEFAULT_INSTRUMENT_METADATA.iconPath,
          title: meta?.title || fallbackName,
        };
      })
      .filter((part) => part.id);
  }

  private resolveInstrumentMeta(names: string[]) {
    for (const name of names) {
      const meta = resolveInstrumentMetadata(name);
      if (meta) return meta;
    }
    return null;
  }

  private extractTempoInfoFromXml(xml: string): {
    bpm: number | null;
    timeSignature: string | null;
    beatsPerMeasure: number | null;
    beatUnit: number | null;
  } | null {
    if (typeof window === 'undefined') return null;
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const parserError = doc.querySelector('parsererror');
    if (parserError) return null;
    let bpm: number | null = null;
    const soundTempo = doc.querySelector('sound[tempo]')?.getAttribute('tempo');
    if (soundTempo) {
      const parsed = Number(soundTempo);
      if (!Number.isNaN(parsed) && parsed > 0) bpm = parsed;
    }
    const metronome = doc.querySelector('metronome > per-minute')?.textContent?.trim();
    if (metronome) {
      const parsed = Number(metronome);
      if (!Number.isNaN(parsed) && parsed > 0) bpm = parsed;
    }
    const beats = doc.querySelector('time > beats')?.textContent?.trim();
    const beatType = doc.querySelector('time > beat-type')?.textContent?.trim();
    const beatsPerMeasure = beats ? Number(beats) : null;
    const beatUnit = beatType ? Number(beatType) : null;
    const timeSignature =
      beatsPerMeasure && beatUnit ? `${beatsPerMeasure}/${beatUnit}` : null;
    return { bpm, timeSignature, beatsPerMeasure, beatUnit };
  }

  private filterXmlByPartIds(xml: string, selectedIds: string[]): string {
    if (typeof window === 'undefined') return xml;
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const parserError = doc.querySelector('parsererror');
    if (parserError) return xml;
    const selected = new Set(selectedIds);
    const scoreParts = Array.from(doc.querySelectorAll('part-list > score-part'));
    scoreParts.forEach((part) => {
      const id = part.getAttribute('id') || '';
      if (id && !selected.has(id)) {
        part.remove();
      }
    });
    const parts = Array.from(doc.querySelectorAll('part'));
    parts.forEach((part) => {
      const id = part.getAttribute('id') || '';
      if (id && !selected.has(id)) {
        part.remove();
      }
    });
    return new XMLSerializer().serializeToString(doc);
  }
}
