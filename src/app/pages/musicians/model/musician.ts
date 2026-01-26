import { ICrudEntity, CreateEntity, UpdateEntity } from '../../../shared/interfaces/icrud-entity';

/**
 * Interface que representa um músico no sistema
 * Estende ICrudEntity para ter id, createdAt e updatedAt
 */
export interface Musician extends ICrudEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  voz?: string;
  professionalTitle?: string;
  birthDate?: string;
  profileIds?: number[];
  currentInstrumentId?: number;
  currentInstrumentSpecieId?: number;
  playedInstrumentsSpeciesIds?: number[];
}

/**
 * Type para criar novo músico (sem ID e timestamps)
 * Usa CreateEntity genérico
 */
export type CreateMusician = CreateEntity<Musician>;

/**
 * Type para atualizar músico (campos parciais)
 * Usa UpdateEntity genérico
 */
export type UpdateMusician = UpdateEntity<Musician>;
