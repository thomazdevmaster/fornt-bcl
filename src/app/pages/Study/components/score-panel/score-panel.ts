import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AppMaterialModule } from '../../../../shared/app-material/app-material-module';
import { MusicLoaderComponent } from '../../../../shared/components/music-loader/music-loader';
import { StudyScorePanelState } from '../../study/study.models';

@Component({
  selector: 'app-study-score-panel',
  standalone: true,
  imports: [CommonModule, AppMaterialModule, MusicLoaderComponent],
  templateUrl: './score-panel.html',
  styleUrl: './score-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudyScorePanelComponent {
  @ViewChild('osmdContainer', { static: true }) osmdContainer!: ElementRef<HTMLDivElement>;

  @Input({ required: true }) state!: StudyScorePanelState;
  @Input({ required: true }) loading = false;
  @Input({ required: true }) xmlLoaded = false;

  @Output() toggleFullscreen = new EventEmitter<void>();
}
