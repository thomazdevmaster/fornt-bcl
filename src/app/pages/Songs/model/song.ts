import { ICrudEntity } from 'app/shared/interfaces/icrud-entity';
import { Imedia } from 'app/shared/interfaces/imedia';
import { CreateEntity, UpdateEntity } from 'app/shared/models/base.model';
import { PersonModel } from 'app/shared/models/person.model';

/**
 * Interface que representa um músico no sistema
 * Estende ICrudEntity para ter id, createdAt e updatedAt
 */
export class Song implements ICrudEntity {
  id!: number;
  createdAt?: Date;
  updatedAt?: Date;

  title: string = '';
  author: string = '';
  arranger: string = ''; // Quem fez o arranjo
  creationDate: Date = new Date();
  sheetMusicUrls: ISongPart[] = []; // Partituras
  midiUrls: ISongPart[] = [];      // Arquivos MIDI
  referenceLink: string = '';      // Link para música (YouTube/Spotify)

  constructor(data?: Partial<Song>) {
    Object.assign(this, data);
  }

}

export interface ISongPart {
  instrument: string;
  voice: string;
  urlSheet?: string;
}

/**
 * Type para criar novo músico (sem ID e timestamps)
 * Usa CreateEntity genérico
 */
export type Create = CreateEntity<Song>;

/**
 * Type para atualizar músico (campos parciais)
 * Usa UpdateEntity genérico
 */
export type Update = UpdateEntity<Song>;
