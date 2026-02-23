import { Injectable, computed, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';

import { InstrumentPanelState } from '../study/study.models';
import { extractInstrumentsFromXml } from '../study/study.utils';
import { StudyInstrument } from '../components/instrument-panel/instrument-panel';

@Injectable()
export class StudyInstrumentService {
  constructor(private readonly snackBar: MatSnackBar) {}

  readonly instrumentFilterControl = new FormControl<string | null>('');
  private readonly instrumentFilterValueSig = toSignal(
    this.instrumentFilterControl.valueChanges,
    { initialValue: this.instrumentFilterControl.value }
  );

  private readonly availableInstrumentsSig = signal<StudyInstrument[]>([]);
  private readonly selectedInstrumentIdsSig = signal<string[]>([]);
  private readonly showInstrumentSelectionSig = signal(false);
  private readonly instrumentCardCollapsedSig = signal(true);

  private lastAppliedInstrumentIds: string[] = [];

  get availableInstruments(): StudyInstrument[] {
    return this.availableInstrumentsSig();
  }
  set availableInstruments(value: StudyInstrument[]) {
    this.availableInstrumentsSig.set(value);
  }

  get selectedInstrumentIds(): string[] {
    return this.selectedInstrumentIdsSig();
  }
  set selectedInstrumentIds(value: string[]) {
    this.selectedInstrumentIdsSig.set(value);
  }

  get showInstrumentSelection(): boolean {
    return this.showInstrumentSelectionSig();
  }
  set showInstrumentSelection(value: boolean) {
    this.showInstrumentSelectionSig.set(value);
  }

  get instrumentCardCollapsed(): boolean {
    return this.instrumentCardCollapsedSig();
  }
  set instrumentCardCollapsed(value: boolean) {
    this.instrumentCardCollapsedSig.set(value);
  }

  get filteredInstruments(): StudyInstrument[] {
    const raw = this.instrumentFilterValueSig() || '';
    const query = raw.toString().trim().toLowerCase();
    if (!query) return this.availableInstruments;
    return this.availableInstruments.filter((instrument) =>
      instrument.name.toLowerCase().includes(query)
    );
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
    if (this.selectedInstrumentIds.length !== this.lastAppliedInstrumentIds.length) {
      return false;
    }
    const current = new Set(this.selectedInstrumentIds);
    return this.lastAppliedInstrumentIds.every((id) => current.has(id));
  }

  readonly panelState = computed<InstrumentPanelState>(() => ({
    availableInstruments: this.availableInstruments,
    selectedInstrumentIds: this.selectedInstrumentIds,
    filteredInstruments: this.filteredInstruments,
    selectionMatchesApplied: this.selectionMatchesApplied,
    showInstrumentSelection: this.showInstrumentSelection,
    instrumentCardCollapsed: this.instrumentCardCollapsed,
    allInstrumentsSelected: this.allInstrumentsSelected,
    selectedInstrumentSummary: this.selectedInstrumentSummary,
    instrumentFilterControl: this.instrumentFilterControl,
  }));

  initializeFromXml(scoreId: string, xml: string) {
    const instruments = extractInstrumentsFromXml(xml) as StudyInstrument[];
    this.availableInstruments = instruments;

    const availableIds = new Set(this.availableInstruments.map((instrument) => instrument.id));
    const stored = this.readStoredSelection(scoreId).filter((instrumentId) =>
      availableIds.has(instrumentId)
    );

    this.selectedInstrumentIds =
      stored.length > 0
        ? stored
        : this.availableInstruments.map((instrument) => instrument.id);

    this.lastAppliedInstrumentIds = [...this.selectedInstrumentIds];
    this.showInstrumentSelection = false;
  }

  markSelectionApplied(scoreId: string, selectedIds: string[]) {
    this.lastAppliedInstrumentIds = [...selectedIds];
    this.persistSelection(scoreId, selectedIds);
  }

  reset() {
    this.availableInstruments = [];
    this.selectedInstrumentIds = [];
    this.lastAppliedInstrumentIds = [];
    this.showInstrumentSelection = false;
    this.instrumentCardCollapsed = true;
    this.instrumentFilterControl.setValue('');
  }

  toggleInstrument(id: string, checked: boolean) {
    const selected = new Set(this.selectedInstrumentIds);
    if (checked) selected.add(id);
    else selected.delete(id);
    this.selectedInstrumentIds = Array.from(selected);
    this.ensureValidSelectionOrRestore();
  }

  selectOnlyInstrument(id: string) {
    this.selectedInstrumentIds = [id];
    this.ensureValidSelectionOrRestore();
  }

  selectAllInstruments() {
    if (this.availableInstruments.length === 0) return;
    this.selectedInstrumentIds = this.availableInstruments.map((instrument) => instrument.id);
    this.ensureValidSelectionOrRestore();
  }

  restoreAppliedInstruments() {
    if (this.lastAppliedInstrumentIds.length === 0) return;
    this.selectedInstrumentIds = [...this.lastAppliedInstrumentIds];
    this.instrumentFilterControl.setValue('');
  }

  openSelection() {
    this.instrumentFilterControl.setValue('');
    this.showInstrumentSelection = true;
    this.instrumentCardCollapsed = false;
  }

  cancelSelection() {
    this.selectedInstrumentIds = [...this.lastAppliedInstrumentIds];
    this.instrumentFilterControl.setValue('');
    this.showInstrumentSelection = false;
  }

  handleEmptySelectionOnApply() {
    this.ensureValidSelectionOrRestore();
  }

  private ensureValidSelectionOrRestore() {
    if (!this.sourceHasInstruments() || this.selectedInstrumentIds.length > 0) {
      return;
    }
    this.snackBar.open('Selecione ao menos um instrumento.', 'Fechar', { duration: 3000 });
    this.selectedInstrumentIds = [...this.lastAppliedInstrumentIds];
  }

  private sourceHasInstruments(): boolean {
    return this.availableInstruments.length > 0;
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
}

