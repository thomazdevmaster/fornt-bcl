import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { Observable, forkJoin } from 'rxjs';

import { AppMaterialModule } from '../../../shared/app-material/app-material-module';
import { SharedTableComponent } from '../../../shared/components/table/table';
import { DialogsService } from '../../../shared/services/dialogs.service';
import { BaseCrudListComponent } from '../../../shared/base-classes/base-crud-list.component';
import { ICrudListConfig } from '../../../shared/interfaces/icrud-config';

import { Gallery } from '../model/gallery';
import { GALLERY_FORM_FIELDS, getGalleryDetailFields } from '../config/gallery-form.config';
import { GALLERY_COLUMNS } from '../config/gallery-columns.config';
import { GalleryService } from '../services/gallery.service';
import { GalleryBatchComponent } from '../GalleryBatch/gallery-batch';
import { AlbumDetailComponent } from '../Album/album-detail';

@Component({
  selector: 'app-gallerys',
  standalone: true,
  imports: [CommonModule, AppMaterialModule, SharedTableComponent, MatSnackBarModule],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class GalleryComponent extends BaseCrudListComponent<Gallery> implements OnInit {

  existingAlbums: string[] = [];
  albumsData$!: Observable<any[]>;

  override config: ICrudListConfig<Gallery> = {
    title: 'Galeria de Mídias',
    endpoint: 'gallerys.json',
    entityName: 'Mídia',
    columns: GALLERY_COLUMNS,
    formFields: (gallery?: Gallery) => GALLERY_FORM_FIELDS(gallery),
    detailFields: (gallery: Gallery) => getGalleryDetailFields(gallery)
  };

  constructor(
    public override service: GalleryService,
    dialogsService: DialogsService,
    snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    super(dialogsService, snackBar);
  }

  override ngOnInit() {
    super.ngOnInit();

    this.albumsData$ = this.data$.pipe(
      map(items => {
        if (!items) return [];
        const groups = items.reduce((acc, item) => {
          const name = item.category || 'Sem Categoria';
          if (!acc[name]) {
            acc[name] = { category: name, count: 0, items: [] };
          }
          acc[name].count++;
          acc[name].items.push(item);
          return acc;
        }, {} as { [key: string]: any });
        return Object.values(groups);
      })
    );

    this.data$.subscribe(items => {
      if (items) {
        this.existingAlbums = [...new Set(items.map(i => i.category).filter((c): c is string => !!c))];
      }
    });
  }

  override onAdd() {

    const albumDescriptions: { [key: string]: string } = {};

    this.data$.subscribe(items => {
      items.forEach((item: Gallery) => {
        if (item.category && item.description) {
          albumDescriptions[item.category] = item.description;
        }
      });
    }).unsubscribe();

    const dialogRef = this.dialog.open(GalleryBatchComponent, {
      width: '80vw',
      maxHeight: '80vh',
      maxWidth: '1200px',
      data: {
        existingAlbums: this.existingAlbums,
        albumDescriptions: albumDescriptions
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) this.saveBatch(result);
    });
  }

  override onView(album: any) {
    const dialogRef = this.dialog.open(AlbumDetailComponent, {
      width: '70vw',
      maxHeight: '80vh',
      maxWidth: '1000px',
      data: { category: album.category, items: album.items }
    });

    dialogRef.afterClosed().subscribe((refresh: any) => {
      if (refresh) this.loadData();
    });
  }

  private saveBatch(data: any) {
    const requests = data.items.map((item: any) => {
      const payload = {
        ...item,
        category: data.category,
        // Prioriza a descrição individual, se não houver, usa a do álbum
        description: item.description || data.albumDescription
      };
      return this.service.create(payload);
    });

    forkJoin(requests).subscribe({
      next: () => {
        this.loadData();
        this.snackBar.open('Álbum salvo com sucesso!', 'OK', { duration: 3000 });
      },
      error: (err) => console.error('Erro ao salvar lote:', err)
    });
  }
}
