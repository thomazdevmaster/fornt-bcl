/**
 * Configurações de ambiente para STAGING
 * Este arquivo é usado para testes antes de produção
 */
export const environment = {
  production: false,
  apiUrl: 'https://staging-api.example.com',
  apiTimeout: 30000,
  logLevel: 'info' as const,
  enableMocking: false,
  features: {
    auth: true,
    analytics: true,
    notifications: true,
  },
} as const;
