declare module 'opensheetmusicdisplay' {
  export class OpenSheetMusicDisplay {
    constructor(container: HTMLElement | string, options?: Record<string, unknown>);
    load(xml: string | Document): Promise<void>;
    render(): Promise<void>;
    cursor?: {
      show(): void;
      reset(): void;
      next(): void;
    };
  }
}
