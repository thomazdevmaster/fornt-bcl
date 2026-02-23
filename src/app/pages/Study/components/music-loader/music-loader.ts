import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-music-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './music-loader.html',
  styleUrl: './music-loader.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicLoaderComponent {
  @Input() text: string | null = null;
  @Input() size: 'lg' | 'md' = 'md';
}
