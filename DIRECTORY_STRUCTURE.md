# 📁 Estrutura de Diretórios Completa

```
bcl/front/
│
├── 📄 README.md                          ← Comece aqui!
├── 📄 EXECUTIVE_SUMMARY.md               ← Visão executiva
├── 📄 ARCHITECTURE.md                    ← Arquitetura detalhada
├── 📄 DEVELOPMENT_GUIDE.md               ← Como desenvolver
├── 📄 TESTING_GUIDE.md                   ← Como testar
├── 📄 QUICK_REFERENCE.md                 ← Referência rápida
├── 📄 IMPLEMENTATION_CHECKLIST.md        ← O que foi implementado
├── 📄 DIRECTORY_STRUCTURE.md             ← Este arquivo
│
├── 📦 package.json                       ← Dependências e scripts
├── 📦 tsconfig.json                      ← Config TypeScript
├── 📦 angular.json                       ← Config Angular
├── 📦 .eslintrc.json                     ← Linting rules
│
├── 🎨 src/
│   ├── 🏗️ app/
│   │   │
│   │   ├── 🔷 core/                      ← CORE LAYER (Singletons)
│   │   │   ├── 🔷 http/
│   │   │   │   ├── http.service.ts       ← HTTP centralizado
│   │   │   │   ├── http.service.spec.ts  ← Testes HTTP
│   │   │   │   ├── base-crud.service.ts  ← CRUD genérico
│   │   │   │   └── base-crud.service.spec.ts
│   │   │   │
│   │   │   ├── 🔷 interceptors/
│   │   │   │   └── http-error.interceptor.ts ← Tratamento de erros
│   │   │   │
│   │   │   ├── 🔷 guards/
│   │   │   │   └── auth.guard.ts         ← Autenticação
│   │   │   │
│   │   │   ├── 🔷 error-handler/
│   │   │   │   └── global-error.handler.ts ← Handler global
│   │   │   │
│   │   │   └── 📄 index.ts               ← Barrel exports
│   │   │
│   │   ├── 🟢 shared/                    ← SHARED LAYER (Reutilizáveis)
│   │   │   ├── 🟢 models/
│   │   │   │   ├── base.model.ts         ← BaseEntity, tipos genéricos
│   │   │   │   └── base.model.spec.ts
│   │   │   │
│   │   │   ├── 🟢 components/
│   │   │   │   ├── table/
│   │   │   │   │   ├── table.ts          ← Table component
│   │   │   │   │   ├── table.html
│   │   │   │   │   └── table.scss
│   │   │   │   │
│   │   │   │   ├── dialogs/
│   │   │   │   │   ├── form/
│   │   │   │   │   │   ├── form-dialog.ts
│   │   │   │   │   │   └── IFormDialogData.ts
│   │   │   │   │   ├── details/
│   │   │   │   │   │   ├── details-dialog.ts
│   │   │   │   │   │   └── IDetailsDialogData.ts
│   │   │   │   │   └── delete-confirm/
│   │   │   │   │       └── delete-confirm-dialog.ts
│   │   │   │   │
│   │   │   │   ├── header/
│   │   │   │   │   ├── header.ts         ← Header responsivo
│   │   │   │   │   ├── header.html
│   │   │   │   │   └── header.scss
│   │   │   │   │
│   │   │   │   └── error/
│   │   │   │       ├── error-message.component.ts
│   │   │   │       └── error-message.component.spec.ts
│   │   │   │
│   │   │   ├── 🟢 base-classes/
│   │   │   │   ├── base-form.component.ts     ← Form base genérico
│   │   │   │   ├── base-form.component.spec.ts
│   │   │   │   ├── base-crud-list.component.ts ← CRUD list base
│   │   │   │   └── base-crud-list.component.spec.ts
│   │   │   │
│   │   │   ├── 🟢 pipes/
│   │   │   │   ├── common.pipes.ts       ← PhoneMask, CPF, Date, etc
│   │   │   │   └── common.pipes.spec.ts
│   │   │   │
│   │   │   ├── 🟢 directives/
│   │   │   │   ├── common.directives.ts  ← PreventDoubleClick, AutoFocus, etc
│   │   │   │   └── common.directives.spec.ts
│   │   │   │
│   │   │   ├── 🟢 services/
│   │   │   │   ├── dialogs.service.ts    ← Gerencia diálogos
│   │   │   │   ├── dialogs.service.spec.ts
│   │   │   │   ├── theme.service.ts      ← Gerencia temas
│   │   │   │   └── theme.service.spec.ts
│   │   │   │
│   │   │   ├── 🟢 app-material/
│   │   │   │   └── app-material-module.ts ← Material imports
│   │   │   │
│   │   │   └── 📄 index.ts               ← Barrel exports
│   │   │
│   │   ├── 🟡 pages/                    ← FEATURES LAYER (Domínio)
│   │   │   │
│   │   │   ├── 🟡 musicians/            ← Feature: Músicos
│   │   │   │   ├── 🟡 models/
│   │   │   │   │   └── musician.model.ts    ← Musician interface
│   │   │   │   │
│   │   │   │   ├── 🟡 services/
│   │   │   │   │   ├── musician.service.ts   ← MusicianService
│   │   │   │   │   └── musician.service.spec.ts
│   │   │   │   │
│   │   │   │   ├── 🟡 config/
│   │   │   │   │   ├── musician-columns.config.ts
│   │   │   │   │   └── musician-form.config.ts
│   │   │   │   │
│   │   │   │   ├── 🟡 components/
│   │   │   │   │   └── musician-card/
│   │   │   │   │       ├── musician-card.ts
│   │   │   │   │       ├── musician-card.html
│   │   │   │   │       └── musician-card.scss
│   │   │   │   │
│   │   │   │   ├── 🟡 musicians/        ← Componente principal
│   │   │   │   │   ├── musicians.ts      ← Component extends BaseCrudListComponent
│   │   │   │   │   ├── musicians.html
│   │   │   │   │   ├── musicians.scss
│   │   │   │   │   └── musicians.spec.ts
│   │   │   │   │
│   │   │   │   ├── musicians-module.ts
│   │   │   │   └── musicians-routing-module.ts
│   │   │   │
│   │   │   ├── 🟡 news/                ← Feature: Notícias
│   │   │   │   ├── models/
│   │   │   │   ├── services/
│   │   │   │   ├── config/
│   │   │   │   ├── news/
│   │   │   │   ├── news-module.ts
│   │   │   │   └── news-routing-module.ts
│   │   │   │
│   │   │   └── 🟡 home/                ← Feature: Home
│   │   │       ├── models/
│   │   │       ├── services/
│   │   │       ├── home/
│   │   │       ├── home-module.ts
│   │   │       └── home-routing-module.ts
│   │   │
│   │   ├── 🟠 components/               ← Componentes globais
│   │   │   └── header/                  ← Header global
│   │   │       ├── header.ts
│   │   │       ├── header.html
│   │   │       └── header.scss
│   │   │
│   │   ├── 📄 app.ts                    ← Componente root
│   │   ├── 📄 app.html                  ← Template root
│   │   ├── 📄 app.scss                  ← Estilos root
│   │   ├── 📄 app.spec.ts               ← Testes root
│   │   ├── 📄 app.routes.ts             ← Definição de rotas
│   │   ├── 📄 app.config.ts             ← Config global (providers)
│   │   └── 📄 app.config.server.ts      ← Config server-side
│   │
│   ├── 🎨 assets/                       ← Imagens, ícones, etc
│   │   ├── icons/
│   │   ├── images/
│   │   └── styles/
│   │
│   ├── 📄 index.html                    ← HTML raiz
│   ├── 📄 main.ts                       ← Bootstrap
│   └── 📄 styles.scss                   ← CSS Variables globais
│
├── 🧪 Tests/
│   ├── karma.conf.js                    ← Config Karma
│   └── test.ts                          ← Setup testes
│
├── 📚 public/
│   └── musicians.json                   ← Mock data
│
└── 🔧 Config files
    ├── .eslintrc.json                   ← ESLint config
    ├── .prettierrc (em package.json)    ← Prettier config
    ├── .gitignore
    └── .editorconfig
```

## 📊 Legenda

| Símbolo | Significado |
|---------|------------|
| 🔷 | Core Layer - Singletons |
| 🟢 | Shared Layer - Reutilizáveis |
| 🟡 | Feature Layer - Domínio específico |
| 🟠 | Componentes globais |
| 📄 | Arquivo |
| 📁 | Diretório |
| 🔧 | Arquivo de configuração |
| 🧪 | Arquivo de teste |
| 📚 | Assets/Public |

## 🎯 Padrão de Nomeação

### Componentes
```
[feature]/[type]/[name]/[name].[type].ts
Exemplo: pages/musicians/components/musician-card/musician-card.component.ts
```

### Serviços
```
[feature]/services/[name].service.ts
Exemplo: pages/musicians/services/musician.service.ts
```

### Modelos
```
[feature]/models/[name].model.ts
Exemplo: pages/musicians/models/musician.model.ts
```

### Pipes/Directives
```
shared/pipes/[name].pipe.ts
shared/directives/[name].directive.ts
Exemplo: shared/pipes/phone-mask.pipe.ts
```

### Testes
```
[file].spec.ts
Exemplo: musician.service.spec.ts
```

## 🔄 Fluxo de Dados

```
User Interaction (Template)
        ↓
    Component
        ↓
    Service (BaseCrudService)
        ↓
    HttpService (Core)
        ↓
    HttpInterceptor
        ↓
    HttpClient (Angular)
        ↓
        API
```

## 📦 Imports Circulares - ❌ Evitar

Estrutura previne imports circulares:

```
pages/musicians/components
    ↓ (não importa de)
pages/musicians/services
    ↓ (não importa de)
shared/
    ↓ (não importa de)
core/

✅ Fluxo correto: core → shared → pages
```

## 🏃 Crescimento Esperado

### Adicionar Nova Feature
1. Criar pasta em `pages/[nova-feature]/`
2. Criar `models/[entity].model.ts`
3. Criar `services/[entity].service.ts`
4. Criar `[entity]/[entity].component.ts`
5. Pronto!

### Adicionar Novo Pipe
1. Adicionar em `shared/pipes/common.pipes.ts`
2. Exportar em `SHARED_PIPES`
3. Usar em templates

### Adicionar Nova Directiva
1. Adicionar em `shared/directives/common.directives.ts`
2. Exportar em `SHARED_DIRECTIVES`
3. Usar em templates

## 📈 Escalabilidade

A estrutura suporta:
- ✅ 100+ componentes
- ✅ 50+ serviços
- ✅ 20+ features
- ✅ Múltiplos times
- ✅ Micro-frontends (futuro)

## 🔒 Isolamento de Responsabilidades

```
CORE          → HTTP, Segurança, Configuração global
SHARED        → UI, Utilitários, Componentes comuns
PAGES         → Lógica de negócio, Features específicas
COMPONENTS    → Componentes do app todo
```

Cada camada:
- ✅ Independente
- ✅ Testável
- ✅ Reutilizável
- ✅ Escalável

---

**Estrutura criada para durabilidade, escalabilidade e manutenção! 🚀**
