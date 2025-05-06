// components/CurvedLine.js
import React from 'react';
import * as THREE from 'three';

const CurvedLine = ({ start, end, isHighlighted }) => {
  // console.log(isHighlighted);
  // Create the points for the curve
  const points = [
    new THREE.Vector3(...start),
    new THREE.Vector3((start[0] + end[0]) / 2, Math.max(start[1], end[1]) + 1, (start[2] + end[2]) / 2), // Control point for curvature
    new THREE.Vector3(...end)
  ];

  // Create the CatmullRom curve
  const curve = new THREE.CatmullRomCurve3(points, false);
  const curvePoints = curve.getPoints(50); // Generate points along the curve

  // Create the geometry for the line
  const geometry = new THREE.BufferGeometry();
  geometry.setFromPoints(curvePoints); // Set the points for the geometry

  return (
    <line geometry={geometry}>
      <lineBasicMaterial 
        attach="material" 
        color={isHighlighted ? 'red' : 'white'} // Highlight if the line is connected to the hovered planet
        linewidth={isHighlighted ? 2 : 1} // Optionally change line width when highlighted
      />
    </line>
  );
};


export default CurvedLine;
