import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';
import wordsJson from './words.json';
import Skybox from './components/Skybox';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, Dialog } from '@mui/material';
import DialogBox from './components/DialogBox';

const Node = ({ name, position, onPointerOver, onPointerOut }) => {
  return (
    <group position={position} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      <Sphere args={[0.2, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="white" />
      </Sphere>
      <Text position={[0, 0.3, 0]} fontSize={0.1} color="white" anchorX="center" anchorY="middle">
        {name}
      </Text>
    </group>
  );
};

const LineBetweenNodes = ({ start, end, isHovered }) => {
  const points = [start, end];
  const color = isHovered ? 'red' : 'white'; // Change color on hover
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p)));

  return (
    <line>
      <bufferGeometry attach="geometry" {...lineGeometry} />
      <lineBasicMaterial attach="material" color={color} />
    </line>
  );
};

const App = () => {
  const [hoveredNode, setHoveredNode] = useState(null);

  // Recursively create nodes with smaller and smaller radius for compounds
  const createNodes = (nodeData, radius, parentPosition = null, level = 1) => {
  return nodeData.map((node, index) => {
    // Calculate angle and position for current node
    const angle = (index * (2 * Math.PI)) / nodeData.length;

    // Introduce randomness and offset for positioning
    const x = parentPosition ? parentPosition[0] + (radius * Math.cos(angle)) + Math.random() * 0.2 : 0;
    const z = parentPosition ? parentPosition[2] + (radius * Math.sin(angle)) + Math.random() * 0.2 : 0;
    const y = level * 0.2; // Add vertical displacement based on the level

    const nodePosition = [x, y, z];

    return (
      <group key={node.name}>
        {/* Render the current node */}
        <Node
          name={node.name}
          position={nodePosition}
          // onPointerOver={() => setHoveredNode(node.name)}
          // onPointerOut={() => setHoveredNode(null)}
        />
        
        {/* Recursively render child nodes (compounds) with a smaller radius */}
        {node.compounds && node.compounds.length > 0 && createNodes(node.compounds, radius * 0.4, nodePosition, level + 1)}
        
        {/* Only draw a line if there's a parentPosition (skip drawing for the center node) */}
        {parentPosition && (
          <LineBetweenNodes
            start={parentPosition}  // Start from parent node
            end={nodePosition}      // End at child node
            isHovered={hoveredNode === node.name}
          />
        )}
      </group>
    );
  });
};

  

  return (
    <Canvas style={{ height: '100vh', background: 'black' }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      <Skybox />
      <OrbitControls />
      {createNodes(wordsJson.nodes, 10)} {/* Start from the central node with initial radius */}
    </Canvas>
  );
};

export default App;
