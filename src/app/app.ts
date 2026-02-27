import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { provideNativeDateAdapter } from '@angular/material/core';
import { AppShellComponent } from './components/app-shell/app-shell';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AppShellComponent],
  providers: [provideNativeDateAdapter()],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  constructor(
    private iconRegistry: MatIconRegistry,
    _sanitizer: DomSanitizer,
  ) {
    this.iconRegistry.setDefaultFontSetClass('material-icons-outlined');
  }
}
