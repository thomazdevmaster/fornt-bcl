import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { BaseEntity, CreateEntity, UpdateEntity, PaginatedResponse, ApiResponse } from '../../shared/models/base.model';
import { EnvironmentService } from '../services/environment.service';

/**
 * Interface para configurações de query
 */
export interface QueryConfig {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, unknown>;
}

/**
 * Serviço HTTP centralizado para chamadas CRUD
 * Fornece tipagem genérica, logging e tratamento de erros
 *
 * @example
 * const musicians$ = this.httpService.get<Musician>('musicians.json');
 * const musician$ = this.httpService.getById<Musician>('musicians.json', 5);
 * const created$ = this.httpService.create<Musician>('musicians.json', newMusician);
 */
@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(
    private readonly http: HttpClient,
    private readonly envConfig: EnvironmentService
  ) {}

  /**
   * GET - Buscar todos os registros
   */
  get<T extends BaseEntity>(endpoint: string, query?: QueryConfig): Observable<T[]> {
    const params = this.buildHttpParams(query);
    return this.http.get<T[]>(endpoint, { params }).pipe(
      tap((data) => this.log(`[GET] ${endpoint}`, data)),
      catchError((error) => {
        this.logError(`[GET] ${endpoint}`, error);
        throw error;
      })
    );
  }

  /**
   * GET - Buscar um registro por ID
   */
  getById<T extends BaseEntity>(endpoint: string, id: number | string): Observable<T> {
    const url = `${endpoint}/${id}`;
    return this.http.get<T>(url).pipe(
      tap((data) => this.log(`[GET] ${url}`, data)),
      catchError((error) => {
        this.logError(`[GET] ${url}`, error);
        throw error;
      })
    );
  }

  /**
   * GET - Buscar com paginação
   */
  getPaginated<T extends BaseEntity>(
    endpoint: string,
    query: QueryConfig
  ): Observable<PaginatedResponse<T>> {
    const params = this.buildHttpParams(query);
    return this.http.get<PaginatedResponse<T>>(endpoint, { params }).pipe(
      tap((data) => this.log(`[GET PAGINATED] ${endpoint}`, data)),
      catchError((error) => {
        this.logError(`[GET PAGINATED] ${endpoint}`, error);
        throw error;
      })
    );
  }

  /**
   * POST - Criar novo registro
   */
  create<T extends BaseEntity>(endpoint: string, data: CreateEntity<T>): Observable<T> {
    return this.http.post<T>(endpoint, data).pipe(
      tap((result) => this.log(`[POST] ${endpoint}`, result)),
      catchError((error) => {
        this.logError(`[POST] ${endpoint}`, error);
        throw error;
      })
    );
  }

  /**
   * PUT - Atualizar registro completo
   */
  update<T extends BaseEntity>(
    endpoint: string,
    id: number | string,
    data: UpdateEntity<T>
  ): Observable<T> {
    const url = `${endpoint}/${id}`;
    return this.http.put<T>(url, data).pipe(
      tap((result) => this.log(`[PUT] ${url}`, result)),
      catchError((error) => {
        this.logError(`[PUT] ${url}`, error);
        throw error;
      })
    );
  }

  /**
   * PATCH - Atualizar registro parcial
   */
  patch<T extends BaseEntity>(
    endpoint: string,
    id: number | string,
    data: Partial<T>
  ): Observable<T> {
    const url = `${endpoint}/${id}`;
    return this.http.patch<T>(url, data).pipe(
      tap((result) => this.log(`[PATCH] ${url}`, result)),
      catchError((error) => {
        this.logError(`[PATCH] ${url}`, error);
        throw error;
      })
    );
  }

  /**
   * DELETE - Deletar registro
   */
  delete<T extends BaseEntity>(endpoint: string, id: number | string): Observable<T> {
    const url = `${endpoint}/${id}`;
    return this.http.delete<T>(url).pipe(
      tap((result) => this.log(`[DELETE] ${url}`, result)),
      catchError((error) => {
        this.logError(`[DELETE] ${url}`, error);
        throw error;
      })
    );
  }

  /**
   * POST - Ação customizada
   */
  action<TRequest, TResponse>(
    endpoint: string,
    action: string,
    data?: TRequest
  ): Observable<TResponse> {
    const url = `${endpoint}/${action}`;
    return this.http.post<TResponse>(url, data).pipe(
      tap((result) => this.log(`[POST] ${url}`, result)),
      catchError((error) => {
        this.logError(`[POST] ${url}`, error);
        throw error;
      })
    );
  }

  /**
   * Constrói a URL completa com base na configuração de ambiente
   */
  private buildUrl(endpoint: string): string {
    const apiUrl = this.envConfig.getApiUrl();
    // Se o endpoint já começar com http, usa direto
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    // Remove barras iniciais para evitar duplas
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${apiUrl}/${cleanEndpoint}`;
  }

  /**
   * Constrói HttpParams a partir da configuração de query
   */
  private buildHttpParams(query?: QueryConfig): HttpParams {
    let params = new HttpParams();

    if (!query) return params;

    if (query.page !== undefined) params = params.set('page', query.page.toString());
    if (query.pageSize !== undefined) params = params.set('pageSize', query.pageSize.toString());
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);
    if (query.search) params = params.set('search', query.search);

    if (query.filters) {
      Object.entries(query.filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params = params.set(key, String(value));
        }
      });
    }

    return params;
  }

  /**
   * Logging em desenvolvimento
   */
  private log(message: string, data: unknown): void {
    if (!this.envConfig.isProduction()) {
      console.log(`🔷 ${message}`, data);
    }
  }

  /**
   * Logging de erros
   */
  private logError(message: string, error: unknown): void {
    console.error(`🔴 ${message}`, error);
  }
}
