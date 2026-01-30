import { TableColumn } from '../../../shared/components/table/models/table-column.model';

/**
 * Configuração das colunas da tabela de músicos
 * Reutilizável em qualquer componente que liste músicos
 */
export const PRESENTATION_COLUMNS: TableColumn[] = [
  { columnName: 'id', columnLabel: '#', sortable: true, findable: true, sortField: 'id' },
  { columnName: 'date', columnLabel: 'Data', sortable: true, findable: true, sortField: 'date' },
  { columnName: 'title', columnLabel: 'Título', sortable: true, findable: true, sortField: 'title' },
  { columnName: 'description', columnLabel: 'Descrição', sortable: false, findable: false },
  { columnName: 'midiaUrl', columnLabel: 'Mídias', sortable: false, findable: false },
  { columnName: 'actions', columnLabel: 'Ações', sortable: false, findable: false }
];
