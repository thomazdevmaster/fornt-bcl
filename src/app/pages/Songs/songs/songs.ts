import { INSTRUMENT_METADATA, INSTRUMENTS_TYPES } from './../../Instruments/Helpers/instrument-helper';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AppMaterialModule } from '../../../shared/app-material/app-material-module';
import { SharedTableComponent } from '../../../shared/components/table/table';
import { DialogsService } from '../../../shared/services/dialogs.service';
import { BaseCrudListComponent } from '../../../shared/base-classes/base-crud-list.component';
import { ICrudListConfig } from '../../../shared/interfaces/icrud-config';

import { ISongPart, Song } from '../model/song';
import { SONG_FORM_FIELDS, getSongDetailFields } from '../config/song-form.config';
import { SONG_COLUMNS } from '../config/song-columns.config';
import { SongService } from '../services/song.service';
import { MatDialog } from '@angular/material/dialog';
import { SongPartsBatchComponent } from '../SongsPartsBatch/songs-part-batch';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, Observable, startWith } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SongViewerComponent } from '../SongViewer/song-viewer';
import { SongFormStepperComponent } from '../SongFormStepper/song-form-stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SheetViewerDialog } from '../SheetViewer/sheet-viewer-dialog.component';

@Component({
  selector: 'app-songs',
  standalone: true,
  imports: [CommonModule, AppMaterialModule, SharedTableComponent, ReactiveFormsModule, MatTooltipModule],
  templateUrl: './songs.html',
  styleUrl: './songs.scss',
})
export class SongComponent extends BaseCrudListComponent<Song> {

  private dialog = inject(MatDialog);
  instrumentFilter = new FormControl('');

  filteredData$!: Observable<Song[]>;

  private sanitizer = inject(DomSanitizer);

  allInstruments = Object.values(INSTRUMENTS_TYPES);

  // Estado do filtro: qual instrumento está selecionado no cabeçalho
  private selectedInstruments$ = new BehaviorSubject<string[]>([]);
  selectedInstruments: string[] = [];

  override config: ICrudListConfig<Song> = {
    title: 'Músicas',
    endpoint: 'songs.json',
    entityName: 'Apresentação',
    columns: SONG_COLUMNS,
    formFields: (song?: Song) => SONG_FORM_FIELDS(song),
    detailFields: (song: Song) => getSongDetailFields(song)
  };

  constructor(
    public override service: SongService,
    dialogsService: DialogsService,
    snackBar: MatSnackBar
  ) {
    super(dialogsService, snackBar);
  }

  private instrumentFilter$ = new BehaviorSubject<string | null>(null);

  filteredSongs$ = combineLatest([
    this.data$,
    this.selectedInstruments$.asObservable()
  ]).pipe(
    map(([songs, selectedFilters]) => {
      const safeSongs = songs || [];
      if (selectedFilters.length === 0) return safeSongs;

      // Filtra músicas que contenham quanquer um dos instrumentos selecionados
      return safeSongs.filter(song =>
        song.parts?.some(p => selectedFilters.includes(p.instrument))
      );
    })
  );

  toggleInstrumentFilter(instrumentName: string) {
    const index = this.selectedInstruments.indexOf(instrumentName);

    if (index > -1) {
      // Se já existe, remove (Deselecionar)
      this.selectedInstruments.splice(index, 1);
    } else {
      // Se não existe, adiciona (Selecionar)
      this.selectedInstruments.push(instrumentName);
    }

    // Notifica o Observable com uma cópia do array
    this.selectedInstruments$.next([...this.selectedInstruments]);
  }

  clearFilters() {
    this.selectedInstruments = [];
    this.selectedInstruments$.next([]);
  }

  openSheetWithPlayer(part: any, instrumentName: string) {
    this.dialog.open(SheetViewerDialog, {
      data: {
        // urlSheet: part.urlSheet,
        // urlMidi: part.urlMidi,
        urlSheet: 'teste-partitura.pdf',
        urlMidi: 'teste-audio.mp3',
        title: instrumentName,
        voice: part.voice || 'Voz Única'
      },
      width: '95vw',
      height: '90vh',
      maxWidth: '1400px',
      panelClass: 'full-screen-modal'
    });
  }

  currentAudioUrl: string | null = null;

  playMidi(url: string) {
    if (!url) return;

    // Se clicar na mesma URL que já está tocando, podemos pausar (opcional)
    if (this.currentAudioUrl === url) {
      this.currentAudioUrl = null;
    } else {
      this.currentAudioUrl = url;
    }
  }

  closePlayer() {
    this.currentAudioUrl = null;
  }

  getPartsByInstrument(instrument: string, parts: ISongPart[]): ISongPart[] {
    if (!parts) return [];
    return parts.filter(p => p.instrument === instrument);
  }

  override ngOnInit() {
    this.loadData();
    // Filtro reativo
    this.filteredData$ = combineLatest([
      this.data$,
      this.instrumentFilter.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([songs, filterValue]) => {
        if (!filterValue) return songs;
        return songs.filter(song =>
          song.parts?.some(part => part.instrument === filterValue)
        );
      })
    );
  }

  onManageParts(song: Song) {
    const dialogRef = this.dialog.open(SongPartsBatchComponent, {
      width: '950px',
      data: {
        songTitle: song.title,
        parts: song.parts ? [...song.parts] : []
      }
    });

    dialogRef.afterClosed().subscribe((updatedParts: ISongPart[] | undefined) => {
      if (updatedParts) {
        song.parts = updatedParts;
        this.service.update(song.id, song).subscribe({
          next: () => {
            this.snackBar.open('Partes atualizadas com sucesso!', 'OK', { duration: 3000 });
            this.loadData();
          }
        });
      }
    });
  }

  override onAdd() {
    const dialogRef = this.dialog.open(SongFormStepperComponent, { width: '80vw', height: '80vh', maxWidth: '1400px', maxHeight: '600px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.service.create(result).subscribe(() => this.loadData());
    });
  }

  override onView(song: Song) {
    this.dialog.open(SongViewerComponent, {
      width: '95vw',
      height: '90vh',
      data: song
    });
  }

  getSafeVideoUrl(url: string): SafeResourceUrl | null {
    if (!url) return null;
    let videoId = '';
    if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
    else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1];

    return videoId ?
      this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`) : null;
  }

  getInstrumentStatus(instrumentName: string, songParts: ISongPart[]) {
    const key = instrumentName as keyof typeof INSTRUMENT_METADATA;
    const metadata = INSTRUMENT_METADATA[key];

    const exists = songParts?.some(p => p.instrument === instrumentName);

    return {
      path: metadata?.iconPath || 'assets/instruments/default.png',
      title: exists ? metadata?.title : `${metadata?.title} (Pendente)`,
      active: exists
    };
  }

  getInstrumentMetadata(name: string) {
    const meta = INSTRUMENT_METADATA[name as keyof typeof INSTRUMENT_METADATA];
    return {
      path: meta?.iconPath || 'assets/instruments/default.png',
      name: meta?.name || name
    };
  }
}
