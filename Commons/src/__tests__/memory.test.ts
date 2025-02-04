import { JSDOM } from 'jsdom';

describe('Memory Management', () => {
  let dom: JSDOM;
  let window: any;
  let document: Document;

  beforeEach(() => {
    // Create a fresh DOM for each test
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="loadingIndicator" class="hidden">
            <div></div>
          </div>
          <div id="search-results"></div>
          <div id="text-search-content"></div>
        </body>
      </html>
    `, { runScripts: 'dangerously' });
    window = dom.window;
    document = window.document;

    // Add global variables needed by the UI script
    window.loadingProgress = 0;
    window.loadingInterval = null;

    // Mock the parent postMessage
    window.parent = {
      postMessage: jest.fn()
    };

    // Load the UI script
    const scriptContent = require('fs').readFileSync('./ui.html', 'utf8');
    const scriptMatch = scriptContent.match(/<script>([\s\S]*?)<\/script>/);
    if (scriptMatch) {
      const script = document.createElement('script');
      script.textContent = scriptMatch[1];
      document.body.appendChild(script);
    }
  });

  afterEach(() => {
    // Clean up
    window.close();
  });

  test('loading indicator interval is properly cleared', async () => {
    const setIntervalSpy = jest.spyOn(window, 'setInterval');
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');

    // Show loading indicator
    window.showLoadingIndicator(true);
    expect(setIntervalSpy).toHaveBeenCalled();
    expect(window.loadingInterval).toBeDefined();

    // Hide loading indicator
    window.showLoadingIndicator(false);
    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(window.loadingInterval).toBeNull();

    // Reset spies
    setIntervalSpy.mockClear();
    clearIntervalSpy.mockClear();

    // Show and hide quickly multiple times
    for (let i = 0; i < 5; i++) {
      window.showLoadingIndicator(true);
      expect(setIntervalSpy).toHaveBeenCalledTimes(i + 1);
      window.showLoadingIndicator(false);
      expect(clearIntervalSpy).toHaveBeenCalledTimes(i + 1);
    }

    // Should have cleared all intervals
    expect(window.loadingInterval).toBeNull();
  });

  test('search results are properly cleaned up', async () => {
    const searchResultsContainer = document.getElementById('search-results');
    const mockImageData = {
      query: {
        search: [
          { title: 'test1.jpg' },
          { title: 'test2.png' }
        ],
        pages: {
          1: {
            imageinfo: [{
              url: 'test.jpg',
              thumburl: 'test_thumb.jpg'
            }]
          }
        }
      }
    };

    // Mock fetch
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockImageData)
      })
    );

    // Perform multiple searches
    for (let i = 0; i < 3; i++) {
      await window.searchImages();
    }

    // Check that old event listeners are removed
    if (!searchResultsContainer) throw new Error('Search results container not found');
    const imgElements = searchResultsContainer.getElementsByTagName('img');
    expect(imgElements.length).toBeLessThanOrEqual(2); // Should only have the latest search results
  });

  test('window message handler is properly cleaned up', () => {
    // Load the UI script again to ensure message handler is set up
    const scriptContent = require('fs').readFileSync('./ui.html', 'utf8');
    const scriptMatch = scriptContent.match(/<script>([\s\S]*?)<\/script>/);
    if (scriptMatch) {
      const script = document.createElement('script');
      script.textContent = scriptMatch[1];
      document.body.appendChild(script);
    }

    // Verify that the message handler exists
    expect(window.messageHandler).toBeDefined();

    // Clean up
    window.dispatchEvent(new window.Event('unload'));

    // Verify that the message handler was removed
    expect(window.messageHandler).toBeUndefined();
  });
});