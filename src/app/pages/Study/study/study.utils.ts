import { DEFAULT_INSTRUMENT_METADATA, IInstrumentMetadata, resolveInstrumentMetadata } from '../../Instruments/Helpers/instrument-helper';

export interface TempoInfo {
  bpm: number | null;
  timeSignature: string | null;
  beatsPerMeasure: number | null;
  beatUnit: number | null;
}

export interface InstrumentInfo {
  id: string;
  name: string;
  iconPath: string;
  title: string;
}

const parseXml = (xml: string): Document | null => {
  if (typeof window === 'undefined') return null;
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');
  const parserError = doc.querySelector('parsererror');
  if (parserError) return null;
  return doc;
};

export const extractTempoInfoFromXml = (xml: string): TempoInfo | null => {
  const doc = parseXml(xml);
  if (!doc) return null;
  let bpm: number | null = null;
  const soundTempo = doc.querySelector('sound[tempo]')?.getAttribute('tempo');
  if (soundTempo) {
    const parsed = Number(soundTempo);
    if (!Number.isNaN(parsed) && parsed > 0) bpm = parsed;
  }
  const metronome = doc.querySelector('metronome > per-minute')?.textContent?.trim();
  if (metronome) {
    const parsed = Number(metronome);
    if (!Number.isNaN(parsed) && parsed > 0) bpm = parsed;
  }
  const beats = doc.querySelector('time > beats')?.textContent?.trim();
  const beatType = doc.querySelector('time > beat-type')?.textContent?.trim();
  const beatsPerMeasure = beats ? Number(beats) : null;
  const beatUnit = beatType ? Number(beatType) : null;
  const timeSignature =
    beatsPerMeasure && beatUnit ? `${beatsPerMeasure}/${beatUnit}` : null;
  return { bpm, timeSignature, beatsPerMeasure, beatUnit };
};

export const extractInstrumentsFromXml = (xml: string): InstrumentInfo[] => {
  const doc = parseXml(xml);
  if (!doc) return [];
  const scoreParts = Array.from(doc.querySelectorAll('part-list > score-part'));
  return scoreParts
    .map((part) => {
      const id = part.getAttribute('id') || '';
      const partName = part.querySelector('part-name')?.textContent?.trim() || '';
      const instrumentName =
        part.querySelector('score-instrument > instrument-name')?.textContent?.trim() || '';
      const partAbbrev = part.querySelector('part-abbreviation')?.textContent?.trim() || '';
      const instrumentAbbrev =
        part.querySelector('score-instrument > instrument-abbreviation')?.textContent?.trim() || '';
      const candidates = [partName, instrumentName, partAbbrev, instrumentAbbrev].filter(Boolean);
      let meta: IInstrumentMetadata | null = null;
      for (const candidate of candidates) {
        meta = resolveInstrumentMetadata(candidate);
        if (meta) break;
      }
      const fallbackName = candidates[0] || DEFAULT_INSTRUMENT_METADATA.name;
      return {
        id,
        name: meta?.name || fallbackName,
        iconPath: meta?.iconPath || DEFAULT_INSTRUMENT_METADATA.iconPath,
        title: meta?.title || fallbackName,
      };
    })
    .filter((part) => part.id);
};

export const filterXmlByPartIds = (xml: string, selectedIds: string[]): string => {
  const doc = parseXml(xml);
  if (!doc) return xml;
  const selected = new Set(selectedIds);
  const scoreParts = Array.from(doc.querySelectorAll('part-list > score-part'));
  scoreParts.forEach((part) => {
    const id = part.getAttribute('id') || '';
    if (id && !selected.has(id)) {
      part.remove();
    }
  });
  const parts = Array.from(doc.querySelectorAll('part'));
  parts.forEach((part) => {
    const id = part.getAttribute('id') || '';
    if (id && !selected.has(id)) {
      part.remove();
    }
  });
  return new XMLSerializer().serializeToString(doc);
};
