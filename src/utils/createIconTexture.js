// utils/createIconTexture.js

import { CanvasTexture } from 'three';
import { Icon } from '@mui/material'; // Material UI Icon component

export function createIconTexture(iconName, size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');

  // Set background to transparent
  context.clearRect(0, 0, size, size);

  // Draw Material Icon
  context.font = `${size * 0.8}px Material Icons`;
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(iconName, size / 2, size / 2);

  // Create and return texture
  const texture = new CanvasTexture(canvas);
  return texture;
}
