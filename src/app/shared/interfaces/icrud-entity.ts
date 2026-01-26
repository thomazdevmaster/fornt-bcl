/**
 * Interface que toda entidade CRUD deve implementar
 * Define a contrato mínimo para uma entidade no sistema
 */
export interface ICrudEntity {
  id: number;
  createdAt?: Date;
  updatedAt?: Date;
  // Propriedades comuns a todas entidades
}

/**
 * Tipo para criação de entidade (sem id e sem timestamps)
 * Usado em requisições POST
 *
 * @example
 * type CreateMusician = CreateEntity<Musician>;
 * // Resultado: { firstName, lastName, email, ... } (sem id, createdAt, updatedAt)
 */
export type CreateEntity<T extends ICrudEntity> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Tipo para atualização de entidade (parcial e sem id/timestamps)
 * Usado em requisições PUT/PATCH
 *
 * @example
 * type UpdateMusician = UpdateEntity<Musician>;
 * // Resultado: { firstName?, lastName?, email?, ... } (parcial e sem id/timestamps)
 */
export type UpdateEntity<T extends ICrudEntity> = Partial<CreateEntity<T>>;
