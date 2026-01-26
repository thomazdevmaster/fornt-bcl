# Guia de Ambientes (Environments)

## 📋 Visão Geral

O sistema de ambientes permite definir configurações diferentes para cada contexto de execução:

- **Development**: Desenvolvimento local (ng serve)
- **Staging**: Ambiente de testes/homologação
- **Production**: Ambiente de produção

## 📂 Estrutura

```
src/
├── environments/
│   ├── environment.ts              # Dev (padrão)
│   ├── environment.staging.ts      # Staging
│   ├── environment.prod.ts         # Produção
│   ├── environment.interface.ts    # Tipagem
│   └── index.ts                    # Barrel export
```

## ⚙️ Configuração

### environment.ts (Desenvolvimento)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  apiTimeout: 30000,
  logLevel: 'debug',
  enableMocking: true,
  features: {
    auth: true,
    analytics: false,
    notifications: true,
  },
};
```

### environment.prod.ts (Produção)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com',
  apiTimeout: 30000,
  logLevel: 'error',
  enableMocking: false,
  features: {
    auth: true,
    analytics: true,
    notifications: true,
  },
};
```

### environment.staging.ts (Homologação)
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://staging-api.example.com',
  apiTimeout: 30000,
  logLevel: 'info',
  enableMocking: false,
  features: {
    auth: true,
    analytics: true,
    notifications: true,
  },
};
```

## 🚀 Como Usar

### 1. No EnvironmentService
```typescript
import { Injectable } from '@angular/core';
import { EnvironmentService } from '@app/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private envConfig: EnvironmentService) {}

  loadData() {
    const apiUrl = this.envConfig.getApiUrl();
    const isProd = this.envConfig.isProduction();
    
    if (this.envConfig.isFeatureEnabled('analytics')) {
      // Inicializar analytics
    }
  }
}
```

### 2. Em Componentes
```typescript
import { Component } from '@angular/core';
import { EnvironmentService } from '@app/core';

@Component({
  selector: 'app-config-display',
  template: `
    <div>
      <p>API: {{ apiUrl }}</p>
      <p>Produção: {{ isProd }}</p>
    </div>
  `
})
export class ConfigDisplayComponent {
  apiUrl = this.envConfig.getApiUrl();
  isProd = this.envConfig.isProduction();

  constructor(private envConfig: EnvironmentService) {}
}
```

### 3. No HttpService
```typescript
// O HttpService já usa automaticamente
private buildUrl(endpoint: string): string {
  const apiUrl = this.envConfig.getApiUrl();
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  const cleanEndpoint = endpoint.startsWith('/') 
    ? endpoint.slice(1) 
    : endpoint;
  return `${apiUrl}/${cleanEndpoint}`;
}
```

## 🏗️ Build para Diferentes Ambientes

### Desenvolvimento (padrão)
```bash
npm start
# ou
ng serve
```

### Staging
```bash
ng build --configuration=staging
ng serve --configuration=staging
```

### Produção
```bash
npm run build
# ou
ng build --configuration=production
```

## 📝 Interface IEnvironment

```typescript
interface IEnvironment {
  production: boolean;
  apiUrl: string;
  apiTimeout: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableMocking: boolean;
  features: {
    auth: boolean;
    analytics: boolean;
    notifications: boolean;
  };
}
```

## 🔧 Métodos do EnvironmentService

| Método | Retorno | Descrição |
|--------|---------|-----------|
| `getApiUrl()` | `string` | URL da API |
| `getHttpTimeout()` | `number` | Timeout em ms |
| `isProduction()` | `boolean` | Se está em produção |
| `getLogLevel()` | `string` | Nível de logging |
| `isMockingEnabled()` | `boolean` | Se mocking está ativo |
| `isFeatureEnabled(feature)` | `boolean` | Se um recurso está habilitado |
| `getConfig()` | `IEnvironment` | Toda a configuração |

## 💡 Boas Práticas

1. **Sempre use EnvironmentService** para acessar configurações
2. **Não faça hardcoding** de URLs ou valores de configuração
3. **Type-safe**: Use a interface IEnvironment para garantir tipagem
4. **Feature flags**: Use `isFeatureEnabled()` para ativar/desativar recursos
5. **Logging**: Configure o logLevel apropriado para cada ambiente

## 🔐 Variáveis Sensíveis

Para valores sensíveis (tokens, chaves API), considere:

1. **Variáveis de ambiente do sistema**
   ```typescript
   apiUrl: process.env['API_URL'] || 'http://localhost:3000'
   ```

2. **Arquivo de configuração local** (não versionado)
   ```typescript
   // environment.local.ts (add ao .gitignore)
   ```

3. **Build-time variables**
   ```bash
   ng build --configuration production --base-href=/app/
   ```

## 📚 Relacionados

- [Architecture Guide](./ARCHITECTURE.md)
- [Development Guide](./DEVELOPMENT_GUIDE.md)
- [HttpService Documentation](./QUICK_REFERENCE.md#httpservice)
