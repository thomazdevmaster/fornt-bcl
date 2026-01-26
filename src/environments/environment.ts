/**
 * Configurações de ambiente para DESENVOLVIMENTO
 * Este arquivo é usado durante ng serve (desenvolvimento local)
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  apiTimeout: 30000,
  logLevel: 'debug' as const,
  enableMocking: true,
  features: {
    auth: true,
    analytics: false,
    notifications: true,
  },
} as const;
