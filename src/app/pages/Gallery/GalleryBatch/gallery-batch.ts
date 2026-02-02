import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from '../../../shared/app-material/app-material-module';

@Component({
  selector: 'app-gallery-batch',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppMaterialModule],
  templateUrl: './gallery-batch.html',
  styleUrl: './gallery-batch.scss'
})
export class GalleryBatchComponent implements OnInit {
  form!: FormGroup;
  isDragging = false;
  isNewAlbum = true;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<GalleryBatchComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { existingAlbums: string[], albumDescriptions: any }
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      category: ['', Validators.required],
      albumDescription: [''],
      items: this.fb.array([])
    });

    // Lógica dinâmica para verificar se o álbum já existe
    this.form.get('category')?.valueChanges.subscribe(value => {
      const name = value?.trim();
      this.isNewAlbum = !this.data.existingAlbums.includes(name);

      if (!this.isNewAlbum && name) {
        const existingDesc = this.data.albumDescriptions[name] || '';
        this.form.get('albumDescription')?.setValue(existingDesc, { emitEvent: false });
      }
    });
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  handleFiles(files: FileList) {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.items.push(this.fb.group({
          url: [reader.result],
          title: [file.name.split('.')[0], Validators.required],
          description: [''],
          type: [file.type.includes('video') ? 'video' : 'photo'],
          date: [new Date()]
        }));
      };
    });
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragging = true;
  }

  onDragLeave() {
    this.isDragging = false;
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging = false;
    if (e.dataTransfer?.files) this.handleFiles(e.dataTransfer.files);
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  save() {
    if (this.form.valid && this.items.length > 0) {
      this.dialogRef.close(this.form.value);
    }
  }
}
