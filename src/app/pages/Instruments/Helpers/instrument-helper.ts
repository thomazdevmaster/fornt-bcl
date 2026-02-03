export enum INSTRUMENTS_TYPES {
  TRUMPET = 'Trompete',
  TROMBONE = 'Trombone',
  SAX_ALTO = 'Sax Alto',
  SAX_TENOR = 'Sax Tenor',
  SAX_SOPRANO = 'Sax Soprano',
  SAX_BARITONE = 'Sax Barítono',
  BASS_TUBA = 'Baixo/Tuba',
  CLARINET = 'Clarinete',
  FLUTE = 'Flauta',
  FLUTELET = 'Flautim',
  PERCUSSION = 'Percussão',
  DRUMS = 'Bateria'
}

export interface IInstrumentMetadata {
  name: string;
  iconPath: string;
  title: string;
}

export const INSTRUMENT_METADATA: Record<INSTRUMENTS_TYPES, IInstrumentMetadata> = {
  [INSTRUMENTS_TYPES.TRUMPET]: { name: 'Trompete', iconPath: 'instruments/trumpet.png', title: 'Trompete' },
  [INSTRUMENTS_TYPES.TROMBONE]: { name: 'Trombone', iconPath: 'instruments/trombone.png', title: 'Trombone' },
  [INSTRUMENTS_TYPES.SAX_ALTO]: { name: 'Sax Alto', iconPath: 'instruments/altoSax.png', title: 'Saxofone alto Mi bemol' },
  [INSTRUMENTS_TYPES.SAX_TENOR]: { name: 'Sax Tenor', iconPath: 'instruments/tenorSax.png', title: 'Saxofone tenor Si bemol' },
  [INSTRUMENTS_TYPES.SAX_SOPRANO]: { name: 'Sax Soprano', iconPath: 'instruments/sopranoSax.png', title: 'Saxofone soprano' },
  [INSTRUMENTS_TYPES.SAX_BARITONE]: { name: 'Sax Barítono', iconPath: 'instruments/baritonSax.png', title: 'Saxofone barítono' },
  [INSTRUMENTS_TYPES.BASS_TUBA]: { name: 'Baixo/Tuba', iconPath: 'instruments/tuba.png', title: 'Baixo/Tuba' },
  [INSTRUMENTS_TYPES.CLARINET]: { name: 'Clarinete', iconPath: 'instruments/clarinete.png', title: 'Clarinete' },
  [INSTRUMENTS_TYPES.FLUTE]: { name: 'Flauta', iconPath: 'instruments/flauta.png', title: 'Flauta transversal' },
  [INSTRUMENTS_TYPES.FLUTELET]: { name: 'Flautim', iconPath: 'instruments/flautim.png', title: 'Flautin/Piccolo' },
  [INSTRUMENTS_TYPES.PERCUSSION]: { name: 'Percussão', iconPath: 'instruments/percussao.png', title: 'Acessórios Percussão' },
  [INSTRUMENTS_TYPES.DRUMS]: { name: 'Bateria', iconPath: 'instruments/bateria.png', title: 'Bateria Americana' },
};
