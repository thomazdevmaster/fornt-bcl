import { TableColumn } from '../../../shared/components/table/models/table-column.model';

/**
 * Configuração das colunas da tabela de músicos
 * Reutilizável em qualquer componente que liste músicos
 */
export const PATRIMONY_COLUMNS: TableColumn[] = [
  { columnName: 'type', columnLabel: 'Tipo' },
  { columnName: 'title', columnLabel: 'Título', sortable: true, findable: true },
  { columnName: 'category', columnLabel: 'Categoria', sortable: true, findable: true },
  { columnName: 'date', columnLabel: 'Data', sortable: true },
  { columnName: 'actions', columnLabel: 'Ações' }
];
