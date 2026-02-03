// sheet-viewer-dialog.component.ts
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AppMaterialModule } from 'app/shared';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-sheet-viewer-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIcon],
  templateUrl: './sheet-viewer-dialog.component.html',
  styleUrl: './sheet-viewer-dialog.component.scss'
})
export class SheetViewerDialog {
  safePdfUrl: SafeResourceUrl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer
  ) {
    this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(data.urlSheet);
  }
}
