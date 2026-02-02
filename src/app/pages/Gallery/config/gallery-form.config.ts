import { Gallery, MediaType } from '../model/gallery';
import { IFormFieldConfig } from '../../../shared/components/dialogs/form/IFormDialogData';
import { IDetailField } from '../../../shared/components/dialogs/details/IDetailsDialogData';

export const GALLERY_FORM_FIELDS = (item?: Gallery, existingAlbums: string[] = []): IFormFieldConfig[] => [
  {
    fieldName: 'title',
    label: 'Título',
    type: 'text',
    value: item?.title || '',
    required: true
  },
  {
    fieldName: 'category',
    label: 'Álbum (Categoria)',
    type: 'select',
    value: item?.category || '',
    placeholder: 'Selecione ou digite um novo álbum',
    // Mapeamos os álbuns existentes para o formato do select
    options: existingAlbums.map(album => ({ label: album, value: album })),
    required: true,
    // Se o seu componente de form suportar, adicione uma flag para permitir novos valores
    allowCustomValue: true
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


export const GALLERY_BATCH_FORM = (existingAlbums: string[]): IFormFieldConfig[] => [
  {
    fieldName: 'category',
    label: 'Selecione ou Crie um Álbum',
    type: 'select',
    value: '',
    options: existingAlbums.map(a => ({ label: a, value: a })),
    allowCustomValue: true,
    required: true
  },
  {
    fieldName: 'mediaList',
    label: 'Mídias',
    type: 'media-repeater',
    value: [{ url: '', title: '', type: 'photo', date: new Date() }],
    required: true
  }
];
