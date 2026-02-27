# Entregáveis V2 – Layout e Design System

## 1. Lista objetiva das mudanças por arquivo

### Novos arquivos

| Arquivo | Descrição |
|---------|-----------|
| `src/scss/_design-tokens-v2.scss` | Tokens do design system (espaçamento 8px, página, tipografia, radius, transições, z-index). Importado em `styles.scss`. |
| `src/app/components/app-shell/app-shell.ts` | Componente do shell: BreakpointObserver (960px), bottom nav (mobile), sidenav (desktop + “Mais” no mobile), toolbar, título dinâmico, menu de configurações (tema/cor). |
| `src/app/components/app-shell/app-shell.html` | Template do shell: sidenav, toolbar, router-outlet, bottom nav (5 itens), menu configurações. |
| `src/app/components/app-shell/app-shell.scss` | Estilos do shell: container, sidenav, toolbar, main, bottom nav (fixo, safe-area), menu sections. |
| `src/app/shared/components/page-header/page-header.ts` | Componente de cabeçalho de página: título, subtítulo, botão voltar opcional. |
| `src/app/shared/components/page-header/page-header.html` | Template do page-header. |
| `src/app/shared/components/page-header/page-header.scss` | Estilos do page-header (flex, back link, títulos). |
| `src/app/shared/components/page-container/page-container.ts` | Componente container de página (padding responsivo, max-width). |
| `src/app/shared/components/page-container/page-container.html` | Template do page-container. |
| `src/app/shared/components/page-container/page-container.scss` | Estilos do page-container (variáveis --app-page-*). |
| `docs/DIAGNOSTICO-V2-LAYOUT.md` | Diagnóstico: telas, navegação, problemas mobile, proposta de layout. |
| `docs/ENTREGAVEIS-V2-LAYOUT.md` | Este arquivo. |

### Arquivos alterados

| Arquivo | O que foi alterado |
|---------|--------------------|
| `src/styles.scss` | Import de `_design-tokens-v2.scss`; em `body.study-mobile-fullscreen-active` inclusão de `.app-shell-container`, `.app-shell-content`, `.app-shell-main` e `.page-container` para fullscreen do Study. |
| `src/app/app.html` | Substituído layout antigo (sidenav + header + container + router-outlet) por apenas `<app-app-shell></app-app-shell>`. O `router-outlet` passou a ficar dentro do AppShell. |
| `src/app/app.ts` | Removidos RouterOutlet, RouterModule, Header, MatSidenavModule, MatListModule, MatDividerModule; import e uso de AppShellComponent; mantidos MatIconRegistry e provideNativeDateAdapter. |
| `src/app/app.scss` | Reduzido a `:host` com altura 100% / 100dvh (container antigo e sidenav removidos). |
| `src/app/pages/home/home/home.html` | Envolvido conteúdo em `<app-page-container>`; troca de *ngFor por @for; removidos emojis do título; seção de notícias com aria-labelledby e classe `.section-title`. |
| `src/app/pages/home/home/home.ts` | Import de PageContainerComponent; removidos Shortcut e shortcuts; uso de PageContainerComponent nos imports. |
| `src/app/pages/home/home/home.scss` | Inclusão de `.section-title` junto ao h2 da news-section e uso de `var(--app-heading-2)`. |
| `src/app/pages/students/students/students.html` | Envolvido conteúdo em `<app-page-container>` e `<app-page-header [title]="config.title">`; texto do loading alterado para “Carregando alunos…”. |
| `src/app/pages/students/students/students.ts` | Imports de PageContainerComponent e PageHeaderComponent e inclusão nos imports do componente. |
| `src/app/pages/Songs/songs/songs.html` | Envolvido em `<app-page-container>` e `<app-page-header>` com subtitle; aria-label nos botões de filtro; alt em img; mensagem vazia “Nenhuma música cadastrada”; texto de loading “Carregando músicas…”. |
| `src/app/pages/Songs/songs/songs.ts` | Imports de PageContainerComponent e PageHeaderComponent e inclusão nos imports do componente. |

### Arquivos não alterados (mantidos como estão)

- Rotas (`app.routes.ts`): sem mudança; todas as rotas continuam sendo renderizadas no `router-outlet` dentro do AppShell.
- Header antigo (`components/header/`): mantido no projeto; não é mais usado no root (pode ser removido ou reutilizado depois).
- Tema (`_themes.scss`): sem alteração; design tokens V2 são aditivos em `styles.scss`.
- Demais páginas (Study, Gallery, Musicians, etc.): não refatoradas nesta etapa; podem passar a usar `app-page-container` / `app-page-header` aos poucos.

---

## 2. Novos componentes e como usar

### AppShellComponent (`app-app-shell`)

- **Onde:** Usado uma vez no root em `app.html`.
- **O que faz:** Layout responsivo: em viewport &lt; 960px mostra toolbar + bottom navigation (Início, Partituras, Alunos, Repertório, Mais) e sidenav em overlay ao tocar em “Mais” ou no ícone de menu; em ≥ 960px mostra sidenav fixo (navegação principal + itens “Mais”) e toolbar. O título da toolbar reflete a rota atual. Menu de configurações (tema claro/escuro/sistema, cor primária) no ícone de engrenagem.
- **Uso:** Não é necessário usar em outras telas; o conteúdo das rotas é projetado no `router-outlet` interno.

### PageContainerComponent (`app-page-container`)

- **Uso:** Envolver o conteúdo principal de cada página para padding e max-width consistentes.
- **Exemplo:**  
  `<app-page-container><h1>Título</h1> ... </app-page-container>`
- **Estilo:** Usa `--app-page-padding-x`, `--app-page-padding-y`, `--app-page-max-width` (definidos em `_design-tokens-v2.scss`).

### PageHeaderComponent (`app-page-header`)

- **Inputs:** `title`, `subtitle?`, `showBack?`, `backRoute?`, `backLabel?`.
- **Uso:** No topo da página, antes do conteúdo; para ações principais use `<ng-content>` (projeção).
- **Exemplo:**  
  `<app-page-header [title]="'Alunos'" subtitle="Cadastro e lista"></app-page-header>`  
  Com voltar:  
  `<app-page-header title="Detalhe" [showBack]="true" backRoute="/students"></app-page-header>`

---

## 3. Resultado final esperado

- **Mobile (&lt; 960px):** Toolbar compacta com título da página e ícones (menu, configurações). Conteúdo com padding adequado e área de rolagem. Bottom bar fixa com 5 itens (Início, Partituras, Alunos, Repertório, Mais); “Mais” abre o drawer com Galeria, Músicos, Apresentações, etc. Navegação com poucos toques e áreas de toque ≥ 44px onde aplicado.
- **Desktop (≥ 960px):** Sidenav fixo à esquerda com os 4 itens principais + seção “Mais”; toolbar no topo; conteúdo no centro com padding e max-width; sem bottom nav.
- **Páginas refatoradas (Home, Alunos, Repertório):** Conteúdo dentro de `app-page-container`; Alunos e Repertório com `app-page-header` (título e, em Songs, subtítulo). Home sem header de página (título já na toolbar).
- **Study fullscreen:** Continua funcionando com a classe `body.study-mobile-fullscreen-active`; seletores em `styles.scss` foram estendidos para o novo shell (`.app-shell-*`, `.page-container`).
- **Tema e acessibilidade:** Tema e cor primária configuráveis pelo menu do shell; tokens V2 (tipografia, espaçamento) aplicados; aria-labels e estrutura semântica melhoradas onde tocado.

---

## 4. Checklist de QA (mobile / desktop)

### Navegação

- [ ] **Mobile:** Bottom nav exibe 5 itens e o item ativo fica destacado.
- [ ] **Mobile:** Toque em “Mais” abre o drawer; toque em um link do drawer navega e fecha o drawer.
- [ ] **Mobile:** Ícone de menu na toolbar abre o mesmo drawer “Mais”.
- [ ] **Desktop:** Sidenav visível e fixo; links principais e “Mais” navegam corretamente.
- [ ] **Desktop:** Título na toolbar muda conforme a rota (Início, Partituras, Alunos, Repertório, etc.).

### Layout e responsividade

- [ ] **Mobile (ex.: 320px):** Sem overflow horizontal; conteúdo legível; bottom nav não cobre conteúdo importante (área de scroll com padding-bottom).
- [ ] **Tablet (ex.: 768px):** Comportamento igual ao mobile (bottom nav + drawer) até 960px.
- [ ] **Desktop (≥ 960px):** Sidenav fixo; conteúdo central com max-width e padding; sem bottom nav.

### Páginas refatoradas

- [ ] **Home:** Card de boas-vindas e lista de notícias dentro do container; sem header de página.
- [ ] **Alunos:** Título “Alunos” no page-header; tabela/cards dentro do container; botão adicionar e ações funcionando.
- [ ] **Repertório (Songs):** Título e subtítulo no page-header; filtros por instrumento; tabela e ações (Ver partitura, etc.) funcionando.

### Configurações e tema

- [ ] Menu de configurações (ícone engrenagem) abre e permite alternar tema (claro/escuro/sistema) e cor primária; seleção persiste após reload.

### Study e fullscreen

- [ ] Em modo fullscreen no Study (mobile), a tela ocupa 100% da viewport sem faixas em branco; layout do shell não quebra.

### Acessibilidade

- [ ] Navegação por teclado (Tab) no desktop: foco visível nos links e botões.
- [ ] Botões e links com aria-label onde aplicável (ex.: filtros em Songs).
- [ ] Contraste de texto e fundo aceitável em tema claro e escuro.

### Performance

- [ ] Troca de rota sem travamentos; scroll suave nas listas.
- [ ] Sem reflows desnecessários ao abrir/fechar drawer no mobile.
