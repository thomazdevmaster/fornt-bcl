import { Song } from '../model/song';
import { IFormFieldConfig } from '../../../shared/components/dialogs/form/IFormDialogData';
import { IDetailField } from '../../../shared/components/dialogs/details/IDetailsDialogData';

export const SONG_FORM_FIELDS = (song?: Song): IFormFieldConfig[] => [
  {
    fieldName: 'title',
    label: 'Título da Música',
    type: 'text',
    value: song?.title || '',
    required: true
  },
  {
    fieldName: 'author',
    label: 'Autor',
    type: 'text',
    value: song?.author || '',
    required: true
  },
  {
    fieldName: 'arranger',
    label: 'Arranjo por',
    type: 'text',
    value: song?.arranger || '',
    required: false
  },
  {
    fieldName: 'creationDate',
    label: 'Data de Criação',
    type: 'date',
    value: song?.creationDate || new Date(),
    required: false
  },
  {
    fieldName: 'referenceLink',
    label: 'Link de Referência (URL)',
    type: 'text',
    value: song?.referenceLink || '',
    placeholder: 'https://youtube.com/...',
    required: false
  }
  // Nota: Campos complexos como arrays de partituras/midi geralmente
  // exigem um componente de formulário customizado ou tratamento via textarea/JSON
];

export const getSongDetailFields = (song: Song): IDetailField[] => [
  { label: '#', value: song.id },
  { label: 'Título', value: song.title },
  { label: 'Autor', value: song.author },
  { label: 'Arranjador', value: song.arranger || '—' },
  { label: 'Data de Criação', value: song.creationDate || '—' },
  { label: 'Link', value: song.referenceLink || '—' },
  { label: 'Partituras', value: song.sheetMusicUrls?.length ? `${song.sheetMusicUrls.length} arquivos` : '—' },
  { label: 'MIDIs', value: song.midiUrls?.length ? `${song.midiUrls.length} arquivos` : '—' }
];
