import { ICrudEntity } from 'app/shared/interfaces/icrud-entity';
import { Imedia } from 'app/shared/interfaces/imedia';
import { CreateEntity, UpdateEntity } from 'app/shared/models/base.model';
import { PersonModel } from 'app/shared/models/person.model';

/**
 * Interface que representa um músico no sistema
 * Estende ICrudEntity para ter id, createdAt e updatedAt
 */
export class Presentation implements ICrudEntity {
  id!: number;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;

  title: string = '';
  description: string = '';
  date: Date = new Date();
  location: string = '';
  responsibleName: string = '';
  responsibleEmail: string = '';
  responsiblePhone: string = '';
  midiaUrl?: Imedia[];

  constructor(data?: Partial<Presentation>) {
    Object.assign(this, data);
  }

}

/**
 * Type para criar novo músico (sem ID e timestamps)
 * Usa CreateEntity genérico
 */
export type Create = CreateEntity<Presentation>;

/**
 * Type para atualizar músico (campos parciais)
 * Usa UpdateEntity genérico
 */
export type Update = UpdateEntity<Presentation>;
