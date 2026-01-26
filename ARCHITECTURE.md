# Arquitetura da Aplicação Angular 20

## Visão Geral

Esta aplicação segue uma arquitetura em camadas bem definida, promovendo separação de responsabilidades, reutilização de código e escalabilidade.

## Estrutura de Pastas

```
src/app/
├── core/                          # Camada Core - Singletons e configuração
│   ├── http/
│   │   ├── http.service.ts       # Serviço HTTP centralizado
│   │   └── base-crud.service.ts  # Serviço CRUD genérico
│   ├── interceptors/
│   │   └── http-error.interceptor.ts
│   ├── guards/
│   │   └── auth.guard.ts
│   └── error-handler/
│       └── global-error.handler.ts
│
├── shared/                        # Camada Shared - Componentes reutilizáveis
│   ├── models/
│   │   └── base.model.ts         # Interfaces e tipos base
│   ├── components/
│   │   ├── table/                # Componente de tabela genérico
│   │   ├── dialogs/              # Diálogos compartilhados
│   │   ├── header/               # Header da aplicação
│   │   └── error/                # Componentes de erro/loading
│   ├── base-classes/
│   │   ├── base-form.component.ts
│   │   └── base-crud-list.component.ts
│   ├── pipes/
│   │   └── common.pipes.ts       # Pipes reutilizáveis
│   ├── directives/
│   │   └── common.directives.ts  # Diretivas reutilizáveis
│   ├── services/
│   │   └── dialogs.service.ts
│   └── app-material/
│       └── app-material-module.ts
│
├── pages/                         # Camada Feature - Features isoladas
│   ├── musicians/
│   │   ├── models/
│   │   │   └── musician.model.ts
│   │   ├── services/
│   │   │   └── musician.service.ts
│   │   ├── config/
│   │   ├── musicians/
│   │   │   ├── musicians.ts (Component)
│   │   │   ├── musicians.html
│   │   │   └── musicians.scss
│   │   └── musicians-routing.module.ts
│   ├── news/
│   └── home/
│
├── components/                    # Componentes gerais (Header, Footer)
│   └── header/
│
├── app.ts                        # Componente root
├── app.routes.ts                 # Definição de rotas
├── app.config.ts                 # Configuração global
└── app.scss                      # Estilos globais
```

## Padrões e Boas Práticas

### 1. Camada Core

**Responsabilidades:**
- Serviços singleton (HttpService, AuthService, ErrorHandler)
- Interceptadores HTTP
- Guards de autenticação/autorização
- Tratamento centralizado de erros

**Características:**
```typescript
// HttpService - Centraliza toda comunicação HTTP
const musicians$ = this.httpService.get<Musician>('musicians.json');

// BaseCrudService - Genérico para qualquer CRUD
export class MusicianService extends BaseCrudService<Musician> {
  protected endpoint = 'musicians.json';
}
```

### 2. Camada Shared

**Responsabilidades:**
- Componentes reutilizáveis (Table, Dialog, Buttons)
- Pipes e Directives comum
- Modelos e interfaces base
- Serviços compartilhados (DialogsService, ThemeService)

**Componentes Base:**
```typescript
// BaseFormComponent - Para todos os formulários
export class CreateMusicianDialog extends BaseFormComponent<Musician> {
  fields: FormFieldConfig[] = [...]
}

// BaseCrudListComponent - Para listar e gerenciar entidades
export class MusicianComponent extends BaseCrudListComponent<Musician> {
  config: ICrudListConfig<Musician> = {...}
}
```

**Pipes Disponíveis:**
- `phoneMask` - (11) 99999-9999
- `cpfMask` - 123.456.789-01
- `dateFormat` - 26/01/2024
- `truncate` - Lorem ip...

**Diretivas Disponíveis:**
- `appPreventDoubleClick` - Previne duplo clique
- `appAutoFocus` - Auto-focus em input
- `appHighlight` - Highlight de texto
- `appClickOutside` - Detect clique fora do elemento

### 3. Camada Feature (Pages)

**Responsabilidades:**
- Componentes específicos da feature
- Serviços de dados (estender BaseCrudService)
- Modelos e tipos da feature
- Configurações da feature
- Rotas e lazy loading

**Padrão de Feature:**
```typescript
// 1. Modelo
export interface Musician extends BaseEntity { ... }

// 2. Serviço
@Injectable({ providedIn: 'root' })
export class MusicianService extends BaseCrudService<Musician> {
  protected endpoint = 'musicians.json';
}

// 3. Componente
@Component({ ... })
export class MusicianComponent extends BaseCrudListComponent<Musician> {
  config: ICrudListConfig<Musician> = {
    title: 'Músicos',
    endpoint: 'musicians.json',
    ...
  };
}
```

## Tipos Genéricos

### BaseEntity
Toda entidade deve estender `BaseEntity`:
```typescript
export interface Musician extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  // ... outras propriedades
}
```

`BaseEntity` fornece:
- `id?: number`
- `createdAt?: string`
- `updatedAt?: string`

### CreateEntity<T>
Para criar novo registro (sem ID, sem timestamps):
```typescript
type CreateMusician = CreateEntity<Musician>;
const newMusician: CreateMusician = {
  firstName: 'João',
  lastName: 'Silva',
  email: 'joao@example.com'
};
```

### UpdateEntity<T>
Para atualizar registro (todos campos opcionais):
```typescript
type UpdateMusician = UpdateEntity<Musician>;
const updates: UpdateMusician = {
  email: 'novo@example.com'
};
```

## Fluxo de Requisições HTTP

```
Component
    ↓
FormComponent/Dialog
    ↓
Service (MusicianService)
    ↓
BaseCrudService
    ↓
HttpService (core/http)
    ↓
HttpInterceptor (retry, headers, logging)
    ↓
HttpClient (Angular)
    ↓
API
```

## Injeção de Dependências

Todos os serviços usam `providedIn: 'root'` para injeção simplificada:

```typescript
@Injectable({ providedIn: 'root' })
export class MusicianService extends BaseCrudService<Musician> {}

// Uso
constructor(private musicianService: MusicianService) {}
```

## Tratamento de Erros

**Global:**
- `GlobalErrorHandler` - Captura erros não tratados
- `HttpErrorInterceptor` - Trata erros HTTP, retry automático

**Local:**
- Try-catch em serviços
- Observable.catchError em streams
- Componentes de erro/validação

```typescript
// ErrorMessageComponent
<app-error-message [error]="errorMessage"></app-error-message>

// Validação de formulário
<app-validation-errors [errors]="formErrors"></app-validation-errors>

// Loading
<app-loading-overlay [isLoading]="isLoading"></app-loading-overlay>
```

## Estilos Globais

Todos os estilos usam CSS Variables do `styles.scss`:

```scss
// Spacing
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px

// Border Radius
--radius-xs: 2px
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px

// Shadows
--shadow-sm: 0 2px 4px
--shadow-md: 0 4px 8px
--shadow-lg: 0 8px 16px

// Colors
--mat-primary: #1e88e5
--text-primary: #333
--text-secondary: #999
--bg-primary: #ffffff
--bg-secondary: #f5f5f5
```

## Responsividade

Breakpoints definidos:
- **Desktop:** > 1200px
- **Tablet:** 961px - 1199px
- **Mobile:** ≤ 600px

Exemplos:
```scss
.element {
  font-size: 16px;

  @media (max-width: 960px) {
    font-size: 14px;
  }

  @media (max-width: 600px) {
    font-size: 12px;
  }
}
```

## Testing

Estrutura de testes:

```typescript
describe('MusicianService', () => {
  let service: MusicianService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MusicianService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

## Performance

**Otimizações Implementadas:**
- OnPush change detection em componentes
- Lazy loading de routes
- RxJS operators (switchMap, debounceTime, etc)
- Unsubscribe automático com Signals
- Memoização de cálculos custosos

## Deploy

**Build:**
```bash
npm run build
```

**Configurações:**
- AOT compilation ativado
- Tree shaking automático
- Bundle size otimizado
- CSS e JS minificados

## Roadmap de Melhorias

- [ ] Implementar paginação no componente Table
- [ ] Adicionar infinite scroll option
- [ ] State management com NgRx
- [ ] Autenticação JWT
- [ ] Caching strategy com Service Worker
- [ ] Testes E2E com Cypress
- [ ] Documentação com Storybook
- [ ] PWA - Progressive Web App
- [ ] Analytics integrado
- [ ] Suporte a i18n (múltiplos idiomas)
