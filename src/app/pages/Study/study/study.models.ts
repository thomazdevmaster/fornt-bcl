import { FormControl } from '@angular/forms';
import { StudyInstrument } from '../components/instrument-panel/instrument-panel';
import { StudyExampleOption } from '../components/score-panel/score-panel.models';


export interface StudyPlayerPanelState {
  loading: boolean;
  playerReady: boolean;
  playerLoading: boolean;
  midiLoaded: boolean;
  midiLoading: boolean;
  playerExpanded: boolean;
  playerError: string | null;
  bpm: number;
  bpmMin: number;
  bpmMax: number;
  timeSignature: string;
  baseBpm: number;
  metronomeEnabled: boolean;
  metronomeVolume: number;
  /** Volume do áudio da partitura (0–1). */
  audioVolume: number;
  loopEnabled: boolean;
  loopStartMeasure: number | null;
  loopEndMeasure: number | null;
  instrument: InstrumentPanelState;
}

export interface InstrumentPanelState {
  availableInstruments: StudyInstrument[];
  selectedInstrumentIds: string[];
  filteredInstruments: StudyInstrument[];
  selectionMatchesApplied: boolean;
  showInstrumentSelection: boolean;
  instrumentCardCollapsed: boolean;
  allInstrumentsSelected: boolean;
  selectedInstrumentSummary: string;
  instrumentFilterControl: FormControl<string | null>;
}

export interface StudyScorePanelState {
  currentScoreName: string;
  scoreLoading: boolean;
  error: string | null;
  xmlLoaded: boolean;
  fullscreenScore: boolean;
}

export interface StudyInitialContentState {
  selectedExampleId: string | null;
  exampleOptions: ReadonlyArray<StudyExampleOption>;
  songOptions: ReadonlyArray<StudyExampleOption>;
  selectedSongId: string | null;
}

export interface StudyHeaderState {
  idControl: FormControl<string | null>;
  xmlLoaded: boolean;
  showInitialContent: boolean;
  initialContent: StudyInitialContentState;
}

export interface StudyViewModel {
  header: StudyHeaderState;
  player: StudyPlayerPanelState;
  score: StudyScorePanelState;
  /** true quando viewport <= 600px (mobile). */
  isMobile: boolean;
}
