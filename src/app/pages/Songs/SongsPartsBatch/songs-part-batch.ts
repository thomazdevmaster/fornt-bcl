import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppMaterialModule } from '../../../shared/app-material/app-material-module';
import { ISongPart } from '../model/song';

@Component({
  selector: 'app-songs-part-batch',
  standalone: true,
  imports: [CommonModule, AppMaterialModule, FormsModule],
  templateUrl: './songs-part-batch.html',
  styleUrl: './songs-part-batch.scss'
})
export class SongPartsBatchComponent implements OnInit {
  parts: ISongPart[] = [];

  constructor(
    public dialogRef: MatDialogRef<SongPartsBatchComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { songTitle: string, parts: ISongPart[] }
  ) {}

  ngOnInit(): void {
    this.parts = this.data.parts ? JSON.parse(JSON.stringify(this.data.parts)) : [];
  }

  addPart(): void {
    this.parts.push({ instrument: '', voice: '', urlSheet: '', urlMidi: '' });
  }

  removePart(index: number): void {
    this.parts.splice(index, 1);
  }

  save(): void {
    this.dialogRef.close(this.parts);
  }
}
