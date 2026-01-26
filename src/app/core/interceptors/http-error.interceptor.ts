import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

/**
 * HTTP Interceptor para:
 * - Adicionar headers padrão
 * - Tratar erros globalmente
 * - Retry automático para falhas de rede
 * - Logging de requisições
 */
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Adiciona headers padrão
    request = this.addHeaders(request);

    // Log da requisição
    this.logRequest(request);

    return next.handle(request).pipe(
      // Retry automático para erros de rede (máximo 1 tentativa)
      retry({
        count: 1,
        delay: (error) => {
          if (error instanceof HttpErrorResponse && error.status === 0) {
            // Erro de rede
            return throwError(() => error);
          }
          return throwError(() => error);
        },
      }),
      // Trata erros globalmente
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  /**
   * Adiciona headers padrão à requisição
   */
  private addHeaders(request: HttpRequest<unknown>): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        // Adicione outros headers padrão aqui
      },
    });
  }

  /**
   * Loga requisição HTTP
   */
  private logRequest(request: HttpRequest<unknown>): void {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`🔵 [${timestamp}] ${request.method} ${request.url}`);
  }

  /**
   * Trata erros HTTP de forma centralizada
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Erro desconhecido';

    if (error.error instanceof ErrorEvent) {
      // Erro no cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      errorMessage = `Código: ${error.status} - ${error.message}`;

      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    console.error(`🔴 Erro HTTP:`, {
      status: error.status,
      message: errorMessage,
      url: error.url,
      error: error.error,
    });

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      originalError: error,
    }));
  }
}

/**
 * Provider para o interceptador HTTP
 * Adicione em app.config.ts ou app.config.server.ts
 *
 * @example
 * import { HTTP_INTERCEPTORS } from '@angular/common/http';
 * import { HTTP_INTERCEPTOR_PROVIDERS } from './core/interceptors/http-error.interceptor';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     ...HTTP_INTERCEPTOR_PROVIDERS,
 *   ],
 * };
 */
export const HTTP_INTERCEPTOR_PROVIDERS = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: HttpErrorInterceptor,
    multi: true,
  },
];
