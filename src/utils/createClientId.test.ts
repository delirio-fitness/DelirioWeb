import { createClientId } from './createClientId';

describe('createClientId', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses native randomUUID when the browser exposes it', () => {
    const randomUUID = jest.spyOn(crypto, 'randomUUID').mockReturnValue('11111111-1111-4111-8111-111111111111');

    expect(createClientId()).toBe('11111111-1111-4111-8111-111111111111');
    expect(randomUUID).toHaveBeenCalledTimes(1);
  });

  it('creates a UUID-compatible ID when randomUUID is unavailable', () => {
    const descriptor = Object.getOwnPropertyDescriptor(crypto, 'randomUUID');
    Object.defineProperty(crypto, 'randomUUID', { configurable: true, value: undefined });
    try {
      jest.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
        const bytes = array as Uint8Array;
        bytes.forEach((_, index) => { bytes[index] = index; });
        return array;
      });

      expect(createClientId()).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
    } finally {
      if (descriptor) Object.defineProperty(crypto, 'randomUUID', descriptor);
    }
  });
});
