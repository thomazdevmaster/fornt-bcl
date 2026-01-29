import { ICrudEntity } from "../interfaces/icrud-entity";


/**
 * Interface que representa um músico no sistema
 * Estende ICrudEntity para ter id, createdAt e updatedAt
 */
export class PersonModel implements ICrudEntity {
  id!: number;
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  phone?: string;
  birthDate?: Date | string;
  profileIds?: number[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data?: Partial<PersonModel>) {
    Object.assign(this, data);
  }

  get age(): number | null {
    if (!this.birthDate) return null;

    const birth = new Date(this.birthDate);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    // Ajuste caso o aniversário ainda não tenha ocorrido no ano atual
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Verifica se é maior de idade
   */
  get isAdult(): boolean {
    const currentAge = this.age;
    return currentAge !== null && currentAge >= 18;
  }
}

