import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit, ViewChild, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppMaterialModule } from '../../../shared/app-material/app-material-module';
import { StudyHeaderComponent } from '../components/study-header/study-header';
import { StudyPlayerPanelComponent } from '../components/player-panel/player-panel';
import { StudyScorePanelComponent } from '../components/score-panel/score-panel';
import { StudyInstrumentPanelComponent } from '../components/instrument-panel/instrument-panel';
import { StudyFacadeService } from '../services/study-facade.service';
import { StudyInstrumentService } from '../services/study-instrument.service';

@Component({
  selector: 'app-study',
  standalone: true,
  imports: [CommonModule, AppMaterialModule, StudyHeaderComponent, StudyPlayerPanelComponent, StudyScorePanelComponent, StudyInstrumentPanelComponent],
  templateUrl: './study.html',
  styleUrl: './study.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [StudyFacadeService, StudyInstrumentService],
})
export class StudyComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private facade = inject(StudyFacadeService);
  private doc = inject(DOCUMENT);
  readonly viewModel = this.facade.viewModel;

  constructor() {
    effect(() => {
      const vm = this.viewModel();
      const active = vm.score.fullscreenScore && vm.isMobile;
      const body = this.doc?.body;
      if (body) {
        body.classList.toggle('study-mobile-fullscreen-active', active);
      }
    });
  }

  private scorePanelRef?: StudyScorePanelComponent;
  @ViewChild(StudyScorePanelComponent)
  set scorePanel(ref: StudyScorePanelComponent | undefined) {
    if (!ref || ref === this.scorePanelRef) return;
    this.scorePanelRef = ref;
    this.facade.setScoreContainer(ref.osmdContainer);
  }

  private routeSub?: Subscription;
  private navSub?: Subscription;

  get xmlLoaded() { return this.facade.xmlLoaded; }
  get scoreLoading() { return this.facade.scoreLoading; }
  get selectedExampleId() { return this.facade.selectedExampleId; }

  readonly mobileSheetOpen = signal(false);
  openMobileSheet() { this.mobileSheetOpen.set(true); }
  closeMobileSheet() { this.mobileSheetOpen.set(false); }
  toggleMobileSheet() { this.mobileSheetOpen.update((v) => !v); }

  ngOnInit() {
    this.facade.updateMobileView();
    this.facade.loadSongOptions();
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.facade.idControl.setValue(id);
        this.facade.selectSongFromList(id);
      }
    });
    this.facade.scheduleXmlPrefetch();
    this.navSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        const leavingStudy = !event.url.startsWith('/study');
        if (leavingStudy) {
          this.facade.destroy();
        }
      }
    });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
    this.navSub?.unsubscribe();
    this.facade.destroy();
  }

  @HostListener('window:blur')
  onWindowBlur() {
    this.facade.pause();
  }

  @HostListener('window:resize')
  onResize() {
    this.facade.updateMobileView();
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange() {
    if (typeof document !== 'undefined' && document.hidden) {
      this.facade.pause();
    }
  }

  loadStudy(id: string) { void this.facade.loadStudy(id); }
  backToExamples() { this.facade.backToExamples(); }
  toggleFullscreenScore() { this.facade.toggleFullscreenScore(); }
  selectExampleFromEmptyState(id: string) { this.facade.selectExampleFromEmptyState(id); }
  selectSong(id: string) {
    this.facade.selectSongFromList(id);
    this.router.navigate(['/study', id], { replaceUrl: true });
  }
  togglePlayerExpanded() { this.facade.togglePlayerExpanded(); }
  play() { this.facade.play(); }
  pause() { this.facade.pause(); }
  stop() { this.facade.stop(); }
  setTempo(event: any) { this.facade.setTempo(event); }
  setAudioVolume(value: number) { this.facade.setAudioVolume(value); }
  toggleMetronome() { this.facade.toggleMetronome(); }
  setMetronomeVolume(event: any) { this.facade.setMetronomeVolume(event); }
  toggleLoop() { this.facade.toggleLoop(); }
  applyLoop() { this.facade.applyLoop(); }
  setLoopStartMeasure(value: number | null) { this.facade.loopStartMeasure = value; }
  setLoopEndMeasure(value: number | null) { this.facade.loopEndMeasure = value; }
  setInstrumentCardCollapsed(value: boolean) { this.facade.instrumentCardCollapsed = value; }
  toggleInstrument(id: string, checked: boolean) { this.facade.toggleInstrument(id, checked);
  }
  toggleInstrumentsMenu() {
    this.facade.instrumentCardCollapsed = !this.facade.instrumentCardCollapsed;
  }
  selectOnlyInstrument(id: string) { this.facade.selectOnlyInstrument(id); }
  selectAllInstruments() { this.facade.selectAllInstruments(); }
  restoreAppliedInstruments() { this.facade.restoreAppliedInstruments(); }
  applySelectedInstruments() { this.facade.applySelectedInstruments(); }
  cancelInstrumentSelection() { this.facade.cancelInstrumentSelection(); }
  openInstrumentSelection() { this.facade.openInstrumentSelection(); }
}
