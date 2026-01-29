import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppMaterialModule } from "../../../app-material/app-material-module";
import { IDetailsDialogData } from './IDetailsDialogData';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-details',
  imports: [AppMaterialModule, CommonModule],
  templateUrl: './details.html',
  styleUrl: './details.scss',
})
export class DetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDetailsDialogData
  ) {}

  close() {
    this.dialogRef.close();
  }

  edit(item: any) {
    this.dialogRef.close({ action: 'edit', item });
  }
}
