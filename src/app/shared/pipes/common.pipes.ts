import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para formatar telefone
 *
 * @example
 * {{ '11999999999' | phoneMask }}
 * // Output: (11) 99999-9999
 */
@Pipe({
  name: 'phoneMask',
  standalone: true,
})
export class PhoneMaskPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';

    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }

    return value;
  }
}

/**
 * Pipe para formatar CPF
 *
 * @example
 * {{ '12345678901' | cpfMask }}
 * // Output: 123.456.789-01
 */
@Pipe({
  name: 'cpfMask',
  standalone: true,
})
export class CpfMaskPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';

    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length !== 11) return value;

    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}

/**
 * Pipe para formatar data
 *
 * @example
 * {{ '2024-01-26' | dateFormat:'pt-BR' }}
 * // Output: 26/01/2024
 */
@Pipe({
  name: 'dateFormat',
  standalone: true,
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string | Date | null | undefined, format: string = 'pt-BR'): string {
    if (!value) return '';

    const date = typeof value === 'string' ? new Date(value) : value;

    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };

    return new Intl.DateTimeFormat(format, options).format(date);
  }
}

/**
 * Pipe para truncar texto
 *
 * @example
 * {{ 'Lorem ipsum dolor sit amet' | truncate:10 }}
 * // Output: Lorem ip...
 */
@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, limit: number = 50, ellipsis: string = '...'): string {
    if (!value) return '';

    if (value.length <= limit) return value;

    return value.substring(0, limit) + ellipsis;
  }
}

/**
 * Pipe para safe HTML (sanitize)
 *
 * @example
 * {{ htmlContent | safeHtml }}
 */
@Pipe({
  name: 'safeHtml',
  standalone: true,
})
export class SafeHtmlPipe implements PipeTransform {
  transform(value: string | null | undefined): unknown {
    // Use DomSanitizer se precisar sanitizar HTML
    if (!value) return '';
    return value;
  }
}

/**
 * Exportar todos os pipes como array para importação
 */
export const SHARED_PIPES = [PhoneMaskPipe, CpfMaskPipe, DateFormatPipe, TruncatePipe, SafeHtmlPipe];
