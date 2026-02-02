import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AppMaterialModule } from '../../../shared/app-material/app-material-module';
import { SharedTableComponent } from '../../../shared/components/table/table';
import { DialogsService } from '../../../shared/services/dialogs.service';
import { BaseCrudListComponent } from '../../../shared/base-classes/base-crud-list.component';
import { ICrudListConfig } from '../../../shared/interfaces/icrud-config';

import { Gallery } from '../model/gallery';
import { GALLERY_BATCH_FORM, GALLERY_FORM_FIELDS, getGalleryDetailFields } from '../config/gallery-form.config';
import { GALLERY_COLUMNS } from '../config/gallery-columns.config';
import { GalleryService } from '../services/gallery.service';

@Component({
  selector: 'app-gallerys',
  standalone: true,
  imports: [CommonModule, AppMaterialModule, SharedTableComponent, MatSnackBarModule],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class GalleryComponent extends BaseCrudListComponent<Gallery> {

  existingAlbums: string[] = []

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

    this.data$.subscribe(items => {
      if (items) {
        // Extrai categorias únicas e remove vazios
        this.existingAlbums = [...new Set(items.map(i => i.category).filter((c): c is string => !!c))];
      }
    });
  }

  override onAdd() {
    const dialogRef = this.dialogsService.openForm({
      title: 'Adicionar Fotos ao Álbum',
      fields: GALLERY_BATCH_FORM(this.existingAlbums),
      submitText: 'Enviar Tudo'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveBatch(result);
      }
    });
  }

  private saveBatch(data: any) {
    const album = data.category;
    const items = data.mediaList;

    // Para cada item da lista, salvamos individualmente (ou via endpoint de bulk)
    items.forEach((item: any) => {
      const finalItem = { ...item, category: album };
      this.service.create(finalItem).subscribe();
    });

    this.snackBar.open(`${items.length} mídias adicionadas ao álbum ${album}`, 'OK');
    this.refreshData();
  }
}

