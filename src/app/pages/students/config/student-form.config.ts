import { Validators } from '@angular/forms';
import { Student } from '../model/student';
import { IFormFieldConfig } from '../../../shared/components/dialogs/form/IFormDialogData';
import { IDetailField } from '../../../shared/components/dialogs/details/IDetailsDialogData';
import { MyDateValidators } from 'app/shared/validators/date-validator';

/**
 * Configuração dos campos do formulário de alunos
 * Reutilizável para create e edit
 */
export const STUDENT_FORM_FIELDS = (student?: Student): IFormFieldConfig[] => [
  {
    fieldName: 'firstName',
    label: 'Nome',
    type: 'text',
    value: student?.firstName || '',
    placeholder: 'Digite o nome',
    required: true
  },
  {
    fieldName: 'lastName',
    label: 'Sobrenome',
    type: 'text',
    value: student?.lastName || '',
    placeholder: 'Digite o sobrenome',
    required: true
  },
  {
    fieldName: 'email',
    label: 'Email',
    type: 'email',
    value: student?.email || '',
    placeholder: 'Digite o email',
    required: true,
    validators: [Validators.email]
  },
  {
    fieldName: 'phone',
    label: 'Telefone',
    type: 'text',
    value: student?.phone || '',
    placeholder: '(11) 98765-4321',
    required: false
  },
  {
    fieldName: 'birthDate',
    label: 'Data de nascimento',
    type: 'date',
    value: student?.birthDate || new Date(),
    required: false,
    validators: [MyDateValidators.pastDate()],
    placeholder: "Informe sua data de nascimento"
  },
  {
    fieldName: 'enrollmentDate',
    label: 'Data de matrícula',
    type: 'date',
    value: student?.enrollmentDate || new Date(),
    required: true,
    disabled: true,
    placeholder: "Informe a data de matrícula"
  },
  {
    fieldName: 'responsibleName',
    label: 'Nome do Responsável',
    type: 'text',
    value: student?.responsibleName || '',
    placeholder: 'Digite o nome do responsável',
    required: student ? !student.isAdult : true
  },
  {
    fieldName: 'responsiblePhone',
    label: 'Telefone do Responsável',
    type: 'text',
    value: student?.responsiblePhone || '',
    placeholder: '(11) 98765-4321',
    required: student ? !student.isAdult : true
  }
];

/**
 * Configuração dos campos de detalhes do aluno
 */
export const getStudentDetailFields = (student: Student): IDetailField[] => [
  { label: '#', value: student.id },
  { label: 'Nome', value: `${student.firstName} ${student.lastName}` },
  { label: 'Email', value: student.email },
  { label: 'Telefone', value: student.phone || '—' },
  { label: 'Data de nascimento', value: student.birthDate || '—' },
  { label: 'Perfis', value: student.profileIds?.join(', ') || '—'},
  { label: 'Data de matrícula', value: student.enrollmentDate || '—' },
  { label: 'Nome do Responsável', value: student.responsibleName || '—' },
  { label: 'Telefone do Responsável', value: student.responsiblePhone || '—' },
  { label: 'Idade', value: student.age !== null ? student.age : '—' },
  { label: 'criado em', value: student.createdAt || '—' },
  { label: 'atualizado em', value: student.updatedAt || '—' }
];

