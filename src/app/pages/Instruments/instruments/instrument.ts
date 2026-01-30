import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AppMaterialModule } from '../../../shared/app-material/app-material-module';
import { SharedTableComponent } from '../../../shared/components/table/table';
import { DialogsService } from '../../../shared/services/dialogs.service';
import { BaseCrudListComponent } from '../../../shared/base-classes/base-crud-list.component';
import { ICrudListConfig } from '../../../shared/interfaces/icrud-config';

import { Instrument } from '../model/instrument';
import { getInstrumentDetailFields, INSTRUMENT_FORM_FIELDS,  } from '../config/instrument-form.config';
import { Instrument_COLUMNS } from '../config/instrument-columns.config';
import { InstrumentService } from '../services/instrument.service';

/**
 * Componente principal de gerenciamento de estudantes
 * Estende BaseCrudListComponent para reutilizar toda lógica de CRUD
 * Responsável apenas por configuração específica de estudantes
 */
@Component({
  selector: 'app-instruments',
  standalone: true,
  imports: [CommonModule, AppMaterialModule, SharedTableComponent, MatSnackBarModule],
  templateUrl: './instrument.html',
  styleUrl: './instrument.scss',
})
export class InstrumentComponent extends BaseCrudListComponent<Instrument> {
  /**
   * Configuração específica de músicos para a base class
   */
  override config: ICrudListConfig<Instrument> = {
    title: 'Instrumentos',
    endpoint: 'instruments.json',
    entityName: 'Instrumento',
    columns: Instrument_COLUMNS,
    formFields: (Instrument?: Instrument) => INSTRUMENT_FORM_FIELDS(Instrument),
    detailFields: (Instrument: Instrument) => getInstrumentDetailFields(Instrument)
  };

  constructor(
    public override service: InstrumentService,
    dialogsService: DialogsService,
    snackBar: MatSnackBar
  ) {
    super(dialogsService, snackBar);
  }
}

