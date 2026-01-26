import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import { ICrudEntity, CreateEntity, UpdateEntity } from '../interfaces/icrud-entity';

/**
 * Serviço CRUD genérico que pode ser estendido para qualquer entidade
 *
 * Fornece métodos padrão para:
 * - Listar todas as entidades
 * - Buscar entidade por ID
 * - Criar nova entidade
 * - Atualizar entidade existente
 * - Deletar entidade
 *
 * @template T - Tipo da entidade que estende ICrudEntity
 *
 * @example
 * @Injectable({ providedIn: 'root' })
 * export class MusicianService extends BaseCrudService<Musician> {
 *   protected override get endpoint(): string {
 *     return this.envConfig.getApiUrl() + '/musicians.json';
 *   }
 *   constructor(httpClient: HttpClient, private envConfig: EnvironmentService) {
 *     super(httpClient);
 *   }
 * }
 */
export abstract class BaseCrudService<T extends ICrudEntity> {
  /**
   * Getter para o endpoint da API
   * Deve ser definido nas subclasses para retornar a URL completa
   * @example protected override get endpoint(): string { return 'http://api/musicians.json'; }
   */
  protected abstract get endpoint(): string;

  constructor(protected readonly httpClient: HttpClient) {}

  /**
   * Lista todas as entidades
   *
   * @returns Observable com array de entidades
   *
   * @example
   * this.musicianService.list().subscribe(musicians => {
   *   console.log(musicians);
   * });
   */
  list(): Observable<T[]> {
    return this.httpClient.get<T[]>(this.endpoint).pipe(
      first(),
      tap(data => console.log(`[${this.endpoint}] Carregado:`, data))
    );
  }

  /**
   * Busca uma entidade específica por ID
   *
   * @param id - ID da entidade
   * @returns Observable com a entidade encontrada
   *
   * @example
   * this.musicianService.getById(5).subscribe(musician => {
   *   console.log(musician);
   * });
   */
  getById(id: number): Observable<T> {
    return this.httpClient.get<T>(`${this.endpoint}/${id}`).pipe(
      first(),
      tap(data => console.log(`[${this.endpoint}/${id}] Carregado:`, data))
    );
  }

  /**
   * Cria nova entidade
   *
   * @param entity - Dados da entidade a criar (sem ID)
   * @returns Observable com a entidade criada (incluindo ID)
   *
   * @example
   * const newMusician: CreateMusician = { firstName: 'João', ... };
   * this.musicianService.create(newMusician).subscribe(musician => {
   *   console.log('Criado com ID:', musician.id);
   * });
   */
  create(entity: CreateEntity<T>): Observable<T> {
    return this.httpClient.post<T>(this.endpoint, entity).pipe(
      tap(data => console.log(`[${this.endpoint}] Criado:`, data))
    );
  }

  /**
   * Atualiza uma entidade existente
   *
   * @param id - ID da entidade a atualizar
   * @param entity - Dados parciais a atualizar
   * @returns Observable com a entidade atualizada
   *
   * @example
   * const updates: UpdateMusician = { email: 'novo@email.com' };
   * this.musicianService.update(5, updates).subscribe(musician => {
   *   console.log('Atualizado:', musician);
   * });
   */
  update(id: number, entity: UpdateEntity<T>): Observable<T> {
    return this.httpClient.put<T>(`${this.endpoint}/${id}`, entity).pipe(
      tap(data => console.log(`[${this.endpoint}/${id}] Atualizado:`, data))
    );
  }

  /**
   * Deleta uma entidade
   *
   * @param id - ID da entidade a deletar
   * @returns Observable vazio (void)
   *
   * @example
   * this.musicianService.delete(5).subscribe(() => {
   *   console.log('Deletado com sucesso');
   * });
   */
  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.endpoint}/${id}`).pipe(
      tap(() => console.log(`[${this.endpoint}/${id}] Deletado`))
    );
  }
}
