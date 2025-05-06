import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import * as THREE from 'three';

const Reticle = ({ onSelect, onHoverStart, onHoverEnd }) => {
  const { isPresenting } = useXR();
  const raycaster = useRef(new THREE.Raycaster());
  const reticleRef = useRef();
  const innerDotRef = useRef();
  const [hoveredObject, setHoveredObject] = useState(null);
  const { camera, scene } = useThree();

  useEffect(() => {
    if (reticleRef.current) {
      camera.add(reticleRef.current);
      reticleRef.current.position.set(0, 0, -2); // Position reticle 2 meters in front of the camera
    }
    return () => {
      if (reticleRef.current) {
        camera.remove(reticleRef.current);
      }
    };
  }, [camera]);

  useFrame(() => {
    if (raycaster.current) {
      // Compute the forward direction relative to the camera
      const direction = new THREE.Vector3(0, 0, -1); // Local forward direction
      direction.applyQuaternion(camera.quaternion); // Transform to world space
      raycaster.current.set(camera.position, direction);

      // Check for intersections with scene objects
      const intersects = raycaster.current.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        const firstObject = intersects[0].object;

        // Handle hover events
        if (hoveredObject !== firstObject) {
          if (hoveredObject) {
            onHoverEnd?.(hoveredObject); // Trigger hover end event
          }
          setHoveredObject(firstObject);
          onHoverStart?.(firstObject); // Trigger hover start event
        }

        // Grow the inner dot when gazing
        if (innerDotRef.current) {
          innerDotRef.current.scale.lerp(new THREE.Vector3(2, 2, 2), 0.1); // Smoothly scale up
        }
      } else {
        // Reset hover and inner dot size
        if (hoveredObject) {
          onHoverEnd?.(hoveredObject);
          setHoveredObject(null);
        }
        if (innerDotRef.current) {
          innerDotRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1); // Smoothly scale back
        }
      }
    }
  });

  const handleSelect = () => {
    if (hoveredObject) {
      onSelect?.(hoveredObject); // Trigger select event
    }
  };

  return (
    <>
      {/* Reticle */}
      <group ref={reticleRef} onClick={handleSelect}>
        {/* Outer ring */}
        <mesh>
          <ringGeometry args={[0.05, 0.06, 32]} />
          <meshBasicMaterial
            color={hoveredObject ? '#00ff00' : 'red'}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Inner dot */}
        <mesh ref={innerDotRef}>
          <circleGeometry args={[0.01, 32]} />
          <meshBasicMaterial
            color={hoveredObject ? '#00ff00' : 'red'}
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>
    </>
  );
};

export default Reticle;
