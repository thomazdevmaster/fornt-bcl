import { Gallery, MediaType } from '../model/gallery';
import { IFormFieldConfig } from '../../../shared/components/dialogs/form/IFormDialogData';
import { IDetailField } from '../../../shared/components/dialogs/details/IDetailsDialogData';

export const GALLERY_FORM_FIELDS = (item?: Gallery): IFormFieldConfig[] => [
  {
    fieldName: 'title',
    label: 'Título',
    type: 'text',
    value: item?.title || '',
    required: true
  },
  {
    fieldName: 'type',
    label: 'Tipo de Média',
    type: 'select', // Assumindo que o seu form dinâmico suporta select
    value: item?.type || MediaType.PHOTO,
    options: [
      { label: 'Foto', value: MediaType.PHOTO },
      { label: 'Vídeo', value: MediaType.VIDEO }
    ],
    required: true
  },
  {
    fieldName: 'date',
    label: 'Data do Registo',
    type: 'date',
    value: item?.date || new Date(),
    required: true
  },
  {
    fieldName: 'url',
    label: 'URL do Ficheiro / Link',
    type: 'text',
    value: item?.url || '',
    placeholder: 'https://...',
    required: true
  },
  {
    fieldName: 'category',
    label: 'Categoria/Evento',
    type: 'text',
    value: item?.category || '',
    required: false
  },
  {
    fieldName: 'description',
    label: 'Descrição',
    type: 'textarea',
    value: item?.description || '',
    required: false
  }
];

export const getGalleryDetailFields = (item: Gallery): IDetailField[] => [
  { label: '#', value: item.id },
  { label: 'Título', value: item.title },
  { label: 'Tipo', value: item.type === MediaType.PHOTO ? '📷 Foto' : '🎥 Vídeo' },
  { label: 'Data', value: item.date },
  { label: 'Categoria', value: item.category || '—' },
  { label: 'Link', value: item.url },
  { label: 'Descrição', value: item.description || '—' }
];
