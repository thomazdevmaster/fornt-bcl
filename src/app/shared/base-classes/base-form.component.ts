import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppMaterialModule } from '../../shared/app-material/app-material-module';

/**
 * Configuração de campo de formulário
 */
export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  validators?: any[];
  hint?: string;
  options?: Array<{ value: any; label: string }>; // Para selects
  disabled?: boolean;
}

/**
 * Componente base para formulários
 * Fornece funcionalidade comum para todos os formulários da aplicação
 *
 * @example
 * export class CreateMusicianDialogComponent extends BaseFormComponent<Musician> {
 *   fields: FormFieldConfig[] = [
 *     { name: 'firstName', label: 'Primeiro Nome', type: 'text', required: true },
 *     { name: 'email', label: 'Email', type: 'email', required: true },
 *   ];
 * }
 */
@Component({
  selector: 'app-base-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppMaterialModule],
  template: ``,
})
export abstract class BaseFormComponent<T> implements OnInit {
  /**
   * Formulário reativo
   */
  form!: FormGroup;

  /**
   * Configuração dos campos do formulário
   * Deve ser implementado nas subclasses
   */
  abstract fields: FormFieldConfig[];

  /**
   * Dados iniciais para pré-preencher o formulário
   */
  @Input() initialData?: Partial<T>;

  /**
   * Indica se está em modo de edição
   */
  @Input() isEditing = false;

  /**
   * Emite quando o formulário é submetido com sucesso
   */
  @Output() formSubmitted = new EventEmitter<T>();

  /**
   * Emite quando cancelado
   */
  @Output() formCancelled = new EventEmitter<void>();

  /**
   * Flag para indicar se está enviando dados
   */
  isSubmitting = false;

  /**
   * Mensagem de erro geral do formulário
   */
  errorMessage: string | null = null;

  constructor(protected fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
    if (this.initialData) {
      this.form.patchValue(this.initialData);
    }
  }

  /**
   * Constrói o FormGroup dinamicamente baseado em fields
   */
  protected buildForm(): void {
    const group: Record<string, any> = {};

    this.fields.forEach((field) => {
      const validators: any[] = [];

      if (field.required) {
        validators.push(Validators.required);
      }

      if (field.type === 'email') {
        validators.push(Validators.email);
      }

      if (field.validators) {
        validators.push(...field.validators);
      }

      group[field.name] = [
        { value: '', disabled: field.disabled || false },
        validators,
      ];
    });

    this.form = this.fb.group(group);
  }

  /**
   * Obtém o erro de validação de um campo
   */
  getFieldError(fieldName: string): string | null {
    const control = this.form.get(fieldName);

    if (!control || !control.errors || !control.touched) {
      return null;
    }

    if (control.errors['required']) {
      return `${this.getFieldLabel(fieldName)} é obrigatório`;
    }

    if (control.errors['email']) {
      return 'Formato de email inválido';
    }

    if (control.errors['min']) {
      return `Mínimo: ${control.errors['min'].min}`;
    }

    if (control.errors['max']) {
      return `Máximo: ${control.errors['max'].max}`;
    }

    return 'Campo inválido';
  }

  /**
   * Obtém o label de um campo
   */
  private getFieldLabel(fieldName: string): string {
    const field = this.fields.find((f) => f.name === fieldName);
    return field?.label || fieldName;
  }

  /**
   * Valida e submete o formulário
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.markFieldsAsTouched();
      this.errorMessage = 'Por favor, corrija os erros no formulário';
      return;
    }

    this.isSubmitting = true;
    const data = this.form.getRawValue() as T;

    // Simula delay de envio
    setTimeout(() => {
      this.isSubmitting = false;
      this.formSubmitted.emit(data);
    }, 300);
  }

  /**
   * Marca todos os campos como touched para mostrar erros
   */
  private markFieldsAsTouched(): void {
    Object.keys(this.form.controls).forEach((key) => {
      this.form.get(key)?.markAsTouched();
    });
  }

  /**
   * Reseta o formulário
   */
  resetForm(): void {
    this.form.reset();
    this.errorMessage = null;
  }

  /**
   * Cancela o formulário
   */
  onCancel(): void {
    this.formCancelled.emit();
  }
}
