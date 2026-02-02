import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, AbstractControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';

import { IFormDialogData, IFormFieldConfig } from './IFormDialogData';
import { AppMaterialModule } from 'app/shared/app-material/app-material-module';

registerLocaleData(localePt);

@Component({
  selector: 'app-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AppMaterialModule],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }
  ],
  templateUrl: './form.html',
  styleUrl: './form.scss'
})
export class FormDialogComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<FormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IFormDialogData
  ) {}

  ngOnInit(): void {
    const formControls: { [key: string]: any } = {};

    this.data.fields.forEach(field => {
      if (field.type === 'media-repeater') {
        // CORREÇÃO: Inicializa como FormArray explicitamente
        const array = this.fb.array<FormGroup>([]);

        // Se houver valor inicial (edição), popula o array. Se não, cria um vazio.
        const initialValues = Array.isArray(field.value) && field.value.length > 0
                              ? field.value
                              : [this.createMediaGroupValue()];

        initialValues.forEach((v: any) => {
          array.push(this.fb.group({
            url: [v.url || '', Validators.required],
            title: [v.title || '', Validators.required],
            type: [v.type || 'photo'],
            date: [v.date || new Date()]
          }));
        });

        formControls[field.fieldName] = array;
      } else {
        // Campo normal
        formControls[field.fieldName] = [
          field.value ?? '',
          field.required ? [Validators.required, ...(field.validators || [])] : (field.validators || [])
        ];
      }
    });

    this.form = this.fb.group(formControls);
  }

  // Helper para criar o objeto inicial (valor puro)
  private createMediaGroupValue() {
    return {
      url: '',
      title: '',
      type: 'photo',
      date: new Date()
    };
  }

  // Getters para o Template
  getControl(name: string): AbstractControl | null {
    return this.form.get(name);
  }

  getFormArray(name: string): FormArray {
    return this.form.get(name) as FormArray;
  }

  // Ações do Repetidor
  addMediaRow(fieldName: string) {
    const arr = this.getFormArray(fieldName);
    arr.push(this.fb.group(this.createMediaGroupValue()));
  }

  removeMediaRow(fieldName: string, index: number) {
    const arr = this.getFormArray(fieldName);
    if (arr.length > 1) {
      arr.removeAt(index);
    }
  }

  // Upload de Arquivo
  onFileSelected(event: any, fieldName: string, index?: number) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;

        if (index !== undefined) {
          // Dentro do repetidor (FormArray)
          const row = this.getFormArray(fieldName).at(index);
          row.patchValue({
            url: base64String,
            type: file.type.includes('video') ? 'video' : 'photo'
          });
          if (!row.get('title')?.value) {
            row.patchValue({ title: file.name });
          }
        } else {
          // Campo simples
          this.form.get(fieldName)?.setValue(base64String);
        }
      };
    }
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
