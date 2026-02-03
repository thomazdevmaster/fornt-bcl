import { INSTRUMENTS_TYPES } from './../../Instruments/Helpers/instrument-helper';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AppMaterialModule } from '../../../shared/app-material/app-material-module';
import { Song } from '../model/song';
import { MatStepperModule } from '@angular/material/stepper';
import { provideNativeDateAdapter } from '@angular/material/core';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { SongService } from '../services/song.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-song-form-stepper',
  standalone: true,
  imports: [
    CommonModule,
    AppMaterialModule,
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './song-form-stepper.html',
  styleUrl: './song-form-stepper.scss'
})
export class SongFormStepperComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<SongFormStepperComponent>);

  // Formulário reativo para o Passo 1 (Validação Obrigatória)
  basicForm!: FormGroup;

  songService: SongService = inject(SongService);

  // Objeto Song que será preenchido
  song: Song = new Song();
  instruments = Object.values(INSTRUMENTS_TYPES);

  ngOnInit(): void {
    this.basicForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      creationDate: [new Date(), Validators.required]
    });
  }

  // Métodos para o Passo 2 (Partes Individuais)
  addPart(): void {
    if (!this.song.parts) {
      this.song.parts = [];
    }
    this.song.parts.push({
      instrument: '',
      voice: '',
      urlSheet: '',
      urlMidi: ''
    });
  }

  removePart(index: number): void {
    this.song.parts.splice(index, 1);
  }

  uploadProgress: number = 0;
  isUploading: boolean = false;

  save(): void {
    if (this.basicForm.valid) {
      this.isUploading = true;
      const finalData = { ...this.song, ...this.basicForm.value };

      this.songService.create(finalData).subscribe({
        next: (event: HttpEvent<any>) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              // Calcula a porcentagem
              if (event.total) {
                this.uploadProgress = Math.round((100 * event.loaded) / event.total);
              }
              break;
            case HttpEventType.Response:
              // Upload concluído com sucesso
              this.isUploading = false;
              this.dialogRef.close(event.body);
              break;
          }
        },
        error: (err) => {
          this.isUploading = false;
          console.error('Erro no upload:', err);
        }
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  onFileSelect(event: any, field: keyof Song): void {
    const file = event.target.files[0];
    if (file) {
      (this.song as any)[field] = file;
    }
  }

  onPartFileSelect(event: any, part: any, field: 'urlSheet' | 'urlMidi'): void {
    const file = event.target.files[0];
    if (file) {
      part[field] = file;
    }
  }

  getFileName(file: any): string {
    if (file instanceof File) return file.name;
    return file ? 'Arquivo selecionado' : '';
  }
}
