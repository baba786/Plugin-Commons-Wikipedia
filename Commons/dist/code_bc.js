"use strict";
figma.showUI(__html__, { width: 400, height: 600 });
figma.ui.onmessage = async (msg) => {
    if (msg.type === 'insert-image') {
        const { url } = msg;
        const imageBytes = await fetch(url).then((res) => res.arrayBuffer());
        const imageHash = figma.createImage(new Uint8Array(imageBytes)).hash;
        const nodes = figma.currentPage.selection;
        if (nodes.length > 0) {
            for (const node of nodes) {
                if (node.type === 'RECTANGLE' || node.type === 'FRAME') {
                    const selectedNode = node;
                    const newFills = selectedNode.fills.slice().concat({ type: 'IMAGE', scaleMode: 'FILL', imageHash });
                    selectedNode.fills = newFills;
                }
            }
        }
        else {
            const rect = figma.createRectangle();
            rect.resize(200, 200);
            rect.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash }];
            figma.currentPage.appendChild(rect);
            figma.viewport.scrollAndZoomIntoView([rect]);
        }
    }
    else if (msg.type === 'insert-text') {
        const { text } = msg;
        const nodes = figma.currentPage.selection;
        if (nodes.length > 0) {
            for (const node of nodes) {
                if (node.type === 'TEXT') {
                    node.characters = text;
                }
            }
        }
        else {
            const textNode = figma.createText();
            textNode.characters = text;
            figma.currentPage.appendChild(textNode);
            figma.viewport.scrollAndZoomIntoView([textNode]);
        }
    }
};
