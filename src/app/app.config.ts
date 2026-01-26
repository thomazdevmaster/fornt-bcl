import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, ErrorHandler } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { HTTP_INTERCEPTOR_PROVIDERS } from './core/interceptors/http-error.interceptor';
import { GlobalErrorHandler } from './core/error-handler/global-error.handler';

/**
 * Configuração global da aplicação
 * Define providers essenciais, HTTP, routing, e tratamento de erros
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Zone & Detecção de mudanças
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Routing
    provideRouter(routes),

    // HTTP com interceptadores
    provideHttpClient(),
    ...HTTP_INTERCEPTOR_PROVIDERS,

    // Error Handler global
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },
  ],
};
