import { ICrudEntity } from 'app/shared/interfaces/icrud-entity';

export enum PatrimonyStatus {
  AVAILABLE = 'Disponível',
  IN_USE = 'Em Uso',
  MAINTENANCE = 'Manutenção',
  RETIRED = 'Baixado'
}

export class Patrimony implements ICrudEntity {
  id!: number;
  createdAt?: Date;
  updatedAt?: Date;

  tagNumber: string = ''; // Número do Tombo
  name: string = '';
  description: string = '';
  category: string = ''; // Móveis, Eletrônicos, etc.
  acquisitionDate: Date = new Date();
  value: number = 0;
  status: PatrimonyStatus = PatrimonyStatus.AVAILABLE;
  location: string = '';
  imageUrl: string = '';

  constructor(data?: Partial<Patrimony>) {
    Object.assign(this, data);
  }
}
