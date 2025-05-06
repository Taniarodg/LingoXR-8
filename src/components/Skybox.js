// components/Skybox.js
import React from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

const Skybox = () => {
  const texture = useLoader(TextureLoader, '/space.jpg');

  return (
    <mesh>
      <boxGeometry args={[100, 100, 100]} />
      <meshBasicMaterial attach="material" map={texture} side={2} />
    </mesh>
  );
};

export default Skybox;
