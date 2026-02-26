# Estratégia de performance – Estudo (partituras e áudio)

Objetivo: **máxima performance** na renderização da partitura e na execução do áudio, com **usabilidade fluida** e loaders em todo carregamento.

---

## 1. Visão dos fluxos

### 1.1 Papel do maestro

1. Cria o arranjo no MuseScore/Encore e exporta **MusicXML** (grade completa).
2. Em **Songs (repertório)** adiciona a música: título, autor, upload do MusicXML.
3. Sistema **persiste** a música e deixa disponível para estudantes.

### 1.2 Papel do estudante

1. Acessa a app → **Estudo** → vê exemplos + select com músicas do sistema.
2. **Seleciona uma música** → vê partitura renderizada, player pronto, pode alterar instrumentos.
3. **Play** → ouve o áudio (MIDI); ao trocar instrumentos, vê partitura e áudio refletindo a seleção.

### 1.3 Requisitos

- Todas as partituras sem erro devem ser **executáveis**.
- **Excelente performance** (tempo até partitura visível e até primeiro som).
- **Usabilidade fluida**, com loaders em cada etapa de carregamento.

---

## 2. Onde gerar o MIDI: **sempre no backend**

**Recomendação: gerar MIDI no backend no upload e nunca depender de geração no cliente.**

| Abordagem | Vantagem | Desvantagem |
|-----------|----------|-------------|
| **MIDI no backend (recomendado)** | Cliente só baixa arquivo; sem carga de CPU no navegador; funciona para partituras grandes; cache e CDN fáceis. | Backend precisa de lib/conversor (ex.: jMusic, Tone.js em Node, ou serviço). |
| MIDI no cliente (atual em parte) | Não exige conversão no servidor. | Pesado para partituras grandes; hoje já existe “midiOnlyMode” para XML > 2M chars; experiência pior em mobile. |

**Conclusão:**  
- No **upload** (maestro): backend recebe o MusicXML, **gera o MIDI** (job assíncrono ou síncrono com timeout), grava **XML e MIDI no MinIO**.  
- Para o **estudante**: front só consome **XML** (partitura) e **MIDI** (áudio) já prontos; nenhuma chamada “generate MIDi” no fluxo de estudo.

---

## 3. Armazenamento (PostgreSQL + MinIO)

### 3.1 PostgreSQL

Tabela (ou entidade) de **música** (ex.: `songs` ou `scores`):

- `id` (UUID ou Long)
- `title`, `author`
- `created_by` (maestro)
- `created_at`, `updated_at`
- `xml_file_key` (chave no MinIO do MusicXML)
- `midi_file_key` (chave no MinIO do MIDI; `null` até geração terminar)
- `status` (ex.: `PENDING`, `READY`, `ERROR`) — útil se a geração de MIDI for assíncrona
- `meta` (JSON opcional: BPM inicial, time signature, número de partes, etc.) — pode ser preenchido no upload para listagens e validações

### 3.2 MinIO (bucket)

- **MusicXML:** ex.: `songs/{songId}/score.musicxml` (ou `.xml`).
- **MIDI:** ex.: `songs/{songId}/score.midi`.

Política: URLs **assinadas** (temporárias) geradas pelo backend para o front baixar XML e MIDI sem expor o bucket.

---

## 4. Requisições recomendadas

### 4.1 Maestro – Adicionar música

| Método | Endpoint | Corpo / Tipo | Comportamento |
|--------|----------|--------------|----------------|
| **POST** | `/api/songs` | `multipart/form-data`: `file` (MusicXML), `title`, `author` | Backend valida XML, salva no MinIO, **dispara geração de MIDI** (sync ou async), persiste metadados no PostgreSQL. Retorna `{ id, title, author, status }`. |

- Se a geração de MIDI for **assíncrona**: após o job terminar, atualizar `midi_file_key` e `status = READY` (e opcionalmente notificar ou polling no front).

### 4.2 Estudante – Listar músicas

| Método | Endpoint | Resposta |
|--------|----------|----------|
| **GET** | `/api/songs` ou `/api/study/songs` | Lista leve: `[{ id, title, author }]`. Sem arquivos. |

Usar para popular o **select** de músicas e os exemplos (se forem da mesma API).

### 4.3 Estudante – Carregar uma música (partitura + áudio)

Objetivo: **mínimo de round-trips** e **paralelismo** para partitura rápida e áudio pronto quando o usuário clicar em Play.

**Opção A – Manifesto + URLs (recomendada)**

| Ordem | Método | Endpoint | Resposta |
|-------|--------|----------|----------|
| 1 | **GET** | `/api/songs/{id}/study` ou `/api/songs/{id}/manifest` | `{ xmlUrl, midiUrl }` (URLs assinadas MinIO, ex.: válidas 5–15 min). |

Depois o front:

- Faz **GET** em `xmlUrl` (e, em paralelo, **GET** em `midiUrl`).
- Usa o corpo do primeiro para **renderizar a partitura** (OSMD).
- Usa o corpo do segundo para **carregar o player** (MIDI).

**Opção B – XML inline + URL de MIDI**

| Ordem | Método | Endpoint | Resposta |
|-------|--------|----------|----------|
| 1 | **GET** | `/api/songs/{id}/study` | `{ xml: string, midiUrl: string }`. |

- Partitura pode ser renderizada **imediatamente** (já tem o XML).
- Em paralelo o front faz **GET** em `midiUrl` para preparar o áudio.

**Recomendação:** Opção A (manifesto com URLs) reduz tamanho da resposta do backend e permite cache e CDN no MinIO; o front faz 1 chamada ao backend + 2 fetches em paralelo (XML + MIDI).

### 4.4 Estudante – Troca de instrumentos

- **Partitura:** continua como hoje: **filtro no cliente** (ex.: `filterXmlByPartIds`) e re-renderização OSMD. **Nenhuma requisição** ao backend para “só mudar instrumentos na tela”.
- **Áudio:** duas abordagens possíveis:
  - **v1 (simples):** tocar sempre o **MIDI completo** (todas as partes); mudança de instrumentos altera **só a partitura**. Sem nova requisição.
  - **v2 (opcional):** backend expõe algo como `GET /api/songs/{id}/midi?parts=id1,id2` que devolve **URL** de um MIDI gerado apenas com as partes selecionadas (geração sob demanda + cache no MinIO). Front só troca a URL do áudio ao aplicar a seleção.

Para **performance e simplicidade**, recomenda-se começar com **v1**; v2 pode ser evolução.

### 4.5 Resumo de requisições (estudante)

| Ação | Requisições |
|------|--------------|
| Abrir Estudo | `GET /api/songs` (lista). |
| Selecionar música | `GET /api/songs/{id}/study` → `xmlUrl`, `midiUrl`; depois **2 GETs em paralelo**: `xmlUrl`, `midiUrl`. |
| Play | Nenhuma (MIDI já carregado). |
| Trocar instrumentos (só partitura) | Nenhuma. |
| Trocar instrumentos (áudio filtrado, v2) | Opcional: `GET /api/songs/{id}/midi?parts=...` e trocar fonte do player. |

---

## 5. Estratégia de performance no front

### 5.1 Ordem de carregamento ao selecionar música

1. **Manifesto:** `GET /api/songs/{id}/study` → obter `xmlUrl` e `midiUrl`.
2. **Paralelo:**
   - **Thread 1:** fetch XML → assim que chegar, **renderizar partitura (OSMD)** e mostrar loader “Carregando partitura…” até concluir.
   - **Thread 2:** fetch MIDI → ao concluir, **injetar no player** (ex.: `loadMIDI(midi)`); manter loader “Preparando áudio…” até `midiLoaded`.
3. **Player:** pode ser inicializado com um container oculto **assim que o XML estiver disponível** (como hoje), mas o **áudio** passar a ser sempre via **MIDI** (URL ou ArrayBuffer), não via conversão XML no cliente. Isso elimina o “midiOnlyMode” por tamanho e unifica o fluxo.

Efeito: partitura aparece o mais cedo possível; áudio fica pronto em paralelo; ao clicar Play, o atraso é mínimo.

### 5.2 Cache no cliente

- **Lista de músicas:** cache em memória (ex.: por sessão) para não refazer `GET /api/songs` a cada entrada na tela de Estudo.
- **XML e MIDI por música:** cache em memória (ex.: `Map<id, { xml, midi }>`) para não baixar de novo ao trocar de música e voltar.
- **URLs assinadas:** usar dentro da validade; se o usuário ficar muito tempo na mesma música, pode ser necessário renovar (outro `GET /api/songs/{id}/study`) ou o backend devolver TTL maior.

### 5.3 Loaders e estados

- **Lista de músicas:** skeleton ou spinner até `GET /api/songs` retornar.
- **Ao selecionar música:**
  - “Carregando partitura…” até a partitura estar renderizada (OSMD).
  - “Preparando áudio…” (ou “Carregando áudio…”) até o MIDI estar carregado no player.
  - Botão Play desabilitado ou com loader até `midiLoaded === true`.
- **Troca de instrumentos (partitura):** loader breve na área da partitura durante o re-render (filter + OSMD).
- **Erro de rede/MIDI:** mensagem clara e opção de “Tentar novamente” (re-fetch).

### 5.4 Partituras grandes

- Com **MIDI sempre vindo do backend**, o cliente **não precisa** converter XML → áudio para partituras grandes.
- Fluxo único: **sempre** carregar MIDI do backend (ou URL) e usar para playback; XML só para **exibição** e filtro de instrumentos.
- Assim, o “midiOnlyMode” atual (por tamanho de XML) pode ser **removido** ou mantido só como fallback de compatibilidade; o caminho principal passa a ser “sempre MIDI do backend”.

### 5.5 Backend – Geração de MIDI (Spring Boot)

- **Quando:** no upload do MusicXML (maestro) ou, se preferir, em job assíncrono logo após salvar o XML no MinIO.
- **Como:** usar uma lib Java que converta MusicXML → MIDI, por exemplo:
  - **jMusic** (leitura de MusicXML e export MIDI),
  - ou um **wrapper** para um binário (e.g. MuseScore headless, LilyPond) se já estiver no stack.
- **Onde guardar:** MinIO, chave `songs/{songId}/score.midi`.
- **Status:** manter `status` (ex.: `PENDING` / `READY` / `ERROR`) para o front poder mostrar “Áudio em preparação” ou desabilitar Play até estar pronto.

---

## 6. Checklist de implementação

### Backend (Spring Boot + PostgreSQL + MinIO)

- [ ] **POST /api/songs** – upload MusicXML, persistência, geração de MIDI, gravação em MinIO.
- [ ] **GET /api/songs** – listagem (id, title, author).
- [ ] **GET /api/songs/{id}/study** – retorno de `xmlUrl` e `midiUrl` (assinadas).
- [ ] (Opcional v2) **GET /api/songs/{id}/midi?parts=...** – MIDI filtrado por partes, com cache.
- [ ] Tratamento de erros e `status` da música (ex.: READY vs ERROR) para o front não tentar tocar quando não houver MIDI.

### Frontend

- [ ] Trocar fluxo “selecionar música” para: 1) GET study → 2) fetch paralelo XML + MIDI.
- [ ] Priorizar exibição da partitura (XML primeiro) e carregar MIDI em paralelo; manter loaders distintos para partitura e áudio.
- [ ] Unificar playback para **sempre** usar MIDI vindo do backend (remover ou reduzir dependência de conversão XML no cliente para partituras grandes).
- [ ] Cache em memória para lista de músicas e, por música, para XML e MIDI.
- [ ] Loaders e estados de erro em todas as etapas (lista, partitura, áudio, troca de instrumentos).

---

## 7. Resumo

| Decisão | Escolha |
|---------|--------|
| Onde gerar MIDI | **Sempre no backend** (no upload). |
| Armazenamento | PostgreSQL (metadados) + MinIO (XML + MIDI). |
| Requisição principal do estudante | **GET /api/songs/{id}/study** → `xmlUrl` + `midiUrl`; depois 2 GETs em paralelo. |
| Play | Sem requisição; MIDI já carregado. |
| Troca de instrumentos | Partitura: só cliente (filter + re-render). Áudio v1: MIDI completo, sem nova requisição. |
| Performance | Manifesto único, fetches paralelos, cache no cliente, loaders por etapa. |

Com isso, a aplicação fica mais rápida, previsível e escalável, com experiência fluida e loaders claros em cada etapa de carregamento.
