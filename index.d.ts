type Listener = (event: EventData) => void;

type EventData = {
  context: unknown = { };
  defaultPrevented: boolean = false;
  error?: Error;
  name: string;
  result?: unknown;
  [key: string]: unknown; // ...data
  preventDefault(): void;
  stopPropagation(): void;
};

export function createEvent(name: string, data: { [key: string]: unknown }): EventData;

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

export const RESULT_KEY: unique symbol;