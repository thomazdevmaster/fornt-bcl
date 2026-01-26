import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AppMaterialModule } from '../../../shared/app-material/app-material-module';
import { SharedTableComponent } from '../../../shared/components/table/table';
import { DialogsService } from '../../../shared/services/dialogs.service';
import { BaseCrudListComponent } from '../../../shared/base-classes/base-crud-list.component';
import { ICrudListConfig } from '../../../shared/interfaces/icrud-config';

import { Musician } from '../model/musician';
import { MusicianService } from '../services/musician';
import { MUSICIAN_FORM_FIELDS, getMusicianDetailFields } from '../config/musician-form.config';
import { MUSICIAN_COLUMNS } from '../config/musician-columns.config';

/**
 * Componente principal de gerenciamento de músicos
 * Estende BaseCrudListComponent para reutilizar toda lógica de CRUD
 * Responsável apenas por configuração específica de músicos
 */
@Component({
  selector: 'app-musicians',
  standalone: true,
  imports: [CommonModule, AppMaterialModule, SharedTableComponent, MatSnackBarModule],
  templateUrl: './musicians.html',
  styleUrl: './musicians.scss',
})
export class MusicianComponent extends BaseCrudListComponent<Musician> {
  /**
   * Configuração específica de músicos para a base class
   */
  override config: ICrudListConfig<Musician> = {
    title: 'Músicos',
    endpoint: 'musicians.json',
    entityName: 'Músico',
    columns: MUSICIAN_COLUMNS,
    formFields: () => MUSICIAN_FORM_FIELDS(),
    detailFields: (musician: Musician) => getMusicianDetailFields(musician)
  };

  constructor(
    public override service: MusicianService,
    dialogsService: DialogsService,
    snackBar: MatSnackBar
  ) {
    super(dialogsService, snackBar);
  }
}

