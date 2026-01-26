/**
 * Interface para configuração de colunas da tabela
 */
export interface TableColumn {
  columnName: string;      // Nome da coluna (id da coluna)
  columnLabel: string;     // Label exibido no header
  sortable?: boolean;      // Permite ordenação (default: true)
  findable?: boolean;      // Permite busca (default: true)
  sortField?: string;      // Campo real para ordenação (se diferente do columnName)
  template?: string;       // Nome do template customizado (opcional)
}
