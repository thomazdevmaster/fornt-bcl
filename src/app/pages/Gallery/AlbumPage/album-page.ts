import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from '../../../shared/app-material/app-material-module';
import { Gallery } from '../model/gallery';
import { MediaViewerComponent } from '../MediaViewer/media-viewer.component';

@Component({
  selector: 'app-album-page',
  standalone: true,
  imports: [CommonModule, AppMaterialModule],
  templateUrl: './album-page.html',
  styleUrl: './album-page.scss'
})
export class AlbumPageComponent {
  constructor(
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<AlbumPageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string, category: string, description: string, items: Gallery[] }
  ) {}

  close() {
    this.dialogRef.close();
  }

  editPhoto(item: Gallery) { console.log('Editar', item); }
  downloadPhoto(item: Gallery) { console.log('Baixar', item); }
  deletePhoto(item: Gallery) { console.log('Excluir', item); }

  openAddPhotosDialog() {
    // Implemente a lógica de abertura do modal de upload aqui
  }

    openFullScreen(index: number) {
    this.dialog.open(MediaViewerComponent, {
      data: {
        items: this.data.items, // A lista completa de Gallery[]
        initialIndex: index     // O índice da foto clicada
      },
      width: '100vw',      // Força largura total
      height: '100vh',     // Força altura total
      maxWidth: '100vw',   // Remove restrições padrão
      maxHeight: '100vh',  // Remove restrições padrão
      panelClass: 'fullscreen-media-modal', // Classe para o CSS Global
      backdropClass: 'black-backdrop'       // Garante o fundo preto
    });
  }
}
