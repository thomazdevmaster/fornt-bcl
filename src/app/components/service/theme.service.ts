import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type ThemeChoice = 'light' | 'dark' | 'system';

const THEME_KEY = 'app.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private doc = inject(DOCUMENT);

  constructor() {
    this.applyTheme(this.getTheme());
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
    }
    // system: sem classe, CSS usa prefers-color-scheme
  }
}
