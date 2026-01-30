export interface Imedia {
  url: string;
  title: string;
  type: 'image' | 'video' | 'audio' | 'document';
  external: boolean;
}
