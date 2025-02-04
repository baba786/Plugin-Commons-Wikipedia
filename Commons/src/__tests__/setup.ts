import { jest } from '@jest/globals';

// Mock __html__
(global as any).__html__ = '<div>Mock HTML</div>';

export const mockPostMessage = jest.fn();
export const mockCreateImage = jest.fn();
export const mockCreateRectangle = jest.fn();
export const mockAppendChild = jest.fn();
export const mockScrollAndZoomIntoView = jest.fn();

export const mockRect = {
  resize: jest.fn(),
  fills: [],
};

(global as any).figma = {
  showUI: jest.fn(),
  ui: {
    postMessage: mockPostMessage,
    onmessage: null,
  },
  createImage: mockCreateImage,
  createRectangle: mockCreateRectangle,
  currentPage: {
    selection: [],
    appendChild: mockAppendChild,
  },
  viewport: {
    scrollAndZoomIntoView: mockScrollAndZoomIntoView,
  },
};

// Mock fetch
(global as any).fetch = jest.fn().mockImplementation(() => Promise.resolve({
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
}));