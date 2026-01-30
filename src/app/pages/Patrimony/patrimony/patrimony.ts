import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AppMaterialModule } from '../../../shared/app-material/app-material-module';
import { SharedTableComponent } from '../../../shared/components/table/table';
import { DialogsService } from '../../../shared/services/dialogs.service';
import { BaseCrudListComponent } from '../../../shared/base-classes/base-crud-list.component';
import { ICrudListConfig } from '../../../shared/interfaces/icrud-config';

import { Patrimony } from '../model/patrimony';
import { getPatrimonyDetailFields, PATRIMONY_FORM_FIELDS } from '../config/patrimony-form.config';
import { PATRIMONY_COLUMNS } from '../config/patrimony-columns.config';
import { PatrimonyService } from '../services/patrimony.service';

/**
 * Componente principal de gerenciamento de estudantes
 * Estende BaseCrudListComponent para reutilizar toda lógica de CRUD
 * Responsável apenas por configuração específica de estudantes
 */
@Component({
  selector: 'app-patrimonys',
  standalone: true,
  imports: [CommonModule, AppMaterialModule, SharedTableComponent, MatSnackBarModule],
  templateUrl: './patrimony.html',
  styleUrl: './patrimony.scss',
})
export class PatrimonyComponent extends BaseCrudListComponent<Patrimony> {
  /**
   * Configuração específica de músicos para a base class
   */
  override config: ICrudListConfig<Patrimony> = {
    title: 'Mídiass',
    endpoint: 'patrimonys.json',
    entityName: 'Apresentação',
    columns: PATRIMONY_COLUMNS,
    formFields: (patrimony?: Patrimony) => PATRIMONY_FORM_FIELDS(patrimony),
    detailFields: (patrimony: Patrimony) => getPatrimonyDetailFields(patrimony)
  };

  constructor(
    public override service: PatrimonyService,
    dialogsService: DialogsService,
    snackBar: MatSnackBar
  ) {
    super(dialogsService, snackBar);
  }
}

