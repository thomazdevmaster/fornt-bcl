# Aplicação Frontend - BCL

Projeto frontend moderno desenvolvido com **Angular 20** seguindo arquitetura em camadas com separação clara de responsabilidades.

## 📋 Sumário

- [Quick Start](#-quick-start)
- [Documentação](#-documentação)
- [Arquitetura](#-arquitetura)
- [Desenvolvimento](#-desenvolvimento)
- [Testes](#-testes)
- [Build & Deploy](#-build--deploy)

## 🚀 Quick Start

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

Acesse a aplicação em `http://localhost:4200/`

## 📚 Documentação

### Guias Principais

1. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitetura em camadas e padrões
2. **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Como desenvolver novos componentes
3. **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Testes unitários e E2E

### Stack Tecnológico

- **Angular 20** - Framework
- **Angular Material** - UI Components
- **RxJS** - Programação reativa
- **TypeScript 5.9** - Linguagem tipada
- **SCSS** - Pré-processador CSS
- **Karma/Jasmine** - Testes

## 🏗️ Arquitetura

### Estrutura em Camadas

```
Core (Singletons)
    ↓
Shared (Reutilizáveis)
    ↓
Features (Domínio específico)
```

**Camadas:**

| Camada | Responsabilidade | Exemplos |
|--------|------------------|----------|
| **Core** | Singletons, HTTP, Guards | HttpService, AuthGuard, ErrorHandler |
| **Shared** | Componentes reutilizáveis | Table, Dialog, Button, Pipes, Directives |
| **Features** | Lógica de domínio | Músicos, Notícias, Home |

### Padrões Implementados

✅ **SOLID Principles**
- Single Responsibility
- Open/Closed
- Liskov Substitution
- Interface Segregation
- Dependency Inversion

✅ **Design Patterns**
- Singleton (Serviços)
- Factory (HttpService)
- Observer (RxJS)
- Strategy (Pipes/Directives)
- Template Method (BaseComponents)

✅ **Angular Best Practices**
- Standalone Components
- Reactive Forms
- Change Detection Strategy
- OnPush (Performance)
- Lazy Loading
- Type Safety

## 💻 Desenvolvimento

### Criar Novo Componente

```bash
ng generate component pages/novo-recurso/components/meu-componente
```

Estrutura mínima:

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
export class MeuComponenteComponent {}
```

### Criar Novo Serviço

```bash
ng generate service pages/novo-recurso/services/novo-recurso
```

```typescript
import { Injectable } from '@angular/core';
import { BaseCrudService } from '@app/core';
import { HttpService } from '@app/core';

@Injectable({ providedIn: 'root' })
export class NovoRecursoService extends BaseCrudService<NovoRecurso> {
  protected endpoint = 'novo-recurso.json';

  constructor(protected httpService: HttpService) {
    super(httpService);
  }
}
```

### Criar Novo Formulário

Estenda `BaseFormComponent` para aproveitar validação automática:

```typescript
import { BaseFormComponent, FormFieldConfig } from '@app/shared';

@Component({...})
export class MeuFormularioComponent extends BaseFormComponent<MinhaEntidade> {
  fields: FormFieldConfig[] = [
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'nome', label: 'Nome', type: 'text', required: true }
  ];
}
```

### Importações Simplificadas

Use os barrel exports (`index.ts`) para importações limpas:

```typescript
// ✅ Bom
import { HttpService, BaseCrudService, SHARED_PIPES } from '@app/core';
import { ErrorMessageComponent, BaseFormComponent } from '@app/shared';

// ❌ Evite
import { HttpService } from '@app/core/http/http.service';
import { BaseCrudService } from '@app/core/http/base-crud.service';
```

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
npm test

# Modo watch
npm test -- --watch

# Com cobertura
npm test -- --code-coverage

# Teste específico
npm test -- --include='**/musician.service.spec.ts'
```

### Estrutura de Teste

Todos os testes ficam no mesmo diretório do arquivo testado:

```
src/app/pages/musicians/
├── services/
│   ├── musician.service.ts
│   └── musician.service.spec.ts    ← Teste aqui
├── musicians/
│   ├── musicians.ts
│   └── musicians.spec.ts           ← Teste aqui
```

### Exemplo de Teste

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MusicianService } from './musician.service';

describe('MusicianService', () => {
  let service: MusicianService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MusicianService]
    });

    service = TestBed.inject(MusicianService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch musicians', () => {
    const mockData = [{ id: 1, firstName: 'João' }];
    
    service.list().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne('musicians.json');
    req.flush(mockData);
  });
});
```

## 🎨 Estilos

### CSS Variables

Todos os estilos usam variáveis globais definidas em `styles.scss`:

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

// Colors
--mat-primary: #1e88e5
--text-primary: #333
--text-secondary: #999
--bg-primary: #ffffff
```

Uso:

```scss
.my-class {
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
}
```

### Responsividade

Breakpoints:

```scss
// Desktop (>1200px)
// Tablet (961px - 1199px)
// Mobile (≤600px)

@media (max-width: 960px) {
  // Estilos tablet
}

@media (max-width: 600px) {
  // Estilos mobile
}
```

## 🚢 Build & Deploy

### Build para Produção

```bash
npm run build
```

Artifacts: `dist/front/`

**Otimizações automáticas:**
- AOT compilation
- Tree shaking
- Bundle size otimizado
- CSS e JS minificados

### Deploy no Servidor

```bash
# Copiar dist para servidor
scp -r dist/front/* usuario@servidor:/var/www/html/

# Ou usar seu pipeline CI/CD
```

## 📁 Estrutura de Arquivos

```
src/
├── app/
│   ├── core/                  # HTTP, Guards, Interceptors
│   │   ├── http/
│   │   ├── guards/
│   │   └── interceptors/
│   ├── shared/                # Componentes reutilizáveis
│   │   ├── models/
│   │   ├── components/
│   │   ├── pipes/
│   │   ├── directives/
│   │   └── base-classes/
│   ├── pages/                 # Features (Músicos, Notícias, etc)
│   │   ├── musicians/
│   │   ├── news/
│   │   └── home/
│   ├── components/            # Componentes globais (Header)
│   ├── app.ts                 # Componente root
│   ├── app.routes.ts          # Rotas
│   ├── app.config.ts          # Configuração
│   └── app.scss               # Estilos globais
├── assets/                    # Imagens, ícones
├── styles.scss                # Estilos globais
└── index.html                 # HTML raiz
```

## 🔍 Code Quality

### Linting

```bash
npm run lint
```

Configurado em `.eslintrc.json` com regras para:
- TypeScript strict
- Naming conventions
- No unused variables
- Return types explícitos

### Prettier

Formatação automática configurada em `package.json`:

```json
{
  "printWidth": 100,
  "singleQuote": true,
  "useTabs": false,
  "semi": true
}
```

## 📦 Dependências

### Principais

- `@angular/*` - Framework
- `@angular/material` - UI
- `rxjs` - Reatividade
- `tslib` - Utilitários TypeScript

### Desenvolvimento

- `@angular/cli` - CLI
- `typescript` - Transpilador
- `karma/jasmine` - Testes
- `@types/*` - Type definitions

## 🚨 Troubleshooting

### Porta 4200 em uso

```bash
ng serve --port 4300
```

### Limpar cache

```bash
rm -rf node_modules package-lock.json
npm install
```

### Build com erro

```bash
npm run build -- --configuration development
```

## 📞 Suporte

- **Issues:** GitHub Issues
- **Documentação:** Veja ARCHITECTURE.md
- **Desenvolvimento:** Veja DEVELOPMENT_GUIDE.md
- **Testes:** Veja TESTING_GUIDE.md

## 📄 Licença

MIT


```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
