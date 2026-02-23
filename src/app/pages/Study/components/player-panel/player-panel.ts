import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from '../../../../shared/app-material/app-material-module';
import { MusicLoaderComponent } from '../music-loader/music-loader';
import { StudyPlayerPanelState } from '../../study/study.models';

@Component({
  selector: 'app-study-player-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AppMaterialModule, MusicLoaderComponent],
  templateUrl: './player-panel.html',
  styleUrl: './player-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudyPlayerPanelComponent {
  @Input({ required: true }) state!: StudyPlayerPanelState;

  @Output() play = new EventEmitter<void>();
  @Output() pause = new EventEmitter<void>();
  @Output() stop = new EventEmitter<void>();
  @Output() togglePlayerExpanded = new EventEmitter<void>();
  @Output() setTempo = new EventEmitter<number>();
  @Output() toggleMetronome = new EventEmitter<void>();
  @Output() setMetronomeVolume = new EventEmitter<number>();
  @Output() toggleLoop = new EventEmitter<void>();
  @Output() applyLoop = new EventEmitter<void>();
  @Output() loopStartMeasureChange = new EventEmitter<number | null>();
  @Output() loopEndMeasureChange = new EventEmitter<number | null>();

  @Output() instrumentCardCollapsedChange = new EventEmitter<boolean>();
  @Output() toggleInstrument = new EventEmitter<{ id: string; checked: boolean }>();
  @Output() selectOnlyInstrument = new EventEmitter<string>();
  @Output() selectAllInstruments = new EventEmitter<void>();
  @Output() restoreAppliedInstruments = new EventEmitter<void>();
  @Output() applySelectedInstruments = new EventEmitter<void>();
  @Output() cancelInstrumentSelection = new EventEmitter<void>();
  @Output() openInstrumentSelection = new EventEmitter<void>();
}
