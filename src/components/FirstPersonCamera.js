import React, { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';

function FirstPersonCamera() {
  const { camera } = useThree();
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });
  const sensitivity = 0.005; // Adjust the rotation sensitivity as needed.

  useEffect(() => {
    const handleMouseDown = (e) => {
      isDragging.current = true;
      previousMouse.current.x = e.clientX;
      previousMouse.current.y = e.clientY;
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;

      const delta = {
        x: e.clientX - previousMouse.current.x,
        y: e.clientY - previousMouse.current.y,
      };

      camera.rotation.y -= delta.x * sensitivity;
      camera.rotation.x  = 0;

      previousMouse.current.x = e.clientX;
      previousMouse.current.y = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    // Add mouse event listeners when the component mounts.
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Clean up event listeners when the component unmounts.
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [camera]);

  return null; // This component doesn't render any visual elements.
}

export default FirstPersonCamera;
