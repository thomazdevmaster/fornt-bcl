/**
 * Model Base para todas as entidades do sistema
 * Fornece campos comuns como ID e timestamps
 */
export interface BaseEntity {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Type para criação de entidade (sem ID e timestamps)
 */
export type CreateEntity<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Type para atualização de entidade (campos opcionais)
 */
export type UpdateEntity<T> = Partial<CreateEntity<T>>;

/**
 * Resposta paginada do API
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Resposta de erro do API
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Resposta genérica do API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
