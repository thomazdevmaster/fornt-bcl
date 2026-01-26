import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { IEnvironment } from '@env/environment.interface';

/**
 * Serviço centralizador de configurações de ambiente
 * Fornece acesso às variáveis de ambiente da aplicação
 *
 * @example
 * constructor(private envConfig: EnvironmentService) {}
 *
 * ngOnInit() {
 *   const apiUrl = this.envConfig.getApiUrl();
 *   const isProd = this.envConfig.isProduction();
 *   if (this.envConfig.isFeatureEnabled('analytics')) {
 *     // inicializar analytics
 *   }
 * }
 */
@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  private config: IEnvironment;

  constructor() {
    this.config = environment;
    this.logEnvironmentInfo();
  }

  /**
   * Obtém a URL da API
   */
  getApiUrl(): string {
    return this.config.apiUrl;
  }

  /**
   * Obtém o timeout das requisições HTTP (em ms)
   */
  getHttpTimeout(): number {
    return this.config.apiTimeout;
  }

  /**
   * Verifica se está em produção
   */
  isProduction(): boolean {
    return this.config.production;
  }

  /**
   * Obtém o nível de log
   */
  getLogLevel(): string {
    return this.config.logLevel;
  }

  /**
   * Verifica se mocking está habilitado
   */
  isMockingEnabled(): boolean {
    return this.config.enableMocking;
  }

  /**
   * Verifica se um recurso está habilitado
   * @param feature Nome do recurso
   */
  isFeatureEnabled(feature: keyof typeof this.config.features): boolean {
    return this.config.features[feature] || false;
  }

  /**
   * Obtém toda a configuração (usar com cuidado)
   */
  getConfig(): IEnvironment {
    return { ...this.config };
  }

  /**
   * Log de informações sobre o ambiente
   */
  private logEnvironmentInfo(): void {
    const level = this.config.logLevel;
    const showLog = level === 'debug' || level === 'info';

    if (showLog) {
      console.group('🌍 Environment Configuration');
      console.log('Environment:', this.config.production ? 'PRODUCTION' : 'DEVELOPMENT');
      console.log('API URL:', this.config.apiUrl);
      console.log('Log Level:', this.config.logLevel);
      console.log('Mocking Enabled:', this.config.enableMocking);
      console.table(this.config.features);
      console.groupEnd();
    }
  }
}
