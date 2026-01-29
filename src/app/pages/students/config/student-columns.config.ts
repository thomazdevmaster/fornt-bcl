import { TableColumn } from '../../../shared/components/table/models/table-column.model';

/**
 * Configuração das colunas da tabela de músicos
 * Reutilizável em qualquer componente que liste músicos
 */
export const STUDENT_COLUMNS: TableColumn[] = [
  { columnName: 'id', columnLabel: '#', sortable: true, findable: false },
  { columnName: 'name', columnLabel: 'Nome', sortable: true, findable: true, sortField: 'firstName' },
  { columnName: 'email', columnLabel: 'E-mail', sortable: true, findable: true },
  { columnName: 'phone', columnLabel: 'Telefone', sortable: false, findable: true },
  { columnName: 'enrollmentDate', columnLabel: 'Data matrícula', sortable: true, findable: false },
  { columnName: 'responsibleName', columnLabel: 'Responsável', sortable: true, findable: true },
  { columnName: 'responsiblePhone', columnLabel: 'Telefone do Responsável', sortable: false, findable: true },
  { columnName: 'actions', columnLabel: 'Ações', sortable: false, findable: false }
];
