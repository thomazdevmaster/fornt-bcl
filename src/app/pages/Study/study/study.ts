import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AppMaterialModule } from '../../../shared/app-material/app-material-module';
import { MatSliderModule } from '@angular/material/slider';
import { StudyService } from '../services/study.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, firstValueFrom } from 'rxjs';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { Player, VerovioConverter, VerovioRenderer } from 'musicxml-player';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { extractInstrumentsFromXml, extractTempoInfoFromXml, filterXmlByPartIds } from './study.utils';
import { StudyPlayerController } from './study.player-controller';

@Component({
  selector: 'app-study',
  standalone: true,
  imports: [CommonModule, RouterModule, AppMaterialModule, MatSliderModule, ReactiveFormsModule, FormsModule],
  templateUrl: './study.html',
  styleUrl: './study.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  private currentScoreNameSig = signal('Nenhuma selecionada');
  get currentScoreName() { return this.currentScoreNameSig(); }
  set currentScoreName(value: string) { this.currentScoreNameSig.set(value); }
  private loadingSig = signal(false);
  private errorSig = signal<string | null>(null);
  private playerReadySig = signal(false);
  private xmlLoadedSig = signal(false);
  private midiLoadedSig = signal(false);
  private midiLoadingSig = signal(false);
  private playerLoadingSig = signal(false);
  private playerErrorSig = signal<string | null>(null);

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
  private availableInstrumentsSig = signal<{ id: string; name: string; iconPath: string; title: string }[]>([]);
  private selectedInstrumentIdsSig = signal<string[]>([]);
  get availableInstruments() { return this.availableInstrumentsSig(); }
  set availableInstruments(value: { id: string; name: string; iconPath: string; title: string }[]) {
    this.availableInstrumentsSig.set(value);
  }
  get selectedInstrumentIds() { return this.selectedInstrumentIdsSig(); }
  set selectedInstrumentIds(value: string[]) { this.selectedInstrumentIdsSig.set(value); }
  private lastAppliedInstrumentIds: string[] = [];
  private showInstrumentSelectionSig = signal(true);
  private instrumentCardCollapsedSig = signal(false);
  private playerExpandedSig = signal(false);
  private fullscreenScoreSig = signal(false);

  get showInstrumentSelection() { return this.showInstrumentSelectionSig(); }
  set showInstrumentSelection(value: boolean) { this.showInstrumentSelectionSig.set(value); }
  get instrumentCardCollapsed() { return this.instrumentCardCollapsedSig(); }
  set instrumentCardCollapsed(value: boolean) { this.instrumentCardCollapsedSig.set(value); }
  get playerExpanded() { return this.playerExpandedSig(); }
  set playerExpanded(value: boolean) { this.playerExpandedSig.set(value); }
  get fullscreenScore() { return this.fullscreenScoreSig(); }
  set fullscreenScore(value: boolean) { this.fullscreenScoreSig.set(value); }
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
  private playerController = new StudyPlayerController();

  get metronomeEnabled() { return this.playerController.metronomeEnabled; }
  set metronomeEnabled(value: boolean) { this.playerController.metronomeEnabled = value; }
  get metronomeVolume() { return this.playerController.metronomeVolume; }
  set metronomeVolume(value: number) { this.playerController.metronomeVolume = value; }

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
    const tempoInfo = extractTempoInfoFromXml(xml);
    this.baseBpm = tempoInfo?.bpm ?? 100;
    this.timeSignature = tempoInfo?.timeSignature ?? '4/4';
    this.beatsPerMeasure = tempoInfo?.beatsPerMeasure ?? 4;
    this.beatUnit = tempoInfo?.beatUnit ?? 4;
    this.bpm = this.baseBpm;
    this.tempo = this.bpm / this.baseBpm;
    this.updateBpmRange();
    if (this.metronomeEnabled) this.restartMetronome();
    this.availableInstruments = extractInstrumentsFromXml(xml);
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
      this.playerController.player = this.player;
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
    this.playerController.player = null;
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
        ? filterXmlByPartIds(this.sourceXml, selectedIds)
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

  // XML parsing helpers moved to study.utils.ts
}
