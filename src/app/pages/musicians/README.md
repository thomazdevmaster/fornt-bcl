# Módulo Musicians - Arquitetura e Boas Práticas

## Visão Geral

O módulo Musicians segue as melhores práticas de arquitetura Angular com componentes standalone, separação clara de responsabilidades e padrões de design reutilizáveis.

## Estrutura do Módulo

```
musicians/
├── config/
│   └── musician-form.config.ts       # Configurações de formulário e detalhes
├── model/
│   └── musician.ts                   # Interfaces e tipos de dados
├── services/
│   └── musician.ts                   # Serviço de comunicação HTTP
├── musicians/
│   ├── musicians.ts                  # Componente principal
│   ├── musicians.html                # Template
│   └── musicians.scss                # Estilos
└── README.md                          # Este arquivo
```

## Camadas da Arquitetura

### 1. **Model Layer** (`model/musician.ts`)
Responsável por:
- Definição de interfaces de dados (`Musician`)
- Tipos derivados para operações específicas (`CreateMusician`, `UpdateMusician`)
- Type safety em toda a aplicação

**Exemplo:**
```typescript
export interface Musician { /* ... */ }
export type CreateMusician = Omit<Musician, 'id'>;
export type UpdateMusician = Partial<Omit<Musician, 'id'>>;
```

### 2. **Service Layer** (`services/musician.ts`)
Responsável por:
- Comunicação HTTP com o backend
- Métodos CRUD (`list()`, `getById()`, `create()`, `update()`, `delete()`)
- Sem lógica de apresentação ou dialogo
- Métodos documentados com JSDoc

**Características:**
- `@Injectable({ providedIn: 'root' })` - Singleton no escopo raiz
- Usa `HttpClient` para requisições
- Operadores RxJS (`first()`, `tap()`) para controle de fluxo
- Type-safe com parâmetros e retornos tipados

### 3. **Configuration Layer** (`config/musician-form.config.ts`)
Responsável por:
- Configurações de formulário (`MUSICIAN_FORM_FIELDS()`)
- Configurações de detalhe (`getMusicianDetailFields()`)
- DRY principle - evita duplicação de configuração

**Vantagens:**
- Reutilizável em múltiplos componentes
- Fácil manutenção de campos
- Separação entre dados e UI
- Suporta modo create e edit

### 4. **Component Layer** (`musicians/musicians.ts`)
Responsável por:
- Orquestração de diálogos via `DialogsService`
- Manipulação de eventos do usuário
- Gerenciamento de estado local (musicians$, hasError)
- Interação com o serviço

**Padrões Implementados:**
- Observable-driven data flow
- Private method naming convention para métodos internos
- Tratamento de erros com catch e fallback
- User feedback via snackbar
- Injeção de dependências no constructor

## Padrões de Design Utilizados

### 1. **Dependency Injection**
```typescript
constructor(
  private readonly musicianService: MusicianService,
  private readonly dialogsService: DialogsService,
  private readonly snackBar: MatSnackBar
)
```

### 2. **Observable Pattern**
```typescript
musicians$: Observable<Musician[]>;

private setupMusiciansObservable(): Observable<Musician[]> {
  return this.refreshTrigger$.pipe(
    switchMap(() => this.musicianService.list()),
    catchError(error => of([]))
  );
}
```

### 3. **Configuration-Driven UI**
```typescript
const formConfig: IFormDialogData = {
  title: 'Novo Músico',
  submitText: 'Criar',
  fields: MUSICIAN_FORM_FIELDS()  // From config, not hardcoded
};
```

### 4. **Handler Methods Pattern**
```typescript
private handleCreateMusician(formData: any): void { /* ... */ }
private handleUpdateMusician(id: number, formData: any): void { /* ... */ }
private handleDeleteMusician(id: number): void { /* ... */ }
```

## Flow de Execução

### Criar Novo Músico
1. Usuário clica em "Adicionar"
2. `onAdd()` abre formulário via `DialogsService`
3. Usuário preenche o formulário
4. `handleCreateMusician()` chamado com dados do formulário
5. `MusicianService.create()` envia POST ao backend
6. Sucesso: snackbar + refresh da lista
7. Erro: snackbar com mensagem de erro

### Editar Músico
1. Usuário clica em "Editar" 
2. `onEdit(musician)` abre formulário pré-preenchido
3. `MUSICIAN_FORM_FIELDS(musician)` popula valores existentes
4. Usuário modifica dados
5. `handleUpdateMusician()` chamado
6. `MusicianService.update()` envia PUT ao backend
7. Sucesso: snackbar + refresh da lista

### Ver Detalhes
1. Usuário clica em "Visualizar"
2. `onView(musician)` abre modal de detalhes
3. `getMusicianDetailFields(musician)` formata dados para exibição
4. Modal exibe informações em modo read-only
5. Botão "Editar" abre formulário de edição

### Deletar Músico
1. Usuário clica em "Deletar"
2. `onDelete(musician)` abre dialog de confirmação
3. Usuário confirma exclusão
4. `handleDeleteMusician()` chamado
5. `MusicianService.delete()` envia DELETE ao backend
6. Sucesso: snackbar + refresh da lista

## Boas Práticas Implementadas

### ✅ Separação de Responsabilidades
- Model: tipos e interfaces
- Service: comunicação HTTP
- Config: configurações de UI
- Component: orquestração e apresentação

### ✅ DRY (Don't Repeat Yourself)
- Formulários: `MUSICIAN_FORM_FIELDS()`
- Detalhes: `getMusicianDetailFields()`
- Configurações centralizadas

### ✅ Type Safety
- Tipos derivados: `CreateMusician`, `UpdateMusician`
- Interfaces de configuração: `IFormDialogData`, `IDetailsDialogData`
- Todos os métodos tipados

### ✅ Error Handling
- Try/catch em observables
- Feedback ao usuário via snackbar
- Console errors para debug

### ✅ Code Organization
- Métodos privados claramente nomeados
- Métodos públicos com JSDoc
- Constantes em UPPERCASE_WITH_UNDERSCORES
- Imports organizados por tipo

### ✅ Memory Management
- Uso de `readonly` para dependências
- `BehaviorSubject` para refresh control
- Limpeza automática de subscriptions via async pipe

### ✅ Naming Conventions
- Componentes: PascalCase (`MusicianComponent`)
- Métodos: camelCase (`onAdd()`, `handleCreateMusician()`)
- Constantes: UPPER_SNAKE_CASE (`MUSICIAN_FORM_FIELDS`)
- Propriedades privadas: `private readonly` com underscore se necessário

## Extensibilidade

### Adicionar Novo Campo ao Formulário
1. Atualize `Musician` em `model/musician.ts`
2. Adicione campo em `MUSICIAN_FORM_FIELDS()` em `config/musician-form.config.ts`
3. Adicione campo em `getMusicianDetailFields()` se aplicável
4. ✨ Component e service funcionam automaticamente

### Adicionar Novo Componente de Página
1. Crie nova pasta em `src/app/pages/new-feature/`
2. Siga esta estrutura: `config/`, `model/`, `services/`, `new-feature/`
3. Use o padrão de Observable-driven data flow
4. Reutilize `DialogsService` e componentes genéricos

### Adicionar Novo Tipo de Diálogo
1. Crie componente em `src/app/shared/components/dialogs/`
2. Crie interface de configuração `INewDialogData`
3. Adicione método em `DialogsService`
4. Use em qualquer componente sem acoplamento

## Testes Futuros

```typescript
// musician.service.spec.ts
it('should fetch musicians from API', () => {
  const mockMusicians = [/* ... */];
  httpClientSpy.get.and.returnValue(of(mockMusicians));
  service.list().subscribe(musicians => {
    expect(musicians).toEqual(mockMusicians);
  });
});

// musicians.component.spec.ts
it('should open add dialog when onAdd called', () => {
  dialogsServiceSpy.openForm.and.returnValue({ afterClosed: () => of({ /* form data */ }) });
  component.onAdd();
  expect(dialogsServiceSpy.openForm).toHaveBeenCalled();
});
```

## Performance Considerations

1. **Observable Lazy Loading**: `switchMap` apenas executa quando `refreshTrigger$` emite
2. **Single HTTP Request**: `first()` operator cancela subscription após primeira emissão
3. **Async Pipe**: Template usa async pipe para evitar memory leaks
4. **Debounce**: Tabela tem debounce em busca
5. **Pagination**: Tabela suporta paginação para grandes datasets

## Próximos Passos

- [ ] Adicionar unit tests para service e component
- [ ] Implementar cache com HttpClient interceptor
- [ ] Adicionar validators customizados
- [ ] Criar facade pattern se complexidade aumentar
- [ ] Adicionar logs estruturados
- [ ] Implementar analytics de usuário

---

**Último Update**: 2024
**Responsável**: Equipe de Desenvolvimento
