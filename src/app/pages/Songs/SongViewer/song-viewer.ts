import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { AppMaterialModule } from "app/shared/app-material/app-material-module";
import { ISongPart, Song } from "../model/song";
import { DomSanitizer } from "@angular/platform-browser";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: 'app-songs-part-batch',
  standalone: true,
  imports: [CommonModule, AppMaterialModule],
  templateUrl: './song-viewer.html',
  styleUrl: './song-viewer.scss'

})
export class SongViewerComponent {
  selectedPart?: ISongPart;

  constructor(
    @Inject(MAT_DIALOG_DATA) public song: Song,
    private sanitizer: DomSanitizer
  ) {}

  getSafeUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // Converte link do Youtube para Embed
  getEmbedYoutube(url: string) {
    const id = url.split('v=')[1]?.split('&')[0];
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}`);
  }
}
