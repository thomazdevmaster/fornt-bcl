# Diagnóstico inicial – Layout e UI (base para V2)

## 1. Componentes e telas principais

| Rota | Componente | Descrição |
|------|------------|-----------|
| `''` | redirect | Redireciona para `home` |
| `home` | Home (lazy) | Página inicial: boas-vindas, notícias, atalhos |
| `musicians` | MusicianComponent | Lista/cadastro de músicos |
| `students` | StudentComponent | Lista/cadastro de alunos |
| `presentations` | PresentationComponent | Apresentações |
| `songs` | SongComponent | Repertório/músicas (filtro por instrumento, partes) |
| `gallery` | GalleryComponent | Galeria (admin) |
| `gallery-view` | GalleryViewComponent | Visualização da galeria |
| `study`, `study/:id` | StudyComponent | Estudo/partituras (MusicXML, player) |
| `patrimony` | PatrimonyComponent | Patrimônio |
| `instruments` | InstrumentComponent | Instrumentos |

**Organização:** Rotas em `app.routes.ts` com lazy/loadComponent; apenas `home` usa `NgModule` + `HomeRoutingModule`; demais são standalone.

---

## 2. Navegação atual e problemas em mobile

- **Layout:** `mat-sidenav-container` + `mat-sidenav` (over) + `mat-sidenav-content` com header fixo e `.container` com `router-outlet`.
- **Header:** Toolbar com logo, `shortcuts` (Início, Galeria, Estudo), menu “Admin” (dropdown), ícones de configurações e share. Em viewport &lt; 800px: botão hambúrguer e menu `mat-menu` (mobile); nav horizontal some; entre 757–1200px só ícones no desktop.
- **Sidenav:** Abre por overlay; lista os mesmos `shortcuts` + não repete Admin (no app atual o toggle do sidenav está referenciado no template mas o header não emite `toggleMenu`).

**Problemas em mobile:**
- Navegação principal depende do menu hambúrguer (mat-menu), muitos itens num único menu.
- Sem bottom navigation: troca de área (Início, Partituras, Alunos, Repertório) exige abrir menu e rolar.
- Admin e “Mais” misturados no mesmo padrão (dropdown/menu), pouco claro para usuário móvel.
- Container com `padding: 32px` em desktop e 16px em mobile; em 320px pode ficar apertado.
- Áreas de toque: botões do header podem ser pequenos (ícones 40px); tabelas/listas dependem do `app-shared-table` (mobile card view já existe).

---

## 3. UI – densidade, espaçamento, tipografia, cores, hierarquia

- **Densidade:** Form field com `container-height: 28px` e density -3; tabelas com th/td com padding definido; em mobile já há redução de padding.
- **Espaçamento:** Variáveis `--spacing-xs` a `--spacing-2xl` (4–48px); grid 8px implícito em alguns lugares; `.container` usa gap 5px (desktop), 20px/16px em breakpoints.
- **Tipografia:** `:root` com headings h1–h4; body 14px; em mobile 13px/12px e headings reduzidos; font stack system + Roboto no tema.
- **Cores:** Temas em `_themes.scss` (light/dark); variáveis `--mat-*` e customizadas (`--header-background`, `--card-background`, etc.); light primary azul (#2187da), dark primary magenta.
- **Hierarquia:** Cards com título 18px; tabela com header em primary e uppercase 11px; botões com uppercase e peso 600. Em telas pequenas hierarquia pode se comprimir (títulos 20px/16px).
- **Problemas:** Gap 5px no container desktop muito baixo; botões com `text-transform: uppercase` em tudo podem cansar; alguns contrastes dependem de variáveis que precisam checagem (WCAG); loading com apenas spinner (sem skeleton).

---

## 4. Arquitetura de layout proposta (V2)

- **Mobile-first:**
  - **Header:** Toolbar compacto (logo, título da página opcional, ícone “Mais” e configurações).
  - **Bottom navigation:** 3–5 itens fixos: Início, Partituras/Estudo, Alunos, Repertório/Músicas, Perfil/Config (ou “Mais” no lugar de um deles).
  - **Mais:** Sidenav overlay ou bottom sheet com: Galeria, Músicos, Apresentações, Patrimônio, Instrumentos, Configurações (tema, etc.).
- **Desktop/tablet:** Sidenav fixo (opened) com mesma árvore de navegação; top toolbar com breadcrumb opcional e ações da página; bottom nav escondido.
- **Router:** Transições leves (fade/slide curto) e preservação de estado onde fizer sentido (ex.: lista de músicas com filtro).

---

## 5. Design system (resumo)

- **Cores:** Primária (ex.: azul profundo ou roxo), secundária (ex.: âmbar suave); neutros surface/background/outline; variáveis CSS consistentes com Material 3.
- **Tipografia:** Hierarquia clara (h1–h4), corpo legível em mobile (mín. 16px onde for toque/leitura).
- **Espaçamento:** Grid 8px; variáveis únicas para padding de página (mobile/tablet/desktop).
- **Componentes:** Cards, lists, chips, tabs, dialogs, bottom sheets, snackbars; estados loading (skeleton), empty, error.
- **Acessibilidade:** Contraste, foco visível, aria-labels, áreas de toque ≥ 44px.

Este documento serve de base para a implementação do AppShell, tema global e padrão de página (PageHeader + PageContainer).
