import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { News } from '../../news/model/news';
import { AppMaterialModule } from '../../../shared/app-material/app-material-module';
import { CommonModule, DatePipe } from '@angular/common';
import { EnvironmentConfigExampleComponent } from '../examples/environment-config.example';
import { PageContainerComponent } from '../../../shared/components/page-container/page-container';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface QuickAction {
  icon: string;
  label: string;
  route: string;
  description: string;
}

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    RouterModule,
    AppMaterialModule,
    DatePipe,
    EnvironmentConfigExampleComponent,
    PageContainerComponent,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private sanitizer = inject(DomSanitizer);
  news: News[] = [];

  /** Imagem de fundo do hero (opcional). Ex.: 'assets/home/hero.jpg' */
  heroImage: string | null = '/imgs/img1.jpg';

  /** Imagem da seção história (opcional). Coloque em assets/home/historia.jpg */
  historyImage: string | null = '/imgs/img2.jpg';

  /** Imagens da seção Momentos (public/imgs) */
  readonly galleryImages: { src: string; alt: string }[] = [
    { src: '/imgs/img1.jpg', alt: 'Banda Carmelitana Luminarense' },
    { src: '/imgs/img2.jpg', alt: 'Apresentação da Banda' },
    { src: '/imgs/img3.jpg', alt: 'Momentos da Banda' },
    { src: '/imgs/img4.jpg', alt: 'Tradição e música' },
  ];

  readonly quickActions: QuickAction[] = [
    { icon: 'menu_book', label: 'Partituras', route: '/study', description: 'Estudar e praticar' },
    { icon: 'school', label: 'Alunos', route: '/students', description: 'Cadastro de alunos' },
    { icon: 'library_music', label: 'Repertório', route: '/songs', description: 'Músicas e repertório' },
    { icon: 'photo_library', label: 'Galeria', route: '/gallery-view', description: 'Fotos e vídeos' },
  ];

  readonly historyHighlights = [
    { year: '1894', text: 'Músicos tocando inspirados no entardecer entre as montanhas.' },
    { year: '1910', text: 'Criação da Associação Carmelitana Luminarense.' },
    { year: 'Hoje', text: 'Mais de um século de história e presença em Luminárias.' },
  ];

  /** Canal YouTube oficial da Banda */
  readonly youtubeChannelUrl = 'https://www.youtube.com/@bandacarmelitanaluminarens4347';

  /** IDs dos vídeos do canal (atualizados via RSS do canal). Embaralhamos e exibimos até 4. */
  private readonly youtubeVideoIds = [
    'TbUGOc36r9s',
    'zgNL45Nl1qA',
    'eTjkMqHKOvo',
    'sldhCGZ-KgQ',
    'jaFIxhNqYnw',
  ];

  /** Vídeos a exibir na home (até 4, ordem aleatória) */
  displayedVideos: string[] = [];

  private shuffle<T>(arr: T[]): T[] {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  /** URL segura para embed do YouTube */
  embedUrl(videoId: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}`
    );
  }

  ngOnInit(): void {
    this.displayedVideos = this.shuffle(this.youtubeVideoIds).slice(0, 4);
    this.news = [
      {
        title: 'Lançamento da nova versão do BCL',
        summary: 'Agora com suporte a mapeamento avançado e performance otimizada.',
        link: '#',
        date: new Date('2025-11-10'),
      },
      {
        title: 'Integração com API de Músicos disponível',
        summary: 'Conecte e gerencie dados em tempo real.',
        link: '#',
        date: new Date('2025-11-09'),
      },
    ];
  }
}
