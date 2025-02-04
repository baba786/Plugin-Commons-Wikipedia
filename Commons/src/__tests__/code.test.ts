import { jest } from '@jest/globals';
import { mockPostMessage, mockCreateImage, mockCreateRectangle, mockRect } from './setup';

describe('Plugin Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateRectangle.mockReturnValue(mockRect);
    mockCreateImage.mockReturnValue({ hash: 'test-hash' });
  });

  test('should handle network errors in image fetch', async () => {
    // Mock a network error
    (global.fetch as any).mockImplementationOnce(() => Promise.reject(new Error('Network error')));

    // Import the code that contains the message handler
    const code = require('../code');

    // Simulate receiving a message
    const handler = code.default;
    await handler({ type: 'insert-image', url: 'http://example.com/image.jpg' }, {} as any);

    // Verify loading indicator is shown and hidden properly
    expect(mockPostMessage).toHaveBeenCalledWith({ type: 'showLoading', show: true });
    expect(mockPostMessage).toHaveBeenCalledWith({ type: 'error', message: 'Failed to insert image' });
    expect(mockPostMessage).toHaveBeenCalledWith({ type: 'showLoading', show: false });
  });

  test('should handle timeout in API requests', async () => {
    // Mock a timeout
    (global.fetch as any).mockImplementationOnce(() => new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error('AbortError')), 100);
    }));

    // Import the code that contains the message handler
    const code = require('../code');

    // Simulate receiving a message
    const handler = code.default;
    await handler({ type: 'insert-image', url: 'http://example.com/image.jpg' }, {} as any);

    // Verify loading indicator is shown and hidden properly
    expect(mockPostMessage).toHaveBeenCalledWith({ type: 'showLoading', show: true });
    expect(mockPostMessage).toHaveBeenCalledWith({ type: 'error', message: 'Failed to insert image' });
    expect(mockPostMessage).toHaveBeenCalledWith({ type: 'showLoading', show: false });
  }, 1000);
});