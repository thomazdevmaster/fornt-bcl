import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseCrudService } from '../../../shared/base-classes/base-crud.service';
import { EnvironmentService } from '../../../core/services/environment.service';
import { Song } from '../model/song';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SongService extends BaseCrudService<Song> {

  protected override get endpoint(): string {
    return `${this.envConfig.getApiUrl()}/songs`;
  }

  constructor(httpClient: HttpClient, private envConfig: EnvironmentService) {
    super(httpClient);
  }

  override create(song: Song): Observable<any> {
    const formData = this.convertToFormData(song);

    return this.httpClient.post(this.endpoint, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  override update(id: string | number, song: Song): Observable<Song> {
    const formData = this.convertToFormData(song);
    return this.httpClient.put<Song>(`${this.endpoint}/${id}`, formData);
  }

  private convertToFormData(song: any): FormData {
    const formData = new FormData();

    // 1. Dados básicos (Title, Author, etc)
    formData.append('title', song.title);
    formData.append('author', song.author);
    if (song.creationDate) {
      formData.append('creationDate', new Date(song.creationDate).toISOString());
    }
    formData.append('youtubeUrl', song.youtubeUrl || '');

    // 2. Arquivos Gerais (Banda toda)
    if (song.fullSheetMusicUrl instanceof File) {
      formData.append('fullSheetMusic', song.fullSheetMusicUrl);
    }
    if (song.fullMidiUrl instanceof File) {
      formData.append('fullMidi', song.fullMidiUrl);
    }

    // 3. Partes Individuais (Instrumentos)
    if (song.parts && Array.isArray(song.parts)) {
      song.parts.forEach((part: any, index: number) => {
        formData.append(`parts[${index}][instrument]`, part.instrument);
        formData.append(`parts[${index}][voice]`, part.voice);

        // Upload dos arquivos de cada parte usando chaves únicas para o backend
        if (part.urlSheet instanceof File) {
          formData.append(`partSheet_${index}`, part.urlSheet);
        }
        if (part.urlMidi instanceof File) {
          formData.append(`partMidi_${index}`, part.urlMidi);
        }
      });
    }

    return formData;
  }
}
