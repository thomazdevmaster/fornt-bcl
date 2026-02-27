import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from '../../app-material/app-material-module';
import { MusicLoaderComponent } from '../music-loader/music-loader';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Componente para exibir mensagens de erro de forma consistente
 *
 * @example
 * <app-error-message
 *   [error]="errorMessage"
 *   [type]="'error'"
 * ></app-error-message>
 */
@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule, AppMaterialModule],
  template: `
    <div *ngIf="error" class="error-alert" [ngClass]="'alert-' + type">
      <mat-icon>{{ getIcon() }}</mat-icon>
      <div class="error-content">
        <strong *ngIf="title">{{ title }}</strong>
        <p *ngIf="error">{{ error }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .error-alert {
        margin-bottom: 16px;
        display: flex;
        gap: 12px;
        align-items: flex-start;
        padding: 12px 16px;
        border-radius: 4px;
        border-left: 4px solid;

        &.alert-error {
          background-color: color-mix(in srgb, var(--mat-error) 12%, transparent);
          border-left-color: var(--mat-error);

          mat-icon {
            color: var(--mat-error);
          }
        }

        &.alert-warn {
          background-color: color-mix(in srgb, var(--mat-warning) 12%, transparent);
          border-left-color: var(--mat-warning);

          mat-icon {
            color: var(--mat-warning);
          }
        }

        &.alert-info {
          background-color: color-mix(in srgb, var(--mat-info) 12%, transparent);
          border-left-color: var(--mat-info);

          mat-icon {
            color: var(--mat-info);
          }
        }

        &.alert-success {
          background-color: color-mix(in srgb, var(--mat-success) 12%, transparent);
          border-left-color: var(--mat-success);

          mat-icon {
            color: var(--mat-success);
          }
        }

        mat-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .error-content {
          flex: 1;

          strong {
            display: block;
            margin-bottom: 4px;
            font-weight: 600;
          }

          p {
            margin: 0;
            font-size: 13px;
            opacity: 0.9;
          }
        }
      }
    `,
  ],
})
export class ErrorMessageComponent {
  @Input() error: string | null = null;
  @Input() title = 'Erro';
  @Input() type: 'error' | 'warn' | 'info' | 'success' = 'error';

  getIcon(): string {
    const icons: Record<string, string> = {
      error: 'error',
      warn: 'warning',
      info: 'info',
      success: 'check_circle',
    };
    return icons[this.type];
  }
}

/**
 * Componente para exibir lista de erros de validação
 *
 * @example
 * <app-validation-errors [errors]="formErrors"></app-validation-errors>
 */
@Component({
  selector: 'app-validation-errors',
  standalone: true,
  imports: [CommonModule, AppMaterialModule],
  template: `
    <div *ngIf="errors && errors.length > 0" class="validation-errors">
      <div class="error-item" *ngFor="let error of errors">
        <mat-icon>error_outline</mat-icon>
        <span>{{ error }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      .validation-errors {
        margin: 16px 0;
        padding: 12px;
        background-color: color-mix(in srgb, var(--mat-error) 12%, transparent);
        border-radius: 4px;
        border-left: 4px solid var(--mat-error);

        .error-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 4px 0;

          mat-icon {
            color: var(--mat-error);
            flex-shrink: 0;
          }

          span {
            flex: 1;
            font-size: 13px;
          }
        }
      }
    `,
  ],
})
export class ValidationErrorsComponent {
  @Input() errors: string[] = [];
}

/**
 * Componente para loading com backdrop
 *
 * @example
 * <app-loading-overlay [isLoading]="isLoading"></app-loading-overlay>
 */
@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule, AppMaterialModule, MusicLoaderComponent],
  template: `
    <div *ngIf="isLoading" class="loading-overlay">
      <div class="loading-container">
        <app-music-loader [text]="message" size="lg"></app-music-loader>
      </div>
    </div>
  `,
  styles: [
    `
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: color-mix(in srgb, var(--mat-on-surface) 50%, transparent);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          background-color: var(--card-background);
          padding: 32px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

          p {
            margin: 0;
            color: var(--mat-on-surface-variant);
            font-size: 14px;
          }
        }
      }
    `,
  ],
})
export class LoadingOverlayComponent {
  @Input() isLoading = false;
  @Input() message: string | null = null;
}

/**
 * Exportar todos os componentes de erro/loading
 */
export const ERROR_COMPONENTS = [
  ErrorMessageComponent,
  ValidationErrorsComponent,
  LoadingOverlayComponent,
];
