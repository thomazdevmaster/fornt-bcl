import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryService } from '../services/gallery.service';
import { Gallery, MediaType } from '../model/gallery';
import { AppMaterialModule } from '../../../shared/app-material/app-material-module';
import { Album } from 'app/shared/interfaces/iAlbum';

@Component({
  selector: 'app-gallery-view',
  standalone: true,
  imports: [CommonModule, AppMaterialModule],
  templateUrl: './gallery-view.html',
  styleUrl: './gallery-view.scss'
})
export class GalleryViewComponent implements OnInit {
  private galleryService = inject(GalleryService);

  albums: Album[] = [];
  loading = true;

  ngOnInit() {
    this.galleryService.list().subscribe({
      next: (items) => {
        this.albums = this.groupIntoAlbums(items);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  private groupIntoAlbums(items: Gallery[]): Album[] {
    const groups = items.reduce((acc, item) => {
      const albumName = item.category || 'Geral';
      if (!acc[albumName]) acc[albumName] = [];
      acc[albumName].push(item);
      return acc;
    }, {} as { [key: string]: Gallery[] });

    return Object.keys(groups).map(name => ({
      name,
      items: groups[name]
    }));
  }

  openMedia(url: string) {
    window.open(url, '_blank');
  }
}
