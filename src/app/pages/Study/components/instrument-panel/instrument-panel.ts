import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from '../../../../shared/app-material/app-material-module';
import { InstrumentPanelState } from '../../study/study.models';

export interface StudyInstrument {
  id: string;
  name: string;
  iconPath: string;
  title: string;
}

@Component({
  selector: 'app-study-instrument-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppMaterialModule],
  templateUrl: './instrument-panel.html',
  styleUrl: './instrument-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudyInstrumentPanelComponent {
  @Input({ required: true }) state!: InstrumentPanelState;
  @Input({ required: true }) loading = false;
  @Input({ required: true }) xmlLoaded = false;
  /** Quando true, usa como menu lateral: sem header interno e conteúdo sempre visível. */
  @Input() sidebarMode = false;

  @Output() instrumentCardCollapsedChange = new EventEmitter<boolean>();
  @Output() toggleInstrument = new EventEmitter<{ id: string; checked: boolean }>();
  @Output() selectOnlyInstrument = new EventEmitter<string>();
  @Output() selectAllInstruments = new EventEmitter<void>();
  @Output() restoreAppliedInstruments = new EventEmitter<void>();
  @Output() applySelectedInstruments = new EventEmitter<void>();
  @Output() cancelInstrumentSelection = new EventEmitter<void>();
  @Output() openInstrumentSelection = new EventEmitter<void>();
  @Output() closePanel = new EventEmitter<void>();

  isInstrumentSelected(id: string): boolean {
    return this.state.selectedInstrumentIds.includes(id);
  }

  onSelectAllChange(checked: boolean) {
    if (checked) this.selectAllInstruments.emit();
    else this.restoreAppliedInstruments.emit();
  }

  toggleCollapse() {
    this.instrumentCardCollapsedChange.emit(!this.state.instrumentCardCollapsed);
  }
}
