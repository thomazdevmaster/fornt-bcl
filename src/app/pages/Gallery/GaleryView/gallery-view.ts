import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryService } from '../services/gallery.service';
import { Gallery } from '../model/gallery';
import { AppMaterialModule } from '../../../shared/app-material/app-material-module';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-gallery-view',
  standalone: true,
  imports: [CommonModule, AppMaterialModule, MatExpansionModule],
  templateUrl: './gallery-view.html',
  styleUrl: './gallery-view.scss'
})
export class GalleryViewComponent implements OnInit {
  private galleryService = inject(GalleryService);

  albums: any[] = [];
  loading = true;

  ngOnInit() {
    this.galleryService.list().subscribe({
      next: (items) => {
        const sortedItems = items.sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.albums = this.groupIntoAlbums(sortedItems);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  private groupIntoAlbums(items: Gallery[]): any[] {
    const groups = items.reduce((acc, item) => {
      const albumName = item.category || 'Geral';
      if (!acc[albumName]) {
        acc[albumName] = {
          name: albumName,
          description: item.description || '', // Pega a descrição do registro
          items: []
        };
      }
      acc[albumName].items.push(item);
      return acc;
    }, {} as { [key: string]: any });

    return Object.values(groups);
  }

  openMedia(url: string) {
    window.open(url, '_blank');
  }
}
