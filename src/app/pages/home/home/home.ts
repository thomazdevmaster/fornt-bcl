import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { News } from '../../news/model/news';
import { AppMaterialModule } from '../../../shared/app-material/app-material-module';
import { CommonModule, DatePipe } from '@angular/common';
import { EnvironmentConfigExampleComponent } from '../examples/environment-config.example';
import { PageContainerComponent } from '../../../shared/components/page-container/page-container';

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
  news: News[] = [];

  /** Imagem de fundo do hero (opcional). Ex.: 'assets/home/hero.jpg' */
  heroImage: string | null = null;

  /** Imagem da seção história (opcional). Coloque em assets/home/historia.jpg */
  historyImage: string | null = null;

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

  ngOnInit(): void {
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
