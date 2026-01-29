import { CreateEntity, UpdateEntity } from 'app/shared/models/base.model';
import { PersonModel } from 'app/shared/models/person.model';

/**
 * Interface que representa um músico no sistema
 * Estende ICrudEntity para ter id, createdAt e updatedAt
 */
export class Student extends PersonModel {
  enrollmentDate?: Date;
  responsibleName?: string;
  responsiblePhone?: string;

  constructor(data?: Partial<Student>) {
    super(data);
  }
}

/**
 * Type para criar novo músico (sem ID e timestamps)
 * Usa CreateEntity genérico
 */
export type Create = CreateEntity<Student>;

/**
 * Type para atualizar músico (campos parciais)
 * Usa UpdateEntity genérico
 */
export type Update = UpdateEntity<Student>;
