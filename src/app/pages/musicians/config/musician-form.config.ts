import { Validators } from '@angular/forms';
import { Musician } from '../model/musician';
import { IFormFieldConfig } from '../../../shared/components/dialogs/form/IFormDialogData';
import { IDetailField } from '../../../shared/components/dialogs/details/IDetailsDialogData';
import { MyDateValidators } from 'app/shared/validators/date-validator';

/**
 * Configuração dos campos do formulário de músicos
 * Reutilizável para create e edit
 */
export const MUSICIAN_FORM_FIELDS = (musician?: Musician): IFormFieldConfig[] => [
  {
    fieldName: 'firstName',
    label: 'Nome',
    type: 'text',
    value: musician?.firstName || '',
    placeholder: 'Digite o nome',
    required: true
  },
  {
    fieldName: 'lastName',
    label: 'Sobrenome',
    type: 'text',
    value: musician?.lastName || '',
    placeholder: 'Digite o sobrenome',
    required: true
  },
  {
    fieldName: 'email',
    label: 'Email',
    type: 'email',
    value: musician?.email || '',
    placeholder: 'Digite o email',
    required: true,
    validators: [Validators.email]
  },
  {
    fieldName: 'phone',
    label: 'Telefone',
    type: 'text',
    value: musician?.phone || '',
    placeholder: '(11) 98765-4321',
    required: false
  },
  {
    fieldName: 'professionalTitle',
    label: 'Função',
    type: 'text',
    value: musician?.professionalTitle || '',
    placeholder: 'Ex: Maestro, Instrumentista...',
    required: false
  },
  {
    fieldName: 'voz',
    label: 'Voz',
    type: 'select',
    value: musician?.voz || '',
    required: false,
    options: [
      { value: '1', label: '1ª' },
      { value: '2', label: '2ª' },
      { value: '3', label: '3ª' },
      { value: '4', label: '4ª' }
    ]
  },
  {
    fieldName: 'birthDate',
    label: 'Data de nascimento',
    type: 'date',
    value: musician?.birthDate || new Date(),
    required: false,
    validators: [MyDateValidators.pastDate()],
    placeholder: "Informe sua data de nascimento"
  }
];

/**
 * Configuração dos campos de detalhes do músico
 */
export const getMusicianDetailFields = (musician: Musician): IDetailField[] => [
  { label: '#', value: musician.id },
  { label: 'Nome', value: `${musician.firstName} ${musician.lastName}` },
  { label: 'Email', value: musician.email },
  { label: 'Telefone', value: musician.phone || '—' },
  { label: 'Função', value: musician.professionalTitle || '—' },
  { label: 'Voz', value: musician.voz || '—' },
  { label: 'Data de nascimento', value: musician.birthDate || '—' },
  { label: 'Perfis', value: musician.profileIds?.join(', ') || '—'},
  { label: 'Instrumento atual', value: musician.currentInstrumentId || '—' },
  { label: 'Espécie do instrumento atual', value: musician.currentInstrumentSpecieId || '—' },
  { label: 'Espécies dos instrumentos tocados', value: musician.playedInstrumentsSpeciesIds?.join(', ') || '—' },
  { label: 'Criado em', value: musician.createdAt ? musician.createdAt.toLocaleDateString() : '—' },
  { label: 'Atualizado em', value: musician.updatedAt ? musician.updatedAt.toLocaleDateString() : '—' }
];

