import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnvironmentService } from 'app/core/services/environment.service';
/**
 * Exemplo de componente que utiliza configurações de ambiente
 * Demonstra como usar o EnvironmentService na prática
 */
@Component({
  selector: 'app-environment-config-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="config-display">
      <h2>Configuração de Ambiente</h2>

      <section>
        <h3>Informações Básicas</h3>
        <p><strong>Ambiente:</strong> {{ environment.production ? '🔴 PRODUÇÃO' : '🟢 DESENVOLVIMENTO' }}</p>
        <p><strong>API URL:</strong> <code>{{ environment.apiUrl }}</code></p>
        <p><strong>Timeout:</strong> {{ environment.apiTimeout }}ms</p>
        <p><strong>Log Level:</strong> {{ environment.logLevel }}</p>
      </section>

      <section>
        <h3>Recursos Habilitados</h3>
        <ul>
          <li>
            <span [class.enabled]="features.auth">{{ features.auth ? '✓' : '✗' }}</span>
            Autenticação
          </li>
          <li>
            <span [class.enabled]="features.analytics">{{ features.analytics ? '✓' : '✗' }}</span>
            Analytics
          </li>
          <li>
            <span [class.enabled]="features.notifications">{{ features.notifications ? '✓' : '✗' }}</span>
            Notificações
          </li>
        </ul>
      </section>

      <section>
        <h3>Comportamento</h3>
        <p *ngIf="environment.enableMocking">
          ⚠️ <strong>Mocking habilitado</strong> - Usando dados mockados em vez de chamar API
        </p>
        <p *ngIf="!environment.enableMocking">
          ✓ <strong>Mocking desabilitado</strong> - Chamando API real
        </p>
      </section>
    </div>
  `,
  styles: [`
    .config-display {
      padding: 20px;
      background: #f5f5f5;
      border-radius: 8px;
      margin: 20px 0;
    }

    section {
      margin: 20px 0;
      padding-bottom: 20px;
      border-bottom: 1px solid #ddd;
    }

    section:last-child {
      border-bottom: none;
    }

    h3 {
      color: #333;
      margin-top: 0;
    }

    code {
      background: #e0e0e0;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
    }

    ul {
      list-style: none;
      padding: 0;
    }

    li {
      padding: 8px;
      margin: 5px 0;
      background: white;
      border-radius: 4px;
      border-left: 4px solid #ddd;
    }

    .enabled {
      color: #4CAF50;
      font-weight: bold;
    }

    p {
      margin: 10px 0;
      line-height: 1.6;
    }
  `]
})
export class EnvironmentConfigExampleComponent implements OnInit {
  environment = {
    production: false,
    apiUrl: '',
    apiTimeout: 0,
    logLevel: '',
    enableMocking: false,
  };

  features = {
    auth: false,
    analytics: false,
    notifications: false,
  };

  constructor(private envConfig: EnvironmentService) {}

  ngOnInit(): void {
    // Carregar configuração do serviço
    const config = this.envConfig.getConfig();

    this.environment = {
      production: config.production,
      apiUrl: config.apiUrl,
      apiTimeout: config.apiTimeout,
      logLevel: config.logLevel,
      enableMocking: config.enableMocking,
    };

    this.features = { ...config.features };

    // Exemplo: usar configuração para lógica
    if (this.envConfig.isProduction()) {
      console.log('🔴 Executando em PRODUÇÃO');
    } else {
      console.log('🟢 Executando em DESENVOLVIMENTO');
    }

    // Exemplo: verificar se um recurso está habilitado
    if (this.envConfig.isFeatureEnabled('analytics')) {
      console.log('📊 Analytics habilitado - inicializando Google Analytics...');
    }

    // Exemplo: usar API URL
    const apiUrl = this.envConfig.getApiUrl();
    console.log(`📡 Conectando em: ${apiUrl}`);
  }
}
