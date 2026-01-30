import { Instrument, InstrumentStatus } from '../model/instrument';
import { IFormFieldConfig } from '../../../shared/components/dialogs/form/IFormDialogData';
import { IDetailField } from '../../../shared/components/dialogs/details/IDetailsDialogData';
import { PATRIMONY_FORM_FIELDS } from 'app/pages/Patrimony/config/patrimony-form.config';

export const INSTRUMENT_FORM_FIELDS = (instrument?: Instrument): IFormFieldConfig[] => {
  // Pegamos os campos base do patrimônio
  const baseFields = PATRIMONY_FORM_FIELDS(instrument);

  // Adicionamos os campos específicos de instrumento
  const specificFields: IFormFieldConfig[] = [
    {
      fieldName: 'family',
      label: 'Família do Instrumento',
      type: 'text',
      value: instrument?.family || '',
      placeholder: 'Ex: Madeiras, Metais...',
      required: true
    },
    {
      fieldName: 'brand',
      label: 'Marca',
      type: 'text',
      value: instrument?.brand || '',
      required: false
    },
    {
      fieldName: 'serialNumber',
      label: 'Número de Série',
      type: 'text',
      value: instrument?.serialNumber || '',
      required: false
    },
    {
      fieldName: 'status',
      label: 'Status do Instrumento',
      type: 'select',
      value: instrument?.status || InstrumentStatus.AVAILABLE,
      options: Object.entries(InstrumentStatus).map(([key, label]) => ({
        value: key,
        label
      })),
      required: true
    },
    {
      fieldName: 'imageUrl',
      label: 'URL da Imagem',
      type: 'text',
      value: instrument?.imageUrl || '',
      placeholder: 'https://exemplo.com/imagem.jpg',
      required: false
    }
  ];

  return [...baseFields, ...specificFields];
};

export const getInstrumentDetailFields = (item: Instrument): IDetailField[]  => [
  { label: 'Nº Patrimônio', value: item.tagNumber },
  { label: 'Localização', value: item.location },
  { label: 'Família', value: item.family },
  { label: 'Marca', value: item.brand },
  { label: 'Nº Série', value: item.serialNumber },
  { label: 'Status', value: item.status },
  { label: 'Imagem', value: item.imageUrl ? `<img src="${item.imageUrl}" alt="Imagem do Instrumento" style="max-width: 200px; max-height: 200px;" />` : '—' }
];
