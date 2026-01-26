# 📖 Quick Reference Guide

## Comandos Úteis

```bash
# Desenvolvimento
npm start                    # Iniciar servidor
npm test                     # Executar testes
npm run build               # Build produção

# Angular CLI
ng generate component nome   # Criar componente
ng generate service nome     # Criar serviço
ng generate pipe nome        # Criar pipe
ng generate directive nome   # Criar diretiva

# Git
git status                   # Ver mudanças
git add .                    # Stage changes
git commit -m "msg"         # Commit
git push                    # Push
```

## Imports Comuns

```typescript
// Core
import { HttpService, BaseCrudService } from '@app/core';

// Shared
import { 
  SHARED_PIPES, 
  SHARED_DIRECTIVES,
  ErrorMessageComponent,
  BaseFormComponent,
  BaseCrudListComponent
} from '@app/shared';

// Common
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from '@app/shared';
```

## Estrutura de Componente

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from '@app/shared';

@Component({
  selector: 'app-meu-componente',
  standalone: true,
  imports: [CommonModule, AppMaterialModule],
  templateUrl: './meu-componente.html',
  styleUrl: './meu-componente.scss'
})
export class MeuComponenteComponent {
  // Properties
  title = 'Meu Componente';

  // Methods
  doSomething(): void {
    console.log('Fazendo algo');
  }
}
```

## Estrutura de Serviço

```typescript
import { Injectable } from '@angular/core';
import { BaseCrudService } from '@app/core';
import { HttpService } from '@app/core';

interface MyEntity {
  id?: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class MyService extends BaseCrudService<MyEntity> {
  protected endpoint = 'my-entities.json';

  constructor(protected httpService: HttpService) {
    super(httpService);
  }

  // Métodos específicos
  customMethod(): void {
    // Implementation
  }
}
```

## Estrutura de Formulário

```typescript
import { BaseFormComponent, FormFieldConfig } from '@app/shared';

@Component({...})
export class MeuFormComponent extends BaseFormComponent<MyType> {
  fields: FormFieldConfig[] = [
    { 
      name: 'email', 
      label: 'Email', 
      type: 'email', 
      required: true 
    },
    { 
      name: 'name', 
      label: 'Nome', 
      type: 'text', 
      required: true 
    }
  ];

  onSubmit(): void {
    // BaseFormComponent cuidará da validação
    super.onSubmit(); 
  }
}
```

## Estrutura de Componente CRUD

```typescript
import { BaseCrudListComponent } from '@app/shared';
import { ICrudListConfig } from '@app/shared';

@Component({...})
export class MyListComponent extends BaseCrudListComponent<MyEntity> {
  override config: ICrudListConfig<MyEntity> = {
    title: 'Meus Itens',
    endpoint: 'my-entities.json',
    entityName: 'Item',
    columns: COLUMNS_CONFIG,
    formFields: MY_FORM_FIELDS,
    detailFields: (item) => getDetailFields(item)
  };

  constructor(
    public override service: MyService,
    dialogsService: DialogsService,
    snackBar: MatSnackBar
  ) {
    super(dialogsService, snackBar);
  }
}
```

## Template - Form

```html
<form [formGroup]="form">
  <!-- Campo de texto -->
  <mat-form-field appearance="outline">
    <mat-label>Email</mat-label>
    <input matInput formControlName="email" />
    <mat-error>{{ getFieldError('email') }}</mat-error>
  </mat-form-field>

  <!-- Select -->
  <mat-form-field appearance="outline">
    <mat-label>Tipo</mat-label>
    <mat-select formControlName="type">
      <mat-option *ngFor="let option of options" [value]="option">
        {{ option.label }}
      </mat-option>
    </mat-select>
  </mat-form-field>

  <!-- Textarea -->
  <mat-form-field appearance="outline">
    <mat-label>Descrição</mat-label>
    <textarea matInput formControlName="description" rows="4"></textarea>
  </mat-form-field>

  <!-- Botões -->
  <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!form.valid">
    Salvar
  </button>
  <button mat-button (click)="onCancel()">Cancelar</button>
</form>
```

## Template - Table

```html
<app-table
  [data]="data$ | async"
  [columns]="columns"
  [isLoading]="isLoading"
  [hasError]="hasError"
  (onView)="view($event)"
  (onEdit)="edit($event)"
  (onDelete)="delete($event)"
>
</app-table>
```

## Template - Error Handling

```html
<app-error-message 
  [error]="errorMessage" 
  type="error"
></app-error-message>

<app-validation-errors 
  [errors]="validationErrors"
></app-validation-errors>

<app-loading-overlay 
  [isLoading]="isLoading"
  message="Carregando..."
></app-loading-overlay>
```

## Usando Pipes

```html
<!-- Telefone -->
{{ '11999999999' | phoneMask }}
<!-- Output: (11) 99999-9999 -->

<!-- CPF -->
{{ '12345678901' | cpfMask }}
<!-- Output: 123.456.789-01 -->

<!-- Data -->
{{ '2024-01-26' | dateFormat:'pt-BR' }}
<!-- Output: 26/01/2024 -->

<!-- Truncate -->
{{ 'Lorem ipsum dolor sit amet' | truncate:20 }}
<!-- Output: Lorem ipsum dolor si... -->
```

## Usando Directives

```html
<!-- Prevent Double Click -->
<button appPreventDoubleClick (click)="save()">
  Salvar
</button>

<!-- Auto Focus -->
<input appAutoFocus />

<!-- Highlight -->
<span 
  appHighlight 
  [text]="fullText" 
  [search]="searchTerm"
>
</span>

<!-- Click Outside -->
<div appClickOutside (clickOutside)="closeMenu()">
  Menu content
</div>
```

## HTTP Requests

```typescript
// GET - Listar
this.httpService.get<MyType>('endpoint').subscribe(data => {});

// GET - Por ID
this.httpService.getById<MyType>('endpoint', 1).subscribe(data => {});

// GET - Paginado
this.httpService.getPaginated<MyType>('endpoint', {
  page: 1,
  pageSize: 10,
  search: 'termo'
}).subscribe(paginated => {});

// POST - Criar
this.httpService.create<MyType>('endpoint', newItem).subscribe(created => {});

// PUT - Atualizar
this.httpService.update<MyType>('endpoint', 1, updates).subscribe(updated => {});

// PATCH - Atualizar parcial
this.httpService.patch<MyType>('endpoint', 1, partial).subscribe(updated => {});

// DELETE - Deletar
this.httpService.delete<MyType>('endpoint', 1).subscribe(() => {});
```

## Teste - Serviço

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('MyService', () => {
  let service: MyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MyService]
    });

    service = TestBed.inject(MyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch data', () => {
    const mockData = [{ id: 1, name: 'Test' }];

    service.list().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne('endpoint');
    req.flush(mockData);
  });
});
```

## Teste - Pipe

```typescript
import { TestBed } from '@angular/core/testing';
import { PhoneMaskPipe } from '@app/shared';

describe('PhoneMaskPipe', () => {
  let pipe: PhoneMaskPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PhoneMaskPipe]
    });
    pipe = TestBed.inject(PhoneMaskPipe);
  });

  it('should format phone', () => {
    expect(pipe.transform('11999994444')).toBe('(11) 99999-4444');
  });
});
```

## Teste - Componente

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

## CSS - Estilos

```scss
// Usar variáveis globais
.my-element {
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 150ms ease;

  &:hover {
    color: var(--mat-primary);
  }
}

// Responsividade
@media (max-width: 960px) {
  .my-element {
    padding: var(--spacing-sm);
  }
}

@media (max-width: 600px) {
  .my-element {
    padding: var(--spacing-xs);
    font-size: 12px;
  }
}
```

## Interface Genérica

```typescript
// Criar nova entidade
interface MyEntity extends BaseEntity {
  name: string;
  description?: string;
  tags?: string[];
}

// Types automáticos
type CreateMyEntity = CreateEntity<MyEntity>;
type UpdateMyEntity = UpdateEntity<MyEntity>;
```

## Checklist para Novo Recurso

- [ ] Criar modelo em `models/` (estender BaseEntity)
- [ ] Criar serviço em `services/` (estender BaseCrudService)
- [ ] Criar componente lista em `components/`
- [ ] Criar config de colunas (COLUMNS)
- [ ] Criar config de formulário (FORM_FIELDS)
- [ ] Criar dialog de formulário se necessário
- [ ] Adicionar rota em `routes.ts`
- [ ] Criar testes unitários
- [ ] Documentar em README
- [ ] Testar responsividade

## Onde Colocar Cada Coisa

| Tipo | Local |
|------|-------|
| Modelo genérico | `shared/models/` |
| Modelo específico | `pages/[feature]/models/` |
| Serviço genérico | `core/http/` |
| Serviço específico | `pages/[feature]/services/` |
| Componente genérico | `shared/components/` |
| Componente específico | `pages/[feature]/components/` |
| Pipe | `shared/pipes/` |
| Directive | `shared/directives/` |
| Guard | `core/guards/` |
| Interceptor | `core/interceptors/` |

## Atalhos Úteis

```typescript
// Importação rápida
import { ... } from '@app/core';      // Core layer
import { ... } from '@app/shared';    // Shared layer

// Criar Observable
import { of, throwError } from 'rxjs';
of(data).subscribe(...);
throwError(error).subscribe(...);

// RxJS operators
import { map, filter, switchMap, takeUntil } from 'rxjs/operators';

// Validadores
import { Validators } from '@angular/forms';
Validators.required
Validators.email
Validators.minLength(5)
Validators.maxLength(100)
Validators.pattern(/regex/)
```

## Documentação Rápida

- **ARCHITECTURE.md** - Arquitetura geral
- **DEVELOPMENT_GUIDE.md** - Como desenvolver
- **TESTING_GUIDE.md** - Como testar
- **README.md** - Visão geral do projeto
- **IMPLEMENTATION_CHECKLIST.md** - O que foi implementado
- **QUICK_REFERENCE.md** - Este arquivo!

## Links Úteis

- [Angular Docs](https://angular.io)
- [Angular Material](https://material.angular.io)
- [RxJS Docs](https://rxjs.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Jasmine](https://jasmine.github.io)
