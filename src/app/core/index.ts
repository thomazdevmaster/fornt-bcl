/**
 * Re-exports para importação simplificada da camada Core
 *
 * @example
 * import { HttpService, BaseCrudService, EnvironmentService } from '@app/core';
 */

// HTTP
export * from './http/http.service';
export * from './http/base-crud.service';

// Interceptors
export { HttpErrorInterceptor, HTTP_INTERCEPTOR_PROVIDERS } from './interceptors/http-error.interceptor';

// Guards
export * from './guards/auth.guard';

// Error Handler
export * from './error-handler/global-error.handler';

// Services
export * from './services/environment.service';
