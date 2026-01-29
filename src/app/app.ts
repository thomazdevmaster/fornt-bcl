import { Component, signal } from '@angular/core';

import { RouterOutlet } from "@angular/router";
import { AppMaterialModule } from './shared/app-material/app-material-module';
import { Header } from "./components/header/header";
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { provideNativeDateAdapter } from '@angular/material/core';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppMaterialModule, Header],
  providers: [provideNativeDateAdapter()],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('front');

  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {
    this.iconRegistry.setDefaultFontSetClass('material-icons-outlined');
  }
}
