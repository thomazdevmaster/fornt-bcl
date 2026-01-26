import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Serviço para gerenciar temas light/dark
 * Persiste a preferência do usuário em localStorage
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_STORAGE_KEY = 'app-theme';
  private readonly themeSubject$ = new BehaviorSubject<'light' | 'dark'>(this.loadTheme());

  /**
   * Observable do tema atual
   */
  theme$ = this.themeSubject$.asObservable();

  /**
   * Tema atual
   */
  get currentTheme(): 'light' | 'dark' {
    return this.themeSubject$.value;
  }

  constructor() {
    this.initializeTheme();
  }

  /**
   * Alterna entre light e dark
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Define o tema
   */
  setTheme(theme: 'light' | 'dark'): void {
    this.themeSubject$.next(theme);
    this.applyTheme(theme);
    localStorage.setItem(this.THEME_STORAGE_KEY, theme);
  }

  /**
   * Carrega o tema do localStorage ou usa preferência do SO
   */
  private loadTheme(): 'light' | 'dark' {
    // Tentar carregar do localStorage
    const saved = localStorage.getItem(this.THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }

    // Fallback para preferência do SO
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  /**
   * Inicializa o tema na página
   */
  private initializeTheme(): void {
    this.applyTheme(this.currentTheme);
  }

  /**
   * Aplica a classe de tema no <html>
   */
  private applyTheme(theme: 'light' | 'dark'): void {
    const html = document.documentElement;

    // Remove classes antigos
    html.classList.remove('light', 'dark');

    // Adiciona nova classe
    html.classList.add(theme);
  }
}
