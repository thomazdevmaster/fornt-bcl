import { TableColumn } from '../../../shared/components/table/models/table-column.model';

/**
 * Configuração das colunas da tabela de músicos
 * Reutilizável em qualquer componente que liste músicos
 */
export const SONG_COLUMNS: TableColumn[] = [
  { columnName: 'id', columnLabel: '#', sortable: true, sortField: 'id', findable: true },
  { columnName: 'title', columnLabel: 'Título', sortable: true, sortField: 'title', findable: true },
  { columnName: 'author', columnLabel: 'Autor', sortable: true, sortField: 'author', findable: true },
  { columnName: 'creationDate', columnLabel: 'Criação', sortable: true, sortField: 'creationDate' },
  { columnName: 'partsIcons', columnLabel: 'Instrumentos', sortable: false, template: 'instrumentsTemplate' },
  { columnName: 'actions', columnLabel: 'Ações' }
];

export const INSTRUMENT_ICONS: { [key: string]: string } = {
  'Trompete': '🎺',
  'Trombone': 'fluorescent',
  'Sax Alto': 'album',
  'Sax Tenor': 'album',
  'Clarinete': 'straighten',
  'Flauta': 'horizontal_rule',
  'Percussão': '🥁',
  'Tuba': 'curtains'
}
