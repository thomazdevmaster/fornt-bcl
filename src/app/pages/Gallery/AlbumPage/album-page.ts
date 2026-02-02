import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from '../../../shared/app-material/app-material-module';
import { Gallery } from '../model/gallery';

@Component({
  selector: 'app-album-page',
  standalone: true,
  imports: [CommonModule, AppMaterialModule],
  templateUrl: './album-page.html',
  styleUrl: './album-page.scss'
})
export class AlbumPageComponent {
  constructor(
    public dialogRef: MatDialogRef<AlbumPageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { category: string, description: string, items: Gallery[] }
  ) {}

  close() {
    this.dialogRef.close();
  }
}
