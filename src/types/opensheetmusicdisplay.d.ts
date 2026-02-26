declare module 'opensheetmusicdisplay' {
  export class OpenSheetMusicDisplay {
    constructor(container: HTMLElement | string, options?: Record<string, unknown>);
    load(xml: string | Document): Promise<void>;
    render(): Promise<void>;
    /** Enable or disable (hide) the built-in cursor(s). */
    enableOrDisableCursors(enable: boolean): void;
    cursor?: {
      show(): void;
      hide(): void;
      reset(): void;
      next(): void;
    };
  }
}
