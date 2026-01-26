import { Directive, HostListener, Input, OnInit, ElementRef, Renderer2 } from '@angular/core';

/**
 * Diretiva para prevenir duplo clique
 * Desabilita o botão temporariamente após o clique
 *
 * @example
 * <button appPreventDoubleClick [disabled]="isLoading">Salvar</button>
 */
@Directive({
  selector: '[appPreventDoubleClick]',
  standalone: true,
})
export class PreventDoubleClickDirective implements OnInit {
  @Input() preventDoubleClickDuration = 500; // milliseconds

  private isClicked = false;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Elemento deve ser um botão ou ter role button
    const element = this.elementRef.nativeElement;
    if (element.tagName !== 'BUTTON' && !element.hasAttribute('role')) {
      this.renderer.setAttribute(element, 'role', 'button');
    }
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (this.isClicked) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.isClicked = true;
    this.renderer.addClass(this.elementRef.nativeElement, 'disabled');

    setTimeout(() => {
      this.isClicked = false;
      this.renderer.removeClass(this.elementRef.nativeElement, 'disabled');
    }, this.preventDoubleClickDuration);
  }
}

/**
 * Diretiva para auto-focus em elemento
 *
 * @example
 * <input appAutoFocus />
 */
@Directive({
  selector: '[appAutoFocus]',
  standalone: true,
})
export class AutoFocusDirective implements OnInit {
  @Input() appAutoFocus = true;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    if (this.appAutoFocus) {
      setTimeout(() => {
        this.elementRef.nativeElement.focus();
      }, 100);
    }
  }
}

/**
 * Diretiva para highlight de texto em busca
 *
 * @example
 * <span appHighlight [text]="fullText" [search]="searchTerm"></span>
 */
@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective implements OnInit {
  @Input() appHighlightText = '';
  @Input() appHighlightSearch = '';

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    if (!this.appHighlightText || !this.appHighlightSearch) {
      return;
    }

    const regex = new RegExp(`(${this.appHighlightSearch})`, 'gi');
    const highlightedText = this.appHighlightText.replace(
      regex,
      '<mark style="background-color: yellow; padding: 2px;">$1</mark>'
    );

    this.elementRef.nativeElement.innerHTML = highlightedText;
  }
}

/**
 * Diretiva para detectar clique fora do elemento
 *
 * @example
 * <div appClickOutside (clickOutside)="onClickOutside()"></div>
 */
@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  @HostListener('document:click', ['$event'])
  @HostListener('document:touchstart', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      // Dispara evento customizado quando clica fora
      const customEvent = new CustomEvent('clickOutside');
      this.elementRef.nativeElement.dispatchEvent(customEvent);
    }
  }

  constructor(private elementRef: ElementRef) {}
}

/**
 * Exportar todas as diretivas como array
 */
export const SHARED_DIRECTIVES = [
  PreventDoubleClickDirective,
  AutoFocusDirective,
  HighlightDirective,
  ClickOutsideDirective,
];
