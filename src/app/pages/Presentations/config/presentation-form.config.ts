import { Validators } from '@angular/forms';
import { Presentation } from '../model/presentation';
import { IFormFieldConfig } from '../../../shared/components/dialogs/form/IFormDialogData';
import { IDetailField } from '../../../shared/components/dialogs/details/IDetailsDialogData';
import { MyDateValidators } from 'app/shared/validators/date-validator';

/**
 * Configuração dos campos do formulário de apresentações
 * Reutilizável para create e edit
 */
export const PRESENTATION_FORM_FIELDS = (presentation?: Presentation): IFormFieldConfig[] => [
  {
    fieldName: 'title',
    label: 'Título',
    type: 'text',
    value: presentation?.title || '',
    placeholder: 'Digite o título',
    required: true
  },
  {
    fieldName: 'description',
    label: 'Descrição',
    type: 'text',
    value: presentation?.description || '',
    placeholder: 'Digite a descrição',
    required: false
  },
  {
    fieldName: 'date',
    label: 'Data',
    type: 'date',
    value: presentation?.date || new Date(),
    placeholder: 'Digite a data',
    required: true,
  },
  {
    fieldName: 'location',
    label: 'Localização',
    type: 'text',
    value: presentation?.location || '',
    placeholder: 'Digite a localização',
    required: true
  },
  {
    fieldName: 'responsibleName',
    label: 'Nome do Responsável',
    type: 'text',
    value: presentation?.responsibleName || '',
    placeholder: 'Digite o nome do responsável',
    required: false
  },
  {
    fieldName: 'responsiblePhone',
    label: 'Telefone do Responsável',
    type: 'text',
    value: presentation?.responsiblePhone || '',
    placeholder: '(11) 98765-4321',
    required: false
  },
  {
    fieldName: 'responsibleEmail',
    label: 'Email do Responsável',
    type: 'email',
    value: presentation?.responsibleEmail || '',
    placeholder: 'Digite o email do responsável',
    required: false
  },
  {
    fieldName: 'responsibleName',
    label: 'Nome do Responsável',
    type: 'text',
    value: presentation?.responsibleName || '',
    placeholder: 'Digite o nome do responsável',
    required: false
  },
  {
    fieldName: 'responsiblePhone',
    label: 'Telefone do Responsável',
    type: 'text',
    value: presentation?.responsiblePhone || '',
    placeholder: '(11) 98765-4321',
    required: false
  },
  {
    fieldName: 'midiaUrl',
    label: 'Mídias',
    type: 'textarea',
    value: presentation?.midiaUrl ? presentation.midiaUrl.map(m => m.url).join('\n') : '',
    placeholder: 'Insira as URLs das mídias, uma por linha',
    required: false
  }
];

/**
 * Configuração dos campos de detalhes do apresentação
 */
export const getPresentationDetailFields = (presentation: Presentation): IDetailField[] => [
  { label: '#', value: presentation.id },
  { label: 'Título', value: presentation.title },
  { label: 'Descrição', value: presentation.description || '—' },
  { label: 'Data', value: presentation.date || '—' },
  { label: 'Localização', value: presentation.location || '—' },
  { label: 'Email do Responsável', value: presentation.responsibleEmail || '—' },
  { label: 'Nome do Responsável', value: presentation.responsibleName || '—' },
  { label: 'Telefone do Responsável', value: presentation.responsiblePhone || '—' },
  { label: 'Mídias', value: presentation.midiaUrl ? presentation.midiaUrl.map(m => m.url).join('\n') : '—' },
  { label: 'criado em', value: presentation.createdAt || '—' },
  { label: 'atualizado em', value: presentation.updatedAt || '—' }
];

