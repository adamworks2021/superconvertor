declare module 'gif.js' {
  interface GIFOptions {
    workers?: number;
    quality?: number;
    width?: number;
    height?: number;
    repeat?: number;
    background?: string;
    transparent?: string | null;
    dither?: string | boolean;
    debug?: boolean;
    workerScript?: string;
  }

  interface GIFFrameOptions {
    delay?: number;
    copy?: boolean;
    dispose?: number;
  }

  export default class GIF {
    constructor(options?: GIFOptions);
    addFrame(element: HTMLCanvasElement | HTMLImageElement | CanvasRenderingContext2D, options?: GIFFrameOptions): void;
    render(): void;
    on(event: 'finished', callback: (blob: Blob) => void): void;
    on(event: 'error', callback: (error: any) => void): void;
    on(event: 'progress', callback: (progress: number) => void): void;
    on(event: string, callback: (...args: any[]) => void): void;
    setOptions(options: GIFOptions): void;
  }
}
