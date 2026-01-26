import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '../../services/theme.service';

/**
 * Componente para alternar entre temas light/dark
 * Pode ser usado no header ou toolbar
 */
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <button
      mat-icon-button
      (click)="toggleTheme()"
      [attr.aria-label]="'Alternar para modo ' + (isLight ? 'escuro' : 'claro')"
      matTooltip="Alternar tema"
    >
      <mat-icon>{{ isLight ? 'dark_mode' : 'light_mode' }}</mat-icon>
    </button>
  `,
  styles: [`
    button {
      transition: color 0.3s ease;
    }
  `]
})
export class ThemeToggleComponent implements OnInit {
  @Input() color: string = '';

  isLight = true;
  private themeService = inject(ThemeService);

  ngOnInit(): void {
    this.themeService.theme$.subscribe(theme => {
      this.isLight = theme === 'light';
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
