import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AppMaterialModule } from '../../../shared/app-material/app-material-module';
import { SharedTableComponent } from '../../../shared/components/table/table';
import { DialogsService } from '../../../shared/services/dialogs.service';
import { BaseCrudListComponent } from '../../../shared/base-classes/base-crud-list.component';
import { ICrudListConfig } from '../../../shared/interfaces/icrud-config';

import { Gallery } from '../model/gallery';
import { GALLERY_FORM_FIELDS, getGalleryDetailFields } from '../config/gallery-form.config';
import { GALLERY_COLUMNS } from '../config/gallery-columns.config';
import { GalleryService } from '../services/gallery.service';

/**
 * Componente principal de gerenciamento de estudantes
 * Estende BaseCrudListComponent para reutilizar toda lógica de CRUD
 * Responsável apenas por configuração específica de estudantes
 */
@Component({
  selector: 'app-gallerys',
  standalone: true,
  imports: [CommonModule, AppMaterialModule, SharedTableComponent, MatSnackBarModule],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class GalleryComponent extends BaseCrudListComponent<Gallery> {
  /**
   * Configuração específica de músicos para a base class
   */
  override config: ICrudListConfig<Gallery> = {
    title: 'Mídiass',
    endpoint: 'gallerys.json',
    entityName: 'Apresentação',
    columns: GALLERY_COLUMNS,
    formFields: (gallery?: Gallery) => GALLERY_FORM_FIELDS(gallery),
    detailFields: (gallery: Gallery) => getGalleryDetailFields(gallery)
  };

  constructor(
    public override service: GalleryService,
    dialogsService: DialogsService,
    snackBar: MatSnackBar
  ) {
    super(dialogsService, snackBar);
  }
}

