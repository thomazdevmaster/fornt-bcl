import { ICrudEntity } from 'app/shared/interfaces/icrud-entity';
import { CreateEntity, UpdateEntity } from 'app/shared/models/base.model';

export enum MediaType {
  PHOTO = 'photo',
  VIDEO = 'video'
}

export class Gallery implements ICrudEntity {
  id!: number;
  createdAt?: Date;
  updatedAt?: Date;

  title: string = '';
  description: string = '';
  date: Date = new Date();
  type: MediaType = MediaType.PHOTO;
  url: string = ''; // Link direto da foto ou vídeo (ex: Google Drive, Youtube, Cloudinary)
  category?: string = ''; // Ex: 'Ensaios', 'Concertos', 'Viagens'

  constructor(data?: Partial<Gallery>) {
    Object.assign(this, data);
  }
}

export type CreateGallery = CreateEntity<Gallery>;
export type UpdateGallery = UpdateEntity<Gallery>;
