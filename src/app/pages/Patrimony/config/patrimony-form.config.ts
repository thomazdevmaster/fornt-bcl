import { Patrimony, PatrimonyStatus } from '../model/patrimony';
import { IFormFieldConfig } from '../../../shared/components/dialogs/form/IFormDialogData';
import { IDetailField } from '../../../shared/components/dialogs/details/IDetailsDialogData';

export const PATRIMONY_FORM_FIELDS = (item?: Patrimony): IFormFieldConfig[] => [
  {
    fieldName: 'tagNumber',
    label: 'Nº Patrimônio',
    type: 'text',
    value: item?.tagNumber || '',
    required: true
  },
  {
    fieldName: 'name',
    type: 'text',
    label: 'nome do Item',
    value: item?.name || '',
    required: true
  },
  {
    fieldName: 'description',
    label: 'Descrição do Item',
    type: 'textarea',
    value: item?.description || '',
    required: true
  },
  {
    fieldName: 'category',
    label: 'Categoria',
    type: 'select',
    value: item?.category || '',
    options: [
      { label: 'Eletrônico', value: 'Eletrônico' },
      { label: 'Mobiliário', value: 'Mobiliário' },
      { label: 'Patrimonio Musical', value: 'Patrimonio Musical' },
      { label: 'Outro', value: 'Outro' }
    ],
    required: true
  },
  {
    fieldName: 'acquisitionDate',
    label: 'Data de Aquisição',
    type: 'date',
    value: item?.acquisitionDate || '',
    required: false
  },
  {
    fieldName: 'value',
    label: 'Valor',
    type: 'number',
    value: item?.value || 0,
    required: false
  },
  {
    fieldName: 'status',
    label: 'Status',
    type: 'select',
    value: item?.status || PatrimonyStatus.AVAILABLE,
    options: Object.values(PatrimonyStatus).map(s => ({ label: s, value: s })),
    required: true
  },
  {
    fieldName: 'location',
    label: 'Localização',
    type: 'text',
    value: item?.location || '',
    required: true
  },
];

export const getPatrimonyDetailFields = (item: Patrimony): IDetailField[]  => [
  { label: 'Nº Patrimônio', value: item?.tagNumber || '' },
  { label: 'Nome do Item', value: item?.name || '' },
  { label: 'Categoria', value: item?.category || '' },
  { label: 'Status', value: item?.status || PatrimonyStatus.AVAILABLE},
  { label: 'Localização', value: item?.location || '' }
];
