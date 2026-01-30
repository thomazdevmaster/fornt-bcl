import { Patrimony } from 'app/pages/Patrimony/model/patrimony';
import { ICrudEntity } from 'app/shared/interfaces/icrud-entity';

export enum InstrumentStatus {
  AVAILABLE = 'Disponível',
  IN_USE = 'Em Uso',
  MAINTENANCE = 'Manutenção',
  RETIRED = 'Baixado'
}

export class Instrument extends Patrimony {
  family: string = '';       // Sopros, Percussão...
  type: string = '';         // Ex: Saxofone Alto, clarinete...
  brand: string = '';        // Yamaha, Selmer...
  modelName: string = '';    // Ex: YAS-280
  serialNumber: string = '';

  constructor(data?: Partial<Instrument>) {
    super(data); // Inicializa id, tagNumber, name, location, etc.
    Object.assign(this, data);
  }
}
