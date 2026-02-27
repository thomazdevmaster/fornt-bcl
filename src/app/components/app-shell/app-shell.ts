import {
  Component,
  inject,
  signal,
  computed,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { AppMaterialModule } from '../../shared/app-material/app-material-module';
import { ThemeChoice, ThemeService } from '../service/theme.service';
import { filter, map } from 'rxjs';
import { Subscription } from 'rxjs';

export interface NavItem {
  icon: string;
  label: string;
  route: string;
}

const BOTTOM_NAV_ITEMS: NavItem[] = [
  { icon: 'home', label: 'Início', route: '/home' },
  { icon: 'menu_book', label: 'Partituras', route: '/study' },
  { icon: 'school', label: 'Alunos', route: '/students' },
  { icon: 'library_music', label: 'Repertório', route: '/songs' },
];

const MORE_ITEMS: NavItem[] = [
  { icon: 'photo_library', label: 'Galeria', route: '/gallery-view' },
  { icon: 'spatial_audio_off', label: 'Músicos', route: '/musicians' },
  { icon: 'cast_for_education', label: 'Apresentações', route: '/presentations' },
  { icon: 'inventory_2', label: 'Patrimônio', route: '/patrimony' },
  { icon: 'music_note', label: 'Instrumentos', route: '/instruments' },
  { icon: 'photo_library', label: 'Galeria (admin)', route: '/gallery' },
];

@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AppMaterialModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule,
    MatMenuModule,
  ],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent implements OnDestroy {
  private breakpointObserver = inject(BreakpointObserver);
  readonly router = inject(Router);
  private themeService = inject(ThemeService);
  private sub = new Subscription();

  readonly isDesktop = signal(false);
  readonly isMobile = computed(() => !this.isDesktop());
  readonly sidenavCollapsed = signal(false);

  /** Margem do conteúdo: 0 no mobile, 56px (recolhido) ou 300px (expandido) no desktop. */
  readonly contentMarginStart = computed(() => {
    if (!this.isDesktop()) return 0;
    return this.sidenavCollapsed() ? 56 : 300;
  });

  readonly bottomNavItems = BOTTOM_NAV_ITEMS;
  readonly moreItems = MORE_ITEMS;
  readonly pageTitle = signal<string>('');

  theme: ThemeChoice = 'system';

  constructor() {
    this.sub.add(
      this.breakpointObserver
        .observe('(min-width: 960px)')
        .subscribe((state) => this.isDesktop.set(state.matches))
    );
    this.sub.add(
      this.router.events
        .pipe(
          filter((e): e is NavigationEnd => e instanceof NavigationEnd),
          map((e) => this.getTitleForUrl(e.urlAfterRedirects))
        )
        .subscribe((title) => this.pageTitle.set(title))
    );
    this.pageTitle.set(this.getTitleForUrl(this.router.url));
    this.isDesktop.set(
      this.breakpointObserver.isMatched('(min-width: 960px)')
    );
    this.theme = this.themeService.getTheme();
    const saved = localStorage.getItem('app.sidenavCollapsed');
    if (saved !== null) this.sidenavCollapsed.set(saved === 'true');
  }

  toggleSidenavCollapsed(): void {
    const next = !this.sidenavCollapsed();
    this.sidenavCollapsed.set(next);
    localStorage.setItem('app.sidenavCollapsed', String(next));
  }

  setTheme(choice: ThemeChoice): void {
    this.themeService.setTheme(choice);
    this.theme = choice;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  openMore(sidenav: MatSidenav): void {
    sidenav.toggle();
  }

  closeSidenav(sidenav: MatSidenav): void {
    if (this.isMobile()) sidenav.close();
  }

  private getTitleForUrl(url: string): string {
    const path = url.split('?')[0];
    if (path === '/' || path === '/home') return 'Início';
    if (path.startsWith('/study')) return 'Partituras';
    if (path.startsWith('/students')) return 'Alunos';
    if (path.startsWith('/songs')) return 'Repertório';
    if (path.startsWith('/musicians')) return 'Músicos';
    if (path.startsWith('/presentations')) return 'Apresentações';
    if (path.startsWith('/gallery')) return 'Galeria';
    if (path.startsWith('/patrimony')) return 'Patrimônio';
    if (path.startsWith('/instruments')) return 'Instrumentos';
    return 'Banda Carmelitana';
  }
}
