import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type ThemeChoice = 'light' | 'dark' | 'system';

const THEME_KEY = 'app.theme';
const PRIMARY_KEY = 'app.primary';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private doc = inject(DOCUMENT);

  constructor() {
    // Aplica a preferência salva ao iniciar
    this.applyTheme(this.getTheme());
    this.applyPrimary(this.getPrimary());
  }

  getTheme(): ThemeChoice {
    const stored = localStorage.getItem(THEME_KEY) as ThemeChoice | null;
    return stored ?? 'system';
  }

  setTheme(choice: ThemeChoice) {
    localStorage.setItem(THEME_KEY, choice);
    this.applyTheme(choice);
  }

  private applyTheme(choice: ThemeChoice) {
    const html = this.doc.documentElement;
    html.classList.remove('dark', 'light');

    if (choice === 'dark') {
      html.classList.add('dark');
    } else if (choice === 'light') {
      html.classList.add('light');
    } else {
      // system: deixa sem classe específica e deixa o CSS decidir via color-scheme
    }
  }

  // Opcional: troca de cor primária
  getPrimary(): 'indigo' | 'blue' {
    return (localStorage.getItem(PRIMARY_KEY) as 'indigo' | 'blue') ?? 'indigo';
  }

  setPrimary(color: 'indigo' | 'blue') {
    localStorage.setItem(PRIMARY_KEY, color);
    this.applyPrimary(color);
  }

  private applyPrimary(color: 'indigo' | 'blue') {
    const html = this.doc.documentElement;
    html.classList.remove('primary-indigo', 'primary-blue');
    html.classList.add(`primary-${color}`);
  }
}
