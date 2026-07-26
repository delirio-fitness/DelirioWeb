import '@testing-library/jest-dom';
import 'whatwg-fetch';
import { BroadcastChannel } from 'worker_threads';
import { ReadableStream, TransformStream, WritableStream } from 'stream/web';
import { TextDecoder, TextEncoder } from 'util';

Object.defineProperty(globalThis, 'TextEncoder', { configurable: true, value: TextEncoder });
Object.defineProperty(globalThis, 'TextDecoder', { configurable: true, value: TextDecoder });
Object.defineProperty(globalThis, 'BroadcastChannel', { configurable: true, value: BroadcastChannel });
Object.defineProperty(globalThis, 'ReadableStream', { configurable: true, value: ReadableStream });
Object.defineProperty(globalThis, 'TransformStream', { configurable: true, value: TransformStream });
Object.defineProperty(globalThis, 'WritableStream', { configurable: true, value: WritableStream });
Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: jest.fn(() => 'blob:test') });
Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: jest.fn() });

class ResizeObserverMock {
  disconnect() {}
  observe() {}
  unobserve() {}
}

Object.defineProperty(window, 'ResizeObserver', {
  configurable: true,
  value: ResizeObserverMock,
});

Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});

Element.prototype.scrollIntoView = jest.fn();
HTMLElement.prototype.scrollTo = jest.fn();
window.scrollTo = jest.fn();
