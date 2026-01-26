import { ValidatorFn } from '@angular/forms';

export interface IFormDialogData {
  title: string;
  fields: IFormFieldConfig[];
  submitText?: string;
  cancelText?: string;
}

export interface IFormFieldConfig {
  fieldName: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'date';
  value?: any;
  validators?: ValidatorFn[];
  options?: Array<{ value: string | number; label: string }>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}
