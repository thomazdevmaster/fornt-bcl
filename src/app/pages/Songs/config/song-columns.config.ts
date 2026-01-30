import { TableColumn } from '../../../shared/components/table/models/table-column.model';

/**
 * Configuração das colunas da tabela de músicos
 * Reutilizável em qualquer componente que liste músicos
 */
export const SONG_COLUMNS: TableColumn[] = [
  { columnName: 'id', columnLabel: '#', sortable: true },
  { columnName: 'title', columnLabel: 'Título', sortable: true, findable: true },
  { columnName: 'author', columnLabel: 'Autor', sortable: true, findable: true },
  { columnName: 'actions', columnLabel: 'Ações', sortable: false, findable: false }
];
