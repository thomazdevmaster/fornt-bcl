import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryService } from '../services/gallery.service';
import { AppMaterialModule } from '../../../shared/app-material/app-material-module';
import { AlbumPageComponent } from '../AlbumPage/album-page'; // Seu componente de detalhes
import { MatDialog } from '@angular/material/dialog';
import { Gallery } from '../model/gallery';

@Component({
  selector: 'app-gallery-view',
  standalone: true,
  imports: [CommonModule, AppMaterialModule],
  templateUrl: './gallery-view.html',
  styleUrl: './gallery-view.scss'
})
export class GalleryViewComponent implements OnInit {

  private service = inject(GalleryService);
  private dialog = inject(MatDialog);

  albums: any[] = [];
  loading = true;

  ngOnInit() {
    this.service.list().subscribe({
      next: (data) => {
        // Ordena tudo por data antes de agrupar
        const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.albums = this.groupIntoAlbums(sorted);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  // Agrupamento
  private groupIntoAlbums(items: Gallery[]): any[] {
    const groups = items.reduce((acc, item) => {
      const name = item.category || 'Geral';
      if (!acc[name]) {
        acc[name] = { name, description: item.description, items: [] };
      }
      acc[name].items.push(item);
      return acc;
    }, {} as any);
    return Object.values(groups);
  }

  // Pega a data mais recente do álbum para exibir no header
  getLatestDate(items: Gallery[]): Date {
    if (!items.length) return new Date();
    // Como já ordenamos na busca, o primeiro é o mais recente
    return new Date(items[0].date);
  }

  // Lógica do Carrossel (Scroll Horizontal)
  scroll(element: HTMLElement, direction: number) {
    const scrollAmount = 300; // Tamanho aproximado de um card + gap
    element.scrollBy({
      left: direction * scrollAmount,
      behavior: 'smooth'
    });
  }

  openAlbumPage(album: any) {
    this.dialog.open(AlbumPageComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-modal',
      data: album
    });
  }

  createAlbum() {
    // Lógica para abrir modal de novo álbum
    console.log("Criar novo álbum");
  }

  editAlbum(album: any) {
    // Lógica para editar álbum existente
    console.log("Editando:", album.name);
  }

  deleteAlbum(album: any) {
    // Lógica de exclusão
    if (confirm(`Deseja realmente apagar o álbum ${album.name}?`)) {
      console.log("Deletando...");
    }
  }
}
