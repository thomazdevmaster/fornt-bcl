import { Component, ElementRef, HostListener, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-media-viewer',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule],
  templateUrl: './media-viewer.component.html',
  styleUrls: ['./media-viewer.component.scss']
})
export class MediaViewerComponent {
  currentIndex: number;
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { items: any[], initialIndex: number }) {
    this.currentIndex = data.initialIndex;
  }

  get currentItem() {
    return this.data.items[this.currentIndex];
  }

  next() {
    if (this.currentIndex < this.data.items.length - 1) {
      this.currentIndex++;
      this.reloadVideo();
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.reloadVideo();
    }
  }

  private reloadVideo() {
    // Pequeno timeout para esperar o Angular atualizar o [src] no DOM
    setTimeout(() => {
      if (this.videoPlayer) {
        this.videoPlayer.nativeElement.load();
        this.videoPlayer.nativeElement.play();
      }
    });
  }
  // Atalhos de teclado (Seta esquerda/direita e Esc)
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'ArrowRight') this.next();
    if (event.key === 'ArrowLeft') this.prev();
  }
}
