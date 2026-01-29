import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from '../../../app-material/app-material-module';
import { IFormDialogData } from './IFormDialogData';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';

import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';
import { PersonModel } from 'app/shared/models/person.model';
registerLocaleData(localePt);

@Component({
  selector: 'app-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppMaterialModule],
  providers: [provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }],
  templateUrl: './form.html',
  styleUrl: './form.scss'
})
export class FormDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<FormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IFormDialogData
  ) {
    // Construir form dinamicamente a partir da configuração
    const formControls: any = {};

    this.data.fields.forEach(field => {
      const validators = [];

      if (field.required) {
        validators.push(Validators.required);
      }

      if (field.validators) {
        validators.push(...field.validators);
      }

      const value = field.value || '';
      formControls[field.fieldName] = [value, validators];
    });

    this.form = this.fb.group(formControls);
  }

  ngOnInit() {
    const birthControl = this.form.get('birthDate');

    // 1. Valida o estado inicial (Crucial para EDICAO)
    if (birthControl?.value) {
      this.checkResponsibility(birthControl.value);
    }

    // 2. Escuta mudanças futuras
    birthControl?.valueChanges.subscribe(value => this.checkResponsibility(value));
  }

  private checkResponsibility(date: any) {
    // Usando sua lógica da PersonModel
    const isMinor = date ? new PersonModel({ birthDate: date }).isAdult === false : false;
    const respName = this.form.get('responsibleName');
    const respPhone = this.form.get('responsiblePhone');

    if (isMinor) {
      respName?.setValidators([Validators.required]);
      respPhone?.setValidators([Validators.required]);
    } else {
      respName?.clearValidators();
    }

    // O updateValueAndValidity sem emitEvent: false pode causar loops se não houver cuidado
    respName?.updateValueAndValidity({ emitEvent: false });
    respPhone?.updateValueAndValidity({ emitEvent: false });
  }

  getControl(fieldName: string) {
    return this.form.get(fieldName);
  }

  cancel() {
    this.dialogRef.close();
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
