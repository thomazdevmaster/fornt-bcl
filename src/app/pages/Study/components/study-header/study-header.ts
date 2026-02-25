import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from '../../../../shared/app-material/app-material-module';
import { StudyHeaderState } from '../../study/study.models';

@Component({
  selector: 'app-study-header',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppMaterialModule],
  templateUrl: './study-header.html',
  styleUrl: './study-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudyHeaderComponent {
  @Input({ required: true }) state!: StudyHeaderState;

  @Output() loadById = new EventEmitter<string>();
  @Output() backToExamples = new EventEmitter<void>();
  @Output() selectExample = new EventEmitter<string>();
  @Output() selectSong = new EventEmitter<string>();

  handleLoad() {
    this.loadById.emit(this.state.idControl.value || '');
  }
}
