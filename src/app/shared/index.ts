/**
 * Re-exports para importação simplificada da camada Shared
 *
 * @example
 * import { SHARED_PIPES, SHARED_DIRECTIVES, ErrorMessageComponent } from '@app/shared';
 */

// Models
export * from './models/base.model';

// Components
export * from './components/error/error-message.component';

// Pipes
export { SHARED_PIPES, PhoneMaskPipe, CpfMaskPipe, DateFormatPipe, TruncatePipe } from './pipes/common.pipes';

// Directives
export {
  SHARED_DIRECTIVES,
  PreventDoubleClickDirective,
  AutoFocusDirective,
  HighlightDirective,
  ClickOutsideDirective
} from './directives/common.directives';

// Base Classes
export * from './base-classes/base-form.component';
export * from './base-classes/base-crud-list.component';

// Services
export * from './services/dialogs.service';
export * from './services/theme.service';

// Material Module
export * from './app-material/app-material-module';
