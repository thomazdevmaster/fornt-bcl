import { ErrorHandler, Injectable, Injector } from '@angular/core';

/**
 * Handler global para erros da aplicação
 * Centraliza tratamento e logging de erros
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: Error | unknown): void {
    const chunkFailedMessage = /Loading chunk \d+ failed/g.test((error as Error).message);

    if (chunkFailedMessage) {
      // Handle lazy loading chunk failures
      window.location.reload();
    }

    // Log detalhado do erro
    this.logError(error);
  }

  private logError(error: unknown): void {
    const timestamp = new Date().toLocaleTimeString();

    if (error instanceof Error) {
      console.error(`🔴 [${timestamp}] ${error.name}: ${error.message}`, {
        stack: error.stack,
      });
    } else {
      console.error(`🔴 [${timestamp}] Erro desconhecido:`, error);
    }
  }
}
