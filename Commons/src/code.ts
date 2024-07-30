figma.showUI(__html__, { width: 400, height: 600 });

// At the beginning of an operation that requires loading
figma.ui.postMessage({ type: 'showLoading', show: true });

// When the operation is complete
figma.ui.postMessage({ type: 'showLoading', show: false });

// Add this utility function
function setLoading(show: boolean) {
  console.log("Setting loading state:", show);
  figma.ui.postMessage({ type: 'showLoading', show: show === true });
}


figma.ui.onmessage = async (msg) => {
  console.log("Received message:", msg);
  if (msg.type === 'insert-image') {
    // Replace the existing content of this block with:
    setLoading(true);
    try {
      const { url } = msg;
      const imageBytes = await fetch(url).then((res) => res.arrayBuffer());
      const imageHash = figma.createImage(new Uint8Array(imageBytes)).hash;

      const nodes = figma.currentPage.selection;
      if (nodes.length > 0) {
        for (const node of nodes) {
          if (node.type === 'RECTANGLE' || node.type === 'FRAME') {
            const selectedNode = node as RectangleNode | FrameNode;
            const newFills = (selectedNode.fills as Array<Paint>).slice().concat({ type: 'IMAGE', scaleMode: 'FILL', imageHash }) as Paint[];
            selectedNode.fills = newFills;
          }
        }
      } else {
        const rect = figma.createRectangle();
        rect.resize(200, 200);
        rect.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash }];
        figma.currentPage.appendChild(rect);
        figma.viewport.scrollAndZoomIntoView([rect]);
      }
    } catch (error) {
      console.error('Error inserting image:', error);
      figma.ui.postMessage({ type: 'error', message: 'Failed to insert image' });
    } finally {
      setLoading(false);
    }
  } else if (msg.type === 'insert-text') {
    // Similarly, wrap this block in a try-catch with setLoading
    setLoading(true);
    try {
      const { text } = msg;
      const nodes = figma.currentPage.selection;
      if (nodes.length > 0) {
        for (const node of nodes) {
          if (node.type === 'TEXT') {
            node.characters = text;
          }
        }
      } else {
        const textNode = figma.createText();
        textNode.characters = text;
        figma.currentPage.appendChild(textNode);
        figma.viewport.scrollAndZoomIntoView([textNode]);
      }
    } catch (error) {
      console.error('Error inserting text:', error);
      figma.ui.postMessage({ type: 'error', message: 'Failed to insert text' });
    } finally {
      setLoading(false);
    }
  }
};