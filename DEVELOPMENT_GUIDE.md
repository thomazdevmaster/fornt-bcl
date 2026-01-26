# Guia de Desenvolvimento

## Setup Inicial

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start

# Compilar para produção
npm run build

# Executar testes
npm test
```

## Estrutura de Componentes

### Criar um novo Componente Simples

```bash
ng generate component pages/musicians/components/musician-card
```

**Estrutura mínima:**
```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from '../../../../shared/app-material/app-material-module';

@Component({
  selector: 'app-musician-card',
  standalone: true,
  imports: [CommonModule, AppMaterialModule],
  templateUrl: './musician-card.html',
  styleUrl: './musician-card.scss'
})
export class MusicianCardComponent {
  @Input() musician!: Musician;
  @Input() onEdit?: () => void;
  @Input() onDelete?: () => void;
}
```

### Criar um novo Serviço

```bash
ng generate service pages/musicians/services/musician-api
```

**Estrutura:**
```typescript
import { Injectable } from '@angular/core';
import { BaseCrudService } from '../../core/http/base-crud.service';
import { HttpService } from '../../core/http/http.service';
import { Musician } from '../models/musician.model';

@Injectable({ providedIn: 'root' })
export class MusicianService extends BaseCrudService<Musician> {
  protected endpoint = 'musicians.json';

  constructor(protected httpService: HttpService) {
    super(httpService);
  }

  // Métodos específicos aqui
}
```

## Integração com Formulários

### Exemplo: Criar Dialog de Formulário

```typescript
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { BaseFormComponent, FormFieldConfig } from '../../../shared/base-classes/base-form.component';
import { Musician, CreateMusician } from '../models/musician.model';

@Component({
  selector: 'app-musician-form-dialog',
  standalone: true,
  templateUrl: './musician-form-dialog.html',
  styleUrl: './musician-form-dialog.scss'
})
export class MusicianFormDialogComponent extends BaseFormComponent<Musician> {
  fields: FormFieldConfig[] = [
    { name: 'firstName', label: 'Primeiro Nome', type: 'text', required: true },
    { name: 'lastName', label: 'Sobrenome', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Telefone', type: 'text' },
    { name: 'voz', label: 'Voz', type: 'select', 
      options: [
        { value: 'Soprano', label: 'Soprano' },
        { value: 'Alto', label: 'Alto' },
        { value: 'Tenor', label: 'Tenor' },
        { value: 'Baixo', label: 'Baixo' }
      ]
    }
  ];

  constructor(
    fb: FormBuilder,
    private dialogRef: MatDialogRef<MusicianFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: Partial<Musician>
  ) {
    super(fb);
    if (data) {
      this.initialData = data;
      this.isEditing = true;
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
```

**Template:**
```html
<h2 mat-dialog-title>{{ isEditing ? 'Editar' : 'Criar' }} Músico</h2>

<mat-dialog-content>
  <app-error-message [error]="errorMessage"></app-error-message>

  <form [formGroup]="form" class="form-container">
    <div class="form-row" *ngFor="let field of fields">
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>{{ field.label }}</mat-label>

        <!-- Text, Email, Password, Number -->
        <input 
          *ngIf="!['textarea', 'select'].includes(field.type)"
          matInput 
          [type]="field.type"
          [formControlName]="field.name"
          [placeholder]="field.placeholder"
        />

        <!-- Textarea -->
        <textarea 
          *ngIf="field.type === 'textarea'"
          matInput 
          [formControlName]="field.name"
          [placeholder]="field.placeholder"
          rows="4"
        ></textarea>

        <!-- Select -->
        <mat-select 
          *ngIf="field.type === 'select'"
          [formControlName]="field.name"
        >
          <mat-option *ngFor="let option of field.options" [value]="option.value">
            {{ option.label }}
          </mat-option>
        </mat-select>

        <mat-hint *ngIf="field.hint">{{ field.hint }}</mat-hint>
        <mat-error>{{ getFieldError(field.name) }}</mat-error>
      </mat-form-field>
    </div>
  </form>
</mat-dialog-content>

<mat-dialog-actions align="end">
  <button mat-button (click)="onCancel()">Cancelar</button>
  <button 
    mat-raised-button 
    color="primary"
    (click)="onSubmit()"
    [disabled]="!form.valid || isSubmitting"
  >
    {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
  </button>
</mat-dialog-actions>
```

## HTTP Requests

### Usando HttpService

```typescript
// GET - Buscar todos
this.httpService.get<Musician>('musicians.json').subscribe(musicians => {
  console.log(musicians);
});

// GET - Buscar um
this.httpService.getById<Musician>('musicians.json', 5).subscribe(musician => {
  console.log(musician);
});

// POST - Criar
const newMusician: CreateMusician = { ... };
this.httpService.create<Musician>('musicians.json', newMusician).subscribe(result => {
  console.log('Criado:', result);
});

// PUT - Atualizar completo
const updates: UpdateMusician = { email: 'novo@example.com' };
this.httpService.update<Musician>('musicians.json', 5, updates).subscribe(result => {
  console.log('Atualizado:', result);
});

// DELETE
this.httpService.delete<Musician>('musicians.json', 5).subscribe(result => {
  console.log('Deletado');
});
```

## Usando Pipes

```html
<!-- Phone Mask -->
<p>{{ '11999999999' | phoneMask }}</p>

<!-- CPF Mask -->
<p>{{ '12345678901' | cpfMask }}</p>

<!-- Date Format -->
<p>{{ '2024-01-26' | dateFormat:'pt-BR' }}</p>

<!-- Truncate -->
<p>{{ 'Lorem ipsum dolor sit amet' | truncate:20 }}</p>
```

## Usando Diretivas

```html
<!-- Prevent Double Click -->
<button appPreventDoubleClick (click)="save()">Salvar</button>

<!-- Auto Focus -->
<input appAutoFocus />

<!-- Highlight -->
<span appHighlight [text]="'João Silva'" [search]="'João'"></span>

<!-- Click Outside -->
<div appClickOutside (clickOutside)="closeMenu()"></div>
```

## Componentes Compartilhados

### Table Component

```html
<app-table
  [data]="musicians$ | async"
  [columns]="musicianColumns"
  [isLoading]="isLoading"
  [hasError]="hasError"
  (onView)="viewMusician($event)"
  (onEdit)="editMusician($event)"
  (onDelete)="deleteMusician($event)"
></app-table>
```

### Error Components

```html
<!-- Mensagem de Erro -->
<app-error-message [error]="errorMessage" type="error"></app-error-message>

<!-- Erros de Validação -->
<app-validation-errors [errors]="formErrors"></app-validation-errors>

<!-- Loading Overlay -->
<app-loading-overlay [isLoading]="isLoading" message="Carregando..."></app-loading-overlay>
```

## Padrão de Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   COMPONENT (musicians.ts)                   │
│                                                               │
│  - Inicializa config                                         │
│  - Injeção de MusicianService                               │
│                                                               │
│  Template: <app-table [data]="data$ | async">               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│           DIALOG / FORM (musician-form-dialog.ts)            │
│                                                               │
│  - Extends BaseFormComponent<Musician>                       │
│  - Define fields: FormFieldConfig[]                          │
│  - Valida e emite dados                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  SERVICE (musician.service.ts)               │
│                                                               │
│  - Extends BaseCrudService<Musician>                         │
│  - Create/Update/Delete calls                                │
│  - Returns Observable<Musician>                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              HTTP SERVICE (core/http/http.service.ts)        │
│                                                               │
│  - POST /musicians.json                                      │
│  - Logging, Error handling                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│          INTERCEPTOR (core/interceptors/...)                 │
│                                                               │
│  - Add headers                                               │
│  - Retry logic                                               │
│  - Global error handling                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                        HTTP CLIENT                           │
│                        (Angular)                             │
└─────────────────────────────────────────────────────────────┘
```

## Boas Práticas

### 1. Sempre use Observables
```typescript
// ✅ Bom
data$ = this.service.list();

// ❌ Evite
data: Musician[] = [];
ngOnInit() {
  this.service.list().subscribe(d => this.data = d);
}
```

### 2. Desinscrição Automática
```typescript
// ✅ Bom - RxJS takeUntil
private destroy$ = new Subject<void>();

ngOnInit() {
  this.data$.pipe(
    takeUntil(this.destroy$)
  ).subscribe(...);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### 3. Type Safety
```typescript
// ✅ Bom - Tipos explícitos
const musician: Musician = {...};
const create: CreateMusician = {...};
const update: UpdateMusician = {...};

// ❌ Evite - any
const data: any = {...};
```

### 4. Validação de Formulários
```typescript
// ✅ Bom - Reactive Forms
form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  phone: ['', Validators.minLength(10)]
});

// ❌ Evite - Template Forms
```

### 5. Change Detection
```typescript
// ✅ Bom - OnPush strategy
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})

// ❌ Evite - Default
```

## Debugging

### Logging
```typescript
// Console estruturado
this.httpService.get(...); // Loga com 🔷
// Erro loga com 🔴
```

### DevTools
```bash
# Chrome DevTools
Ctrl + Shift + J (Windows/Linux) ou Cmd + Option + J (Mac)

# Inspect Elements
Ctrl + Shift + I (Windows/Linux) ou Cmd + Option + I (Mac)
```

### Network Tab
Verifique requisições HTTP, responses e headers

## Próximos Passos

1. Refatore features antigas seguindo o padrão de arquitetura
2. Crie novos componentes reutilizáveis conforme necessário
3. Implemente testes unitários e E2E
4. Configure CI/CD pipeline
5. Otimize bundle size e performance
6. Implemente PWA features
