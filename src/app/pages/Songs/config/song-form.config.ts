import { IFormFieldConfig } from "app/shared/components/dialogs/form/IFormDialogData";
import { Song } from "../model/song";
import { IDetailField } from "app/shared/components/dialogs/details/IDetailsDialogData";

export const SONG_FORM_FIELDS = (song?: Song): IFormFieldConfig[] => [
  { fieldName: 'title', label: 'Título', type: 'text', value: song?.title || '', required: true },
  { fieldName: 'author', label: 'Autor', type: 'text', value: song?.author || '', required: true },
  { fieldName: 'arranger', label: 'Arranjador', type: 'text', value: song?.arranger || '' },
  { fieldName: 'creationDate', label: 'Data', type: 'date', value: song?.creationDate || new Date() },
  { fieldName: 'referenceLink', label: 'YouTube', type: 'text', value: song?.referenceLink || '' }
];

export const getSongDetailFields = (song: Song): IDetailField[] => [
  { label: 'Título', value: song.title },
  { label: 'Autor', value: song.author },
  { label: 'Arranjador', value: song.arranger || '—' },
  { label: 'YouTube', value: song.referenceLink || '—' }
];
