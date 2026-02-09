import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AppMaterialModule } from '../../../shared/app-material/app-material-module';
import { MatSliderModule } from '@angular/material/slider';
import { StudyService } from '../services/study.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, firstValueFrom } from 'rxjs';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { Player, VerovioConverter, VerovioRenderer } from 'musicxml-player';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';

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
  loading = false;
  error: string | null = null;
  playerReady = false;
  xmlLoaded = false;
  midiLoaded = false;
  playerError: string | null = null;
  private loopTimer: number | null = null;
  private loopStartTs: number | null = null;
  private loopEndTs: number | null = null;

  tempo = 1.0;
  isPlaying = false;
  loopEnabled = false;
  loopStartMeasure: number | null = null;
  loopEndMeasure: number | null = null;

  private osmd: OpenSheetMusicDisplay | null = null;
  private player: any = null;
  private routeSub?: Subscription;
  private cursorTimer: number | null = null;
  private baseBpm = 100;
  private workletPatched = false;
  private scrollPatched = false;

  ngOnInit() {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.idControl.setValue(id);
        void this.loadStudy(id);
      } else {
        // Carrega exemplo local por padrão se nenhum ID for informado
        void this.loadFallbackAssets();
      }
    });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
    this.destroyPlayer();
  }

  async loadStudy(id: string) {
    this.loading = true;
    this.error = null;
    this.destroyPlayer();

    try {
      const xml = await firstValueFrom(this.studyService.getMusicXmlById(id));
      await this.renderXml(xml);
      await this.initPlayer(xml, id);
    } catch (err: any) {
      await this.loadFallbackAssets();
    } finally {
      this.loading = false;
    }
  }

  async renderXml(xml: string) {
    if (!this.osmd) {
      this.osmd = new OpenSheetMusicDisplay(this.osmdContainer.nativeElement, {
        drawingParameters: 'compact',
        autoResize: true,
      });
    }

    await this.osmd.load(xml);
    await this.osmd.render();
    this.osmd.cursor?.show();
    this.osmd.cursor?.reset();
    this.xmlLoaded = true;
  }

  async initPlayer(xml: string, id: string) {
    this.playerReady = false;
    this.midiLoaded = false;
    this.playerError = null;
    try {
      this.clearScoreContainer();
      this.patchAudioWorklet();
      this.patchScrollIntoView();
      const converter = new (VerovioConverter as any)();
      const renderer = new (VerovioRenderer as any)();
      this.player = await (Player as any).create({
        container: this.osmdContainer.nativeElement,
        musicXml: xml,
        converter,
        renderer,
        followCursor: true,
        velocity: this.tempo,
        repeat: this.loopEnabled ? -1 : 1,
      });
      this.playerReady = true;
      this.xmlLoaded = true;
      this.midiLoaded = true;
      this.applyTempo();
      this.applyLoop();
    } catch (err: any) {
      this.player = null;
      this.playerReady = false;
      this.playerError = err?.message || 'Falha ao iniciar o player.';
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

  async loadFallbackAssets() {
    try {
      const bust = `?v=${Date.now()}`;
      const res = await fetch(`assets/score.xml${bust}`);
      if (!res.ok) throw new Error('musicxml_not_found');
      const xml = await res.text();
      if (!xml || xml.trim().length < 20) throw new Error('musicxml_empty');
      await this.renderXml(xml);

      const midiRes = await fetch(`assets/score.mid${bust}`);
      if (midiRes.ok) {
        const midi = await midiRes.arrayBuffer();
        await this.initPlayer(xml, 'local');
        if (this.player) {
          if (this.player?.loadMIDI) this.player.loadMIDI(midi);
          else if (this.player?.loadMidi) this.player.loadMidi(midi);
          else if (this.player?.setMidi) this.player.setMidi(midi);
          this.midiLoaded = true;
        }
      } else {
        await this.initPlayer(xml, 'local');
      }
      this.error = null;
    } catch {
      this.error = 'Não foi possível carregar a partitura.';
      this.snackBar.open(this.error, 'Fechar', { duration: 4000 });
    }
  }

  play() {
    if (!this.player) return;
    if (this.player?.play) this.player.play();
    this.isPlaying = true;
    this.startLoopMonitor();
  }

  pause() {
    if (!this.player) return;
    if (this.player?.pause) this.player.pause();
    this.isPlaying = false;
    this.stopLoopMonitor();
  }

  stop() {
    if (!this.player) return;
    if (this.player?.pause) this.player.pause();
    if (this.player?.rewind) this.player.rewind();
    else if (this.player?.moveTo) this.player.moveTo(0, 0, 0);
    this.isPlaying = false;
    this.stopLoopMonitor();
  }

  setTempo(event: any) {
    const value = typeof event === 'number' ? event : event?.value;
    if (value == null) return;
    this.tempo = value;
    this.applyTempo();
  }

  private applyTempo() {
    if (!this.player) return;
    if ('velocity' in this.player) this.player.velocity = this.tempo;
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
    this.stopLoopMonitor();
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
      const el = this as HTMLElement;
      const container = el?.closest?.('.score-container') as HTMLElement | null;
      if (container) {
        const elRect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const offsetTop = elRect.top - containerRect.top + container.scrollTop;
        const target =
          offsetTop - container.clientHeight / 2 + elRect.height / 2;
        const behavior =
          typeof arg === 'object' && arg?.behavior ? arg.behavior : 'smooth';
        container.scrollTo({
          top: Math.max(0, target),
          behavior,
        });
        return;
      }
      return original.call(this, arg as any);
    };
    this.scrollPatched = true;
  }
}
