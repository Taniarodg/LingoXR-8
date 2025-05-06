import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Text } from '@react-three/drei';

const TextLabel = ({ position, name }) => {
  return (
    <Text
      position={[position[0], position[1] + 2, position[2]]} // Position it above the sphere
      fontSize={0.5} // Adjust font size as needed
      color="white" // Text color
      anchorX="center" // Center the text horizontally
      anchorY="middle" // Center the text vertically
    >
      {name}
    </Text>
  );
};

export default TextLabel;
