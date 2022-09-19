declare module '@esmj/emitter' {
  type Listener = (event: EventData) => void;

  type EventData = {
    context: unknown = {};
    defaultPrevented: boolean = false;
    error?: Error;
    name: string;
    result?: unknown;
    [key: string]: unknown; // ...data
    preventDefault(): void;
    stopPropagation(): void;
  };

  type ErrorData = {
    criticalError: Error,
    error: Error,
    [key: string]: unknown; // ...argument
  }

  export function createEvent(name: string, data: { [key: string]: unknown }): EventData;

  export enum Event {
    Error = '@esmj/emitter.event.error'
  };

  export class Emitter {
    emit(eventName: string, data: unknown = {}): EventData;
    listeners(eventName: string): Listener[];
    off(eventName: string, method: Listener): void;
    on(eventName: string, method: Listener): () => void;
    once(eventName: string, method: Listener): () => void;
    prependListener(eventName: string, method: Listener): () => void;
    prependOnceListener(eventName: string, method: Listener): () => void;
    removeAllListeners(eventName: string): Listener[];
  }
}