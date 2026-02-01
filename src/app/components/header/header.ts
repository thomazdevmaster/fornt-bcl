import { Component, inject, OnInit, Output, EventEmitter } from '@angular/core';
import { AppMaterialModule } from '../../shared/app-material/app-material-module';
import { Shortcut } from '../../pages/home/model/shortcut';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeChoice, ThemeService } from '../service/theme.service';

export type PrimaryColor = 'indigo' | 'blue';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AppMaterialModule, CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  private themeService = inject(ThemeService);

  @Output() toggleMenu = new EventEmitter<void>();

  theme: ThemeChoice = 'system';
  primary: PrimaryColor = 'indigo';
  readonly primaryOptions: PrimaryColor[] = ['indigo', 'blue'];

  readonly shortcuts: Shortcut[] = [
    // { icon: 'home', label: 'Início', route: '/home' },
    { icon: 'spatial_audio_off', label: 'Músicos', route: '/musicians' },
    { icon: 'school', label: 'Alunos', route: '/students' },
    { icon: 'cast_for_education', label: 'Apresentações', route: '/presentations' },
    { icon: 'library_music', label: 'Repertório', route: '/songs' },
    { icon: 'photo_library', label: 'Galeria', route: '/gallery' },
    { icon: 'inventory_2', label: 'Patrimônio', route: '/patrimony' },
    { icon: 'music_note', label: 'Instrumentos', route: '/instruments' },
  ];

  ngOnInit() {
    this.theme = this.themeService.getTheme();
    this.primary = this.themeService.getPrimary();
  }

  setTheme(choice: ThemeChoice) {
    this.themeService.setTheme(choice);
    this.theme = choice;
  }

  setPrimary(color: PrimaryColor) {
    this.themeService.setPrimary(color);
    this.primary = color;
  }
}
