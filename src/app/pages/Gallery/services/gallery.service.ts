import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseCrudService } from '../../../shared/base-classes/base-crud.service';
import { EnvironmentService } from '../../../core/services/environment.service';
import { Gallery } from '../model/gallery';

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
export class GalleryService extends BaseCrudService<Gallery> {
  private readonly endpointPath = 'gallerys';

  // Override da propriedade endpoint para retornar URL completa
  protected override get endpoint(): string {
    return `${this.envConfig.getApiUrl()}/gallerys`;
  }

  constructor(httpClient: HttpClient, private envConfig: EnvironmentService) {
    super(httpClient);
  }

  // Métodos úteis para acessar configurações de ambiente
  getApiUrl(): string {
    return this.envConfig.getApiUrl();
  }

  isProduction(): boolean {
    return this.envConfig.isProduction();
  }

  // Adicione métodos específicos de Gallery aqui (se houver)
  // Ex: getGallerysByVoice(voice: string) { ... }
}
