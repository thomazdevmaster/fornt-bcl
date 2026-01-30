import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AppMaterialModule } from '../../../shared/app-material/app-material-module';
import { SharedTableComponent } from '../../../shared/components/table/table';
import { DialogsService } from '../../../shared/services/dialogs.service';
import { BaseCrudListComponent } from '../../../shared/base-classes/base-crud-list.component';
import { ICrudListConfig } from '../../../shared/interfaces/icrud-config';

import { Song } from '../model/song';
import { SONG_FORM_FIELDS, getSongDetailFields } from '../config/song-form.config';
import { SONG_COLUMNS } from '../config/song-columns.config';
import { SongService } from '../services/song.service';

/**
 * Componente principal de gerenciamento de estudantes
 * Estende BaseCrudListComponent para reutilizar toda lógica de CRUD
 * Responsável apenas por configuração específica de estudantes
 */
@Component({
  selector: 'app-songs',
  standalone: true,
  imports: [CommonModule, AppMaterialModule, SharedTableComponent, MatSnackBarModule],
  templateUrl: './songs.html',
  styleUrl: './songs.scss',
})
export class SongComponent extends BaseCrudListComponent<Song> {
  /**
   * Configuração específica de músicos para a base class
   */
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
}

