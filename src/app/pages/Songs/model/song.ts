export interface ISongPart {
  instrument: string;
  voice: string;
  urlSheet: string; // PDF
  urlMidi: string;  // MIDI/Áudio
}

export class Song {
  id!: number;
  title: string = '';
  author: string = '';
  arranger: string = '';
  creationDate: Date = new Date();
  youtubeUrl?: string;
  referenceLink: string = '';

  // Arquivos Gerais
  fullSheetMusicUrl?: string;
  fullMidiUrl?: string;

  // Partes individuais
  parts: ISongPart[] = [];

  constructor(data?: Partial<Song>) {
    Object.assign(this, data);
  }
}
