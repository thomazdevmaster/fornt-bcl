import { BaseEntity, CreateEntity, UpdateEntity } from '../../../shared/models/base.model';

/**
 * Modelo para Músico
 * Estende BaseEntity para ter id, createdAt, updatedAt
 */
export interface Musician extends BaseEntity {
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
 * Type para criar novo músico
 */
export type CreateMusician = CreateEntity<Musician>;

/**
 * Type para atualizar músico
 */
export type UpdateMusician = UpdateEntity<Musician>;

/**
 * Resposta detalhada do músico com relacionamentos
 */
export interface MusicianDetail extends Musician {
  instruments?: string[];
  currentInstrument?: string;
  profile?: { id: number; name: string };
}

/**
 * Filtros para busca de músicos
 */
export interface MusicianFilters {
  search?: string;
  voz?: string;
  instrumentId?: number;
  page?: number;
  pageSize?: number;
}
