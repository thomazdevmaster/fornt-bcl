import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService, QueryConfig } from './http.service';
import { BaseEntity, CreateEntity, UpdateEntity, PaginatedResponse } from '../../shared/models/base.model';

/**
 * Serviço base CRUD genérico que encapsula lógica comum
 * Qualquer serviço de entidade deve estender esta classe
 *
 * @template T - Tipo da entidade
 *
 * @example
 * @Injectable({ providedIn: 'root' })
 * export class MusicianService extends BaseCrudService<Musician> {
 *   protected endpoint = 'musicians.json';
 *   constructor(httpService: HttpService) { super(httpService); }
 * }
 */
@Injectable({
  providedIn: 'root',
})
export abstract class BaseCrudService<T extends BaseEntity> {
  /**
   * Endpoint da API para a entidade
   * Deve ser implementado nas subclasses
   */
  protected abstract endpoint: string;

  constructor(protected readonly httpService: HttpService) {}

  /**
   * Buscar todos os registros
   */
  list(query?: QueryConfig): Observable<T[]> {
    return this.httpService.get<T>(this.endpoint, query);
  }

  /**
   * Buscar um registro por ID
   */
  getById(id: number | string): Observable<T> {
    return this.httpService.getById<T>(this.endpoint, id);
  }

  /**
   * Buscar com paginação
   */
  getPaginated(query: QueryConfig): Observable<PaginatedResponse<T>> {
    return this.httpService.getPaginated<T>(this.endpoint, query);
  }

  /**
   * Criar novo registro
   */
  create(data: CreateEntity<T>): Observable<T> {
    return this.httpService.create<T>(this.endpoint, data);
  }

  /**
   * Atualizar registro completo
   */
  update(id: number | string, data: UpdateEntity<T>): Observable<T> {
    return this.httpService.update<T>(this.endpoint, id, data);
  }

  /**
   * Atualizar registro parcial
   */
  patch(id: number | string, data: Partial<T>): Observable<T> {
    return this.httpService.patch<T>(this.endpoint, id, data);
  }

  /**
   * Deletar registro
   */
  delete(id: number | string): Observable<T> {
    return this.httpService.delete<T>(this.endpoint, id);
  }
}
