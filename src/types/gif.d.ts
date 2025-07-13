declare module 'gif.js' {
  interface GIFOptions {
    workers?: number;
    quality?: number;
    width?: number;
    height?: number;
    workerScript?: string;
    repeat?: number;
    transparent?: string | null;
  }

  class GIF {
    constructor(options?: GIFOptions);
    addFrame(canvas: HTMLCanvasElement | HTMLImageElement, options?: { delay?: number }): void;
    render(): void;
    on(event: 'finished', callback: (blob: Blob) => void): void;
    on(event: 'error', callback: (error: Error | string | unknown) => void): void;
    on(event: 'progress', callback: (progress: number) => void): void;
    on(event: string, callback: (...args: unknown[]) => void): void;
  }

  export = GIF;
}
