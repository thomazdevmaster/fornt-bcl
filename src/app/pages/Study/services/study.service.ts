import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from '../../../core/services/environment.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StudyService {
  constructor(private http: HttpClient, private envConfig: EnvironmentService) {}

  private get apiUrl(): string {
    return this.envConfig.getApiUrl();
  }

  getMusicXmlById(id: string): Observable<string> {
    return this.http.get(`${this.apiUrl}/scores/${id}/musicxml`, {
      responseType: 'text',
    });
  }

  getMidiById(id: string): Observable<ArrayBuffer> {
    return this.http.get(`${this.apiUrl}/scores/${id}/midi`, {
      responseType: 'arraybuffer',
    });
  }

  generateMidiFromXml(id: string): Observable<ArrayBuffer> {
    return this.http.get(`${this.apiUrl}/scores/${id}/midi?generate=true`, {
      responseType: 'arraybuffer',
    });
  }
}
