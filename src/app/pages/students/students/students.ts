import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AppMaterialModule } from '../../../shared/app-material/app-material-module';
import { SharedTableComponent } from '../../../shared/components/table/table';
import { DialogsService } from '../../../shared/services/dialogs.service';
import { BaseCrudListComponent } from '../../../shared/base-classes/base-crud-list.component';
import { ICrudListConfig } from '../../../shared/interfaces/icrud-config';

import { Student } from '../model/student';
import { StudentService } from '../services/student';
import { STUDENT_FORM_FIELDS, getStudentDetailFields } from '../config/student-form.config';
import { STUDENT_COLUMNS } from '../config/student-columns.config';

/**
 * Componente principal de gerenciamento de estudantes
 * Estende BaseCrudListComponent para reutilizar toda lógica de CRUD
 * Responsável apenas por configuração específica de estudantes
 */
@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, AppMaterialModule, SharedTableComponent, MatSnackBarModule],
  templateUrl: './students.html',
  styleUrl: './students.scss',
})
export class StudentComponent extends BaseCrudListComponent<Student> {
  /**
   * Configuração específica de músicos para a base class
   */
  override config: ICrudListConfig<Student> = {
    title: 'Alunos',
    endpoint: 'students.json',
    entityName: 'Aluno',
    columns: STUDENT_COLUMNS,
    formFields: (student?: Student) => STUDENT_FORM_FIELDS(student),
    detailFields: (student: Student) => getStudentDetailFields(student)
  };

  constructor(
    public override service: StudentService,
    dialogsService: DialogsService,
    snackBar: MatSnackBar
  ) {
    super(dialogsService, snackBar);
  }
}

