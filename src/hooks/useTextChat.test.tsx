import { act, renderHook, waitFor } from '@testing-library/react';

jest.mock('../utils/pipecatConfig', () => ({
  CHAT_ENGINE_URL: 'https://chat.example.com',
  generateDiscoveryId: () => 'test-user',
}));

import { useTextChat } from './useTextChat';

describe('useTextChat', () => {
  afterEach(() => jest.restoreAllMocks());

  it('retries a failed message without appending a duplicate user turn', async () => {
    const fetchMock = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ response: 'Try three focused movements.' }),
      });
    Object.defineProperty(globalThis, 'fetch', { configurable: true, value: fetchMock, writable: true });
    const { result } = renderHook(() => useTextChat({ personality: 'reed', userId: 'user-1' }));

    await act(async () => { await result.current.sendMessage('I have 30 minutes'); });
    expect(result.current.messages).toEqual([{ role: 'user', text: 'I have 30 minutes' }]);
    expect(result.current.failedMessage).toBe('I have 30 minutes');

    await act(async () => { await result.current.retryLastMessage(); });
    await waitFor(() => expect(result.current.messages).toHaveLength(2));
    expect(result.current.messages.filter((message) => message.role === 'user')).toHaveLength(1);
    expect(result.current.messages[1]).toEqual({ role: 'assistant', text: 'Try three focused movements.' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
