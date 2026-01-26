/**
 * Definição da interface de Environment
 * Tipagem para as configurações de ambiente
 */
export interface IEnvironment {
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
