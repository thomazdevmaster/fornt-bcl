import { Component, OnInit } from '@angular/core';
import { News } from '../../news/model/news';
import { AppMaterialModule } from '../../../shared/app-material/app-material-module';
import { CommonModule, DatePipe } from '@angular/common';
import { Shortcut } from '../model/shortcut';
import { EnvironmentConfigExampleComponent } from "../examples/environment-config.example";

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    AppMaterialModule,
    DatePipe,
    EnvironmentConfigExampleComponent
],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  news: News[] = [];
  shortcuts: Shortcut[] = [];

  ngOnInit() {
    // Mock de notícias
    this.news = [
      {
        title: 'Lançamento da nova versão do BCL',
        summary: 'Agora com suporte a mapeamento avançado e performance otimizada.',
        link: '#',
        date: new Date('2025-11-10')
      },
      {
        title: 'Integração com API de Músicos disponível',
        summary: 'Conecte e gerencie dados em tempo real.',
        link: '#',
        date: new Date('2025-11-09')
      }
    ];
  }
}
