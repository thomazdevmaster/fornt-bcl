import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AppMaterialModule } from '../../../shared/app-material/app-material-module';
import { SharedTableComponent } from '../../../shared/components/table/table';
import { DialogsService } from '../../../shared/services/dialogs.service';
import { BaseCrudListComponent } from '../../../shared/base-classes/base-crud-list.component';
import { ICrudListConfig } from '../../../shared/interfaces/icrud-config';

import { Presentation } from '../model/presentation';
import { PresentationService } from '../services/presentation';
import { PRESENTATION_FORM_FIELDS, getPresentationDetailFields } from '../config/presentation-form.config';
import { PRESENTATION_COLUMNS } from '../config/presentation-columns.config';

/**
 * Componente principal de gerenciamento de estudantes
 * Estende BaseCrudListComponent para reutilizar toda lógica de CRUD
 * Responsável apenas por configuração específica de estudantes
 */
@Component({
  selector: 'app-presentations',
  standalone: true,
  imports: [CommonModule, AppMaterialModule, SharedTableComponent, MatSnackBarModule],
  templateUrl: './presentations.html',
  styleUrl: './presentations.scss',
})
export class PresentationComponent extends BaseCrudListComponent<Presentation> {
  /**
   * Configuração específica de músicos para a base class
   */
  override config: ICrudListConfig<Presentation> = {
    title: 'Apresentações',
    endpoint: 'presentations.json',
    entityName: 'Apresentação',
    columns: PRESENTATION_COLUMNS,
    formFields: (presentation?: Presentation) => PRESENTATION_FORM_FIELDS(presentation),
    detailFields: (presentation: Presentation) => getPresentationDetailFields(presentation)
  };

  constructor(
    public override service: PresentationService,
    dialogsService: DialogsService,
    snackBar: MatSnackBar
  ) {
    super(dialogsService, snackBar);
  }
}

