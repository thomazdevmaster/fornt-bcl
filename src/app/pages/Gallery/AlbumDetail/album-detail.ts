import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppMaterialModule } from '../../../shared/app-material/app-material-module';
import { Gallery } from '../model/gallery';
import { GalleryService } from '../services/gallery.service';

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [CommonModule, AppMaterialModule],
  templateUrl: './album-detail.html',
  styleUrl: './album-detail.scss'
})
export class AlbumDetailComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { category: string, items: Gallery[] },
    private dialogRef: MatDialogRef<AlbumDetailComponent>,
    private galleryService: GalleryService
  ) {}

  deleteItem(item: Gallery) {
    if (confirm(`Deseja realmente excluir a mídia "${item.title}"?`)) {
      this.galleryService.delete(item.id!).subscribe(() => {
        // Remove do array local para atualizar a tela
        this.data.items = this.data.items.filter(i => i.id !== item.id);
        if (this.data.items.length === 0) this.dialogRef.close(true);
      });
    }
  }

  close() {
    this.dialogRef.close();
  }
}
