/**
 * Configurações de ambiente para PRODUÇÃO
 * Este arquivo é usado durante ng build (build de produção)
 */
export const environment = {
  production: true,
  apiUrl: 'https://simple-api-rosy.vercel.app',
  apiTimeout: 30000,
  logLevel: 'error' as const,
  enableMocking: false,
  features: {
    auth: true,
    analytics: true,
    notifications: true,
  },
} as const;
