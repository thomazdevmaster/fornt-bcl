import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseCrudService } from '../../../shared/base-classes/base-crud.service';
import { EnvironmentService } from '../../../core/services/environment.service';
import { Musician } from '../model/musician';

/**
 * Serviço de dados para gerenciar músicos
 * Estende BaseCrudService para reutilizar lógica de CRUD
 * Responsável apenas por comunicação HTTP com o backend
 *
 * Usa EnvironmentService para obter a URL completa da API (apiUrl + endpoint)
 */
@Injectable({
  providedIn: 'root',
})
export class MusicianService extends BaseCrudService<Musician> {
  private readonly endpointPath = 'musicians';

  // Override da propriedade endpoint para retornar URL completa
  protected override get endpoint(): string {
    const apiUrl = this.envConfig.getApiUrl();
    // Remove barra inicial se existir para evitar duplas
    const cleanPath = this.endpointPath.startsWith('/')
      ? this.endpointPath.slice(1)
      : this.endpointPath;
    return `${apiUrl}/${cleanPath}`;
  }

  constructor(
    httpClient: HttpClient,
    private envConfig: EnvironmentService
  ) {
    super(httpClient);
  }

  // Métodos úteis para acessar configurações de ambiente
  getApiUrl(): string {
    return this.envConfig.getApiUrl();
  }

  isProduction(): boolean {
    return this.envConfig.isProduction();
  }

  // Adicione métodos específicos de Musician aqui (se houver)
  // Ex: getMusiciansByVoice(voice: string) { ... }
}
