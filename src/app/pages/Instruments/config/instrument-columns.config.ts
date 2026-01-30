import { TableColumn } from '../../../shared/components/table/models/table-column.model';

/**
 * Configuração das colunas da tabela de músicos
 * Reutilizável em qualquer componente que liste músicos
 */
export const Instrument_COLUMNS: TableColumn[] = [
  { columnName: 'imageUrl', columnLabel: 'Imagem' },
  { columnName: 'tagNumber', columnLabel: 'Nº Patrimônio', sortable: true, findable: true },
  { columnName: 'name', columnLabel: 'Nome', findable: true },
  { columnName: 'family', columnLabel: 'Família', sortable: true },
  { columnName: 'status', columnLabel: 'Status' },
  { columnName: 'actions', columnLabel: 'Ações' }
];
