import { ElementRef, Injectable, signal, computed } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { Player, VerovioConverter, VerovioRenderer } from 'musicxml-player';
import { StudyService } from './study.service';
import { extractTempoInfoFromXml, filterXmlByPartIds } from '../study/study.utils';
import { StudyPlayerController } from '../study/study.player-controller';
import { STUDY_EXAMPLES } from '../study/study.config';
import { InstrumentPanelState, StudyPlayerPanelState, StudyViewModel } from '../study/study.models';
import { StudyInstrumentService } from './study-instrument.service';

@Injectable()
export class StudyFacadeService {
  constructor(
    private readonly studyService: StudyService,
    private readonly snackBar: MatSnackBar,
    private readonly instrumentService: StudyInstrumentService
  ) {}

  private scoreContainerRef: ElementRef<HTMLDivElement> | null = null;
  setScoreContainer(ref: ElementRef<HTMLDivElement>) {
    this.scoreContainerRef = ref;
  }

  readonly idControl = new FormControl('');
  readonly exampleOptions = STUDY_EXAMPLES;

  private selectedExampleIdSig = signal<string | null>(null);
  private currentScoreNameSig = signal('Nenhuma selecionada');
  private loadingSig = signal(false);
  private errorSig = signal<string | null>(null);
  private playerReadySig = signal(false);
  private xmlLoadedSig = signal(false);
  private midiLoadedSig = signal(false);
  private midiLoadingSig = signal(false);
  private playerLoadingSig = signal(false);
  private playerErrorSig = signal<string | null>(null);
  private scoreLoadingSig = signal(false);
  private bpmSig = signal(100);
  private timeSignatureSig = signal('4/4');
  private bpmMinSig = signal(40);
  private bpmMaxSig = signal(200);
  private baseBpmSig = signal(100);
  private loopEnabledSig = signal(false);
  private loopStartMeasureSig = signal<number | null>(null);
  private loopEndMeasureSig = signal<number | null>(null);
  private metronomeEnabledSig = signal(false);
  private metronomeVolumeSig = signal(0.5);
  private playerExpandedSig = signal(false);
  private fullscreenScoreSig = signal(false);

  get selectedExampleId() { return this.selectedExampleIdSig(); }
  set selectedExampleId(value: string | null) { this.selectedExampleIdSig.set(value); }
  get currentScoreName() { return this.currentScoreNameSig(); }
  set currentScoreName(value: string) { this.currentScoreNameSig.set(value); }
  get loading() { return this.loadingSig(); }
  set loading(value: boolean) { this.loadingSig.set(value); }
  get error() { return this.errorSig(); }
  set error(value: string | null) { this.errorSig.set(value); }
  get playerReady() { return this.playerReadySig(); }
  set playerReady(value: boolean) { this.playerReadySig.set(value); }
  get xmlLoaded() { return this.xmlLoadedSig(); }
  set xmlLoaded(value: boolean) { this.xmlLoadedSig.set(value); }
  get midiLoaded() { return this.midiLoadedSig(); }
  set midiLoaded(value: boolean) { this.midiLoadedSig.set(value); }
  get midiLoading() { return this.midiLoadingSig(); }
  set midiLoading(value: boolean) { this.midiLoadingSig.set(value); }
  get playerLoading() { return this.playerLoadingSig(); }
  set playerLoading(value: boolean) { this.playerLoadingSig.set(value); }
  get playerError() { return this.playerErrorSig(); }
  set playerError(value: string | null) { this.playerErrorSig.set(value); }
  get scoreLoading() { return this.scoreLoadingSig(); }
  set scoreLoading(value: boolean) { this.scoreLoadingSig.set(value); }
  get bpm() { return this.bpmSig(); }
  set bpm(value: number) { this.bpmSig.set(value); }
  get bpmMin() { return this.bpmMinSig(); }
  set bpmMin(value: number) { this.bpmMinSig.set(value); }
  get bpmMax() { return this.bpmMaxSig(); }
  set bpmMax(value: number) { this.bpmMaxSig.set(value); }
  get timeSignature() { return this.timeSignatureSig(); }
  set timeSignature(value: string) { this.timeSignatureSig.set(value); }
  get baseBpm() { return this.baseBpmSig(); }
  set baseBpm(value: number) { this.baseBpmSig.set(value); }
  get loopEnabled() { return this.loopEnabledSig(); }
  set loopEnabled(value: boolean) { this.loopEnabledSig.set(value); }
  get loopStartMeasure() { return this.loopStartMeasureSig(); }
  set loopStartMeasure(value: number | null) { this.loopStartMeasureSig.set(value); }
  get loopEndMeasure() { return this.loopEndMeasureSig(); }
  set loopEndMeasure(value: number | null) { this.loopEndMeasureSig.set(value); }
  get playerExpanded() { return this.playerExpandedSig(); }
  set playerExpanded(value: boolean) { this.playerExpandedSig.set(value); }
  get fullscreenScore() { return this.fullscreenScoreSig(); }
  set fullscreenScore(value: boolean) { this.fullscreenScoreSig.set(value); }
  get instrumentCardCollapsed() { return this.instrumentService.instrumentCardCollapsed; }
  set instrumentCardCollapsed(value: boolean) { this.instrumentService.instrumentCardCollapsed = value; }
  get metronomeEnabled() { return this.metronomeEnabledSig(); }
  set metronomeEnabled(value: boolean) {
    this.metronomeEnabledSig.set(value);
    this.playerController.metronomeEnabled = value;
  }
  get metronomeVolume() { return this.metronomeVolumeSig(); }
  set metronomeVolume(value: number) {
    this.metronomeVolumeSig.set(value);
    this.playerController.metronomeVolume = value;
  }

  private loopTimer: number | null = null;
  private loopStartTs: number | null = null;
  private loopEndTs: number | null = null;
  tempo = 1.0;
  isPlaying = false;
  beatsPerMeasure = 4;
  beatUnit = 4;
  private sourceXml: string | null = null;
  private currentScoreId = 'local';
  private xmlCache = new Map<string, string>();
  private midiCache = new Map<string, ArrayBuffer>();
  private lastRenderedSelectionKey: string | null = null;
  private currentRenderedXml: string | null = null;
  private midiPrefetchScheduled = false;
  private midiWarmupScheduled = false;
  private xmlPrefetchScheduled = false;
  private player: any = null;
  private hiddenPlayerContainer: HTMLElement | null = null;
  private midiOnlyMode = false;
  private osmd: OpenSheetMusicDisplay | null = null;
  private workletPatched = false;
  private scrollPatched = false;
  private playerController = new StudyPlayerController();
  private loadToken = 0;

  readonly viewModel = computed<StudyViewModel>(() => ({
    header: {
      idControl: this.idControl,
      xmlLoaded: this.xmlLoaded,
      showInitialContent: !this.xmlLoaded && !this.scoreLoading && !this.selectedExampleId,
      initialContent: {
        selectedExampleId: this.selectedExampleId,
        exampleOptions: this.exampleOptions,
      },
    },
    player: this.playerPanelState,
    score: {
      currentScoreName: this.currentScoreName,
      scoreLoading: this.scoreLoading,
      error: this.error,
      xmlLoaded: this.xmlLoaded,
      fullscreenScore: this.fullscreenScore,
    },
  }));

  private get instrumentPanelState(): InstrumentPanelState {
    const state = this.instrumentService.panelState();
    return {
      availableInstruments: state.availableInstruments,
      selectedInstrumentIds: state.selectedInstrumentIds,
      filteredInstruments: state.filteredInstruments,
      selectionMatchesApplied: state.selectionMatchesApplied,
      showInstrumentSelection: state.showInstrumentSelection,
      instrumentCardCollapsed: state.instrumentCardCollapsed,
      allInstrumentsSelected: state.allInstrumentsSelected,
      selectedInstrumentSummary: state.selectedInstrumentSummary,
      instrumentFilterControl: state.instrumentFilterControl,
    };
  }

  private get playerPanelState(): StudyPlayerPanelState {
    return {
      loading: this.loading,
      playerReady: this.playerReady,
      playerLoading: this.playerLoading,
      midiLoaded: this.midiLoaded,
      midiLoading: this.midiLoading,
      playerExpanded: this.playerExpanded,
      playerError: this.playerError,
      bpm: this.bpm,
      bpmMin: this.bpmMin,
      bpmMax: this.bpmMax,
      timeSignature: this.timeSignature,
      baseBpm: this.baseBpm,
      metronomeEnabled: this.metronomeEnabled,
      metronomeVolume: this.metronomeVolume,
      loopEnabled: this.loopEnabled,
      loopStartMeasure: this.loopStartMeasure,
      loopEndMeasure: this.loopEndMeasure,
      instrument: this.instrumentPanelState,
    };
  }


  scheduleXmlPrefetch() {
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

  async loadStudy(id: string) {
    const token = ++this.loadToken;
    this.loading = true;
    this.scoreLoading = true;
    this.error = null;
    this.destroyPlayer();
    this.currentScoreId = id;
    this.currentScoreName = `ID ${id}`;

    try {
      const cachedXml = this.xmlCache.get(id);
      const xml = cachedXml ?? (await firstValueFrom(this.studyService.getMusicXmlById(id)));
      if (!cachedXml) this.xmlCache.set(id, xml);
      if (token !== this.loadToken) return;
      await this.prepareStudy(xml, id, token);
    } catch {
      if (token !== this.loadToken) return;
      await this.loadFallbackAssets(undefined, token);
    } finally {
      if (token === this.loadToken) {
        this.loading = false;
        this.scoreLoading = false;
      }
    }
  }

  async loadFallbackAssets(assetName: string = 'score.xml', token: number = ++this.loadToken) {
    this.loading = true;
    this.scoreLoading = true;
    this.error = null;
    this.destroyPlayer();
    try {
      if (token !== this.loadToken) return;
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
      if (token !== this.loadToken) return;
      await this.prepareStudy(xml, this.currentScoreId, token);
      this.error = null;
    } catch {
      if (token === this.loadToken) {
        this.error = 'Não foi possível carregar a partitura.';
        this.snackBar.open(this.error, 'Fechar', { duration: 4000 });
      }
    } finally {
      if (token === this.loadToken) {
        this.loading = false;
        this.scoreLoading = false;
      }
    }
  }

  selectExampleFromEmptyState(id: string) {
    this.selectedExampleId = id;
    this.currentScoreName = this.getExampleLabel(id);
    void this.loadFallbackAssets(id);
  }

  backToExamples() {
    this.loadToken++;
    this.destroyPlayer();
    this.clearScoreContainer();
    this.xmlLoaded = false;
    this.midiLoaded = false;
    this.midiLoading = false;
    this.playerReady = false;
    this.playerLoading = false;
    this.playerError = null;
    this.error = null;
    this.scoreLoading = false;
    this.instrumentService.reset();
    this.currentScoreId = 'local';
    this.currentScoreName = 'Nenhuma selecionada';
    this.currentRenderedXml = null;
    this.idControl.setValue('');
    this.selectedExampleId = null;
    this.pause();
  }

  toggleFullscreenScore() {
    this.fullscreenScore = !this.fullscreenScore;
  }

  togglePlayerExpanded() {
    this.playerExpanded = !this.playerExpanded;
  }

  play() { void this.playWithMidi(); }

  pause() {
    if (this.player?.pause) this.player.pause();
    this.isPlaying = false;
    this.stopLoopMonitor();
    this.stopMetronome();
  }

  stop() {
    if (this.player) {
      if (this.player?.pause) this.player.pause();
      if (this.player?.rewind) this.player.rewind();
      else if (this.player?.moveTo) this.player.moveTo(0, 0, 0);
    }
    this.isPlaying = false;
    this.stopLoopMonitor();
    this.stopMetronome();
  }

  destroy() {
    this.stop();
    this.destroyPlayer();
    this.clearScoreContainer();
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

  toggleLoop() {
    this.loopEnabled = !this.loopEnabled;
    this.applyLoop();
    if (this.loopEnabled && this.isPlaying) {
      this.startLoopMonitor();
    } else {
      this.stopLoopMonitor();
    }
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

  toggleInstrument(id: string, checked: boolean) {
    this.instrumentService.toggleInstrument(id, checked);
  }

  selectOnlyInstrument(id: string) {
    this.instrumentService.selectOnlyInstrument(id);
  }

  selectAllInstruments() {
    this.instrumentService.selectAllInstruments();
  }

  restoreAppliedInstruments() {
    this.instrumentService.restoreAppliedInstruments();
  }

  applySelectedInstruments() {
    if (!this.sourceXml || this.instrumentService.availableInstruments.length === 0) return;
    if (this.instrumentService.selectedInstrumentIds.length === 0) {
      this.instrumentService.handleEmptySelectionOnApply();
      return;
    }
    this.instrumentService.instrumentFilterControl.setValue('');
    this.instrumentService.showInstrumentSelection = false;
    void this.applyInstrumentSelection(this.currentScoreId);
  }

  openInstrumentSelection() {
    this.pause();
    this.instrumentService.openSelection();
  }

  cancelInstrumentSelection() {
    this.pause();
    this.instrumentService.cancelSelection();
  }

  private async prepareStudy(xml: string, id: string, token: number) {
    if (token !== this.loadToken) return;
    this.sourceXml = xml;
    this.currentRenderedXml = null;
    const tempoInfo = extractTempoInfoFromXml(xml);
    this.baseBpm = tempoInfo?.bpm ?? 100;
    this.timeSignature = tempoInfo?.timeSignature ?? '4/4';
    this.beatsPerMeasure = tempoInfo?.beatsPerMeasure ?? 4;
    this.beatUnit = tempoInfo?.beatUnit ?? 4;
    this.bpm = this.baseBpm;
    this.tempo = this.bpm / this.baseBpm;
    this.updateBpmRange();
    if (this.metronomeEnabled) this.restartMetronome();
    this.instrumentService.initializeFromXml(id, xml);
    await this.applyInstrumentSelection(id, token);
  }

  private async applyInstrumentSelection(id: string, token: number = this.loadToken) {
    if (!this.sourceXml) return;
    if (token !== this.loadToken) return;
    this.loading = true;
    this.scoreLoading = true;
    this.destroyPlayer();
    try {
      const availableInstruments = this.instrumentService.availableInstruments;
      const selectedIds =
        this.instrumentService.selectedInstrumentIds.length > 0
          ? this.instrumentService.selectedInstrumentIds
          : availableInstruments.map((instrument) => instrument.id);
      const selectionKey = selectedIds.slice().sort().join('|');
      if (selectionKey === this.lastRenderedSelectionKey && this.xmlLoaded) {
        this.loading = false;
        this.scoreLoading = false;
        return;
      }
      const shouldFilter =
        availableInstruments.length > 0 &&
        selectedIds.length > 0 &&
        selectedIds.length < availableInstruments.length;
      const xmlToUse = shouldFilter
        ? filterXmlByPartIds(this.sourceXml, selectedIds)
        : this.sourceXml;
      this.currentRenderedXml = xmlToUse;
      await this.renderScoreWithOsmd(xmlToUse, token);
      if (token !== this.loadToken) return;
      await this.initVerovioPlayerInHiddenContainer(xmlToUse, id, token);
      if (token !== this.loadToken) return;
      this.lastRenderedSelectionKey = selectionKey;
      this.instrumentService.markSelectionApplied(id, selectedIds);
      this.scheduleMidiPrefetch();
      this.scheduleMidiWarmup();
    } finally {
      if (token === this.loadToken) {
        this.loading = false;
        this.scoreLoading = false;
      }
    }
  }

  /** Renderiza a partitura com OSMD no container visível — independente do tamanho do arquivo. */
  private async renderScoreWithOsmd(xml: string, token: number) {
    if (token !== this.loadToken) return;
    const containerRef = this.scoreContainerRef;
    if (!containerRef?.nativeElement) return;
    this.scoreLoading = true;
    try {
      this.clearScoreContainer();
      const ready = await this.waitForScoreContainer(token);
      if (!ready || token !== this.loadToken) return;
      if (!this.osmd) {
        this.osmd = new OpenSheetMusicDisplay(containerRef.nativeElement, {
          drawingParameters: 'default',
          autoResize: true,
        });
      }
      await this.osmd.load(xml);
      await this.osmd.render();
      this.osmd.cursor?.show();
      this.osmd.cursor?.reset();
      if (token === this.loadToken) {
        this.xmlLoaded = true;
        this.scoreLoading = false;
      }
    } catch {
      if (token === this.loadToken) this.scoreLoading = false;
    }
  }

  /** Tenta criar o player Verovio em um container oculto; em falha (ex.: arquivo grande), usa modo MIDI-only. */
  private async initVerovioPlayerInHiddenContainer(xml: string, id: string, token: number) {
    if (token !== this.loadToken) return;
    this.playerReady = false;
    this.midiLoaded = false;
    this.playerError = null;
    this.midiOnlyMode = false;
    this.playerLoading = true;
    this.destroyVerovioAndHiddenContainer();
    try {
      this.patchAudioWorklet();
      this.patchScrollIntoView();
      const el = typeof document !== 'undefined' ? document.createElement('div') : null;
      if (!el) return;
      el.setAttribute('aria-hidden', 'true');
      el.style.setProperty('position', 'fixed');
      el.style.setProperty('left', '-9999px');
      el.style.setProperty('width', '1px');
      el.style.setProperty('height', '1px');
      el.style.setProperty('overflow', 'hidden');
      el.style.setProperty('pointer-events', 'none');
      document.body.appendChild(el);
      this.hiddenPlayerContainer = el;
      const converter = new (VerovioConverter as any)();
      const renderer = new (VerovioRenderer as any)();
      this.player = await (Player as any).create({
        container: el,
        musicXml: xml,
        converter,
        renderer,
        followCursor: false,
        velocity: this.tempo,
        repeat: this.loopEnabled ? -1 : 1,
      });
      if (token !== this.loadToken) {
        this.destroyVerovioAndHiddenContainer();
        return;
      }
      this.playerController.player = this.player;
      this.playerReady = true;
      this.applyTempo();
      this.applyLoop();
    } catch {
      this.destroyVerovioAndHiddenContainer();
      this.midiOnlyMode = true;
      this.playerReady = true;
      this.playerError = null;
    } finally {
      if (token === this.loadToken) this.playerLoading = false;
    }
  }

  private destroyVerovioAndHiddenContainer() {
    try {
      if (this.player?.pause) this.player.pause();
      if (this.player?.stop) this.player.stop();
      if (this.player?.destroy) this.player.destroy();
      if (this.player?.dispose) this.player.dispose();
      const ctx = (this.player as any)?.audioContext || (this.player as any)?._context;
      if (ctx?.close && ctx?.state !== 'closed') ctx.close();
    } catch {}
    this.player = null;
    this.playerController.player = null;
    if (this.hiddenPlayerContainer?.parentNode) {
      this.hiddenPlayerContainer.parentNode.removeChild(this.hiddenPlayerContainer);
    }
    this.hiddenPlayerContainer = null;
  }

  private async prepareMidiForPlayer(token: number) {
    if (token !== this.loadToken) return;
    if (!this.playerReady) return;
    if (this.midiLoaded) return;
    this.midiLoading = true;
    this.playerError = null;
    try {
      await this.loadMidiForCurrentScore(token);
      if (token !== this.loadToken) return;
      if (!this.midiLoaded) {
        this.playerError = this.midiOnlyMode ? 'MIDI não disponível para esta partitura.' : 'Player indisponível.';
        if (!this.midiOnlyMode) this.playerReady = false;
      }
    } catch {
      if (token === this.loadToken) {
        this.playerError = 'Player indisponível.';
        if (!this.midiOnlyMode) this.playerReady = false;
      }
    } finally {
      if (token === this.loadToken) this.midiLoading = false;
    }
  }

  private async playWithMidi() {
    if (this.isPlaying) return;

    const token = this.loadToken;
    await this.prepareMidiForPlayer(token);
    if (token !== this.loadToken || !this.midiLoaded) return;

    if (this.player) {
      if (this.player?.play) this.player.play();
      this.isPlaying = true;
      this.startLoopMonitor();
      if (this.metronomeEnabled) this.startMetronomeSync();
      return;
    }

    if (this.midiOnlyMode) {
      this.snackBar.open(
        'Partituras grandes: reprodução em desenvolvimento. Use "Baixar MIDI" quando disponível.',
        'Fechar',
        { duration: 5000 }
      );
      const midi = await this.getMidiBufferForCurrentScore();
      if (midi) this.triggerMidiDownload(midi);
    }
  }

  private triggerMidiDownload(midi: ArrayBuffer) {
    if (typeof document === 'undefined') return;
    const blob = new Blob([midi], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `partitura-${this.currentScoreId.replace(/^local:/, '')}.mid`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private async loadMidiForCurrentScore(token: number) {
    this.midiLoaded = false;
    const midi = await this.getMidiBufferForCurrentScore();
    if (!midi) return;
    if (this.player) {
      if (this.player?.loadMIDI) this.player.loadMIDI(midi);
      else if (this.player?.loadMidi) this.player.loadMidi(midi);
      else if (this.player?.setMidi) this.player.setMidi(midi);
    }
    this.midiLoaded = true;
  }

  private async getMidiBufferForCurrentScore(): Promise<ArrayBuffer | null> {
    if (this.currentScoreId.startsWith('local:')) {
      const cached = this.midiCache.get(this.currentScoreId);
      if (cached) return cached;
      const assetName = this.currentScoreId.replace('local:', '');
      const midiName = assetName.replace(/\.musicxml$/i, '.mid').replace(/\.xml$/i, '.mid');
      try {
        const res = await fetch(`assets/${midiName}?v=${Date.now()}`);
        if (!res.ok) return null;
        const buf = await res.arrayBuffer();
        this.midiCache.set(this.currentScoreId, buf);
        return buf;
      } catch {
        return null;
      }
    }
    const cached = this.midiCache.get(this.currentScoreId);
    if (cached) return cached;
    const midi = await this.tryGetMidi(this.currentScoreId);
    if (midi) this.midiCache.set(this.currentScoreId, midi);
    return midi;
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

  private clearScoreContainer() {
    this.osmd = null;
    const el = this.scoreContainerRef?.nativeElement;
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

  private updateBpmRange() {
    const base = Math.max(30, this.baseBpm);
    const min = Math.max(30, Math.round(base * 0.5));
    const max = Math.max(min + 10, Math.round(base * 2));
    this.bpmMin = min;
    this.bpmMax = max;
  }

  private applyTempo() {
    if (!this.player) return;
    if ('velocity' in this.player) this.player.velocity = this.tempo;
    if (this.metronomeEnabled) this.restartMetronome();
  }

  private startMetronome() {
    this.playerController.startMetronome(this.bpm, this.beatsPerMeasure);
  }

  private startMetronomeSync() {
    this.playerController.startMetronomeSync(this.bpm, this.beatsPerMeasure);
  }

  private stopMetronome() {
    this.playerController.stopMetronome();
  }

  private restartMetronome() {
    this.playerController.restartMetronome(this.isPlaying, this.bpm, this.beatsPerMeasure);
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

  private destroyPlayer() {
    this.destroyVerovioAndHiddenContainer();
    this.midiOnlyMode = false;
    this.isPlaying = false;
    this.playerReady = false;
    this.stopMetronome();
    this.stopLoopMonitor();
  }

  private async waitNextFrame() {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }

  private async waitForScoreContainer(token: number, maxTries: number = 30): Promise<boolean> {
    for (let i = 0; i < maxTries; i++) {
      if (token !== this.loadToken) return false;
      const ref = this.scoreContainerRef;
      if (ref?.nativeElement?.isConnected) return true;
      await this.waitNextFrame();
    }
    return false;
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

  /** Carrega MIDI no player em idle para o play responder na hora. */
  private scheduleMidiWarmup() {
    if (
      this.midiWarmupScheduled ||
      !this.playerReady ||
      this.midiLoaded ||
      this.midiLoading ||
      this.isPlaying
    )
      return;
    this.midiWarmupScheduled = true;
    const token = this.loadToken;
    const run = () => {
      this.midiWarmupScheduled = false;
      void this.prepareMidiForPlayer(token);
    };
    const idle = (window as any)?.requestIdleCallback;
    if (typeof idle === 'function') {
      idle(run, { timeout: 3000 });
    } else {
      window.setTimeout(run, 500);
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

  private getExampleLabel(assetName: string): string {
    const match = this.exampleOptions.find((option) => option.id === assetName);
    return match?.label || assetName;
  }

  private isMobileView() {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 600px)').matches;
  }
}
