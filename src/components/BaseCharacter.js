import { useSphere } from '@react-three/cannon';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { usePlayerControls } from './helpers.js';
import * as THREE from 'three';

const BaseCharacter = (props) => {
  const [isMouseDragging, setIsMouseDragging] = useState(false); // Track if the mouse is dragging
  const [cameraReturn, setCameraReturn] = useState(true); // Track when to return the camera to position

  const direction = new THREE.Vector3();
  const frontVector = new THREE.Vector3();
  const sideVector = new THREE.Vector3();
  const speed = new THREE.Vector3();
  const SPEED = 2;

  const { camera, gl, controls } = useThree(); // Access controls if using OrbitControls

  const [ref, api] = useSphere((index) => ({
    mass: 1,
    type: 'Dynamic',
    position: props.cameraPosition,
    ...props,
  }));

  const { forward, backward, left, right } = usePlayerControls();
  const velocity = useRef([0, 0, 0]);
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), []);

  // Detect mouse drag for orbit controls
  useEffect(() => {
    const handleMouseDown = () => {
      setIsMouseDragging(true);
      setCameraReturn(false); // Disable smooth return while dragging
    };
    const handleMouseUp = () => {
      setIsMouseDragging(false);
      setCameraReturn(true); // Enable smooth return after releasing the mouse
    };

    gl.domElement.addEventListener('mousedown', handleMouseDown);
    gl.domElement.addEventListener('mouseup', handleMouseUp);

    return () => {
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      gl.domElement.removeEventListener('mouseup', handleMouseUp);
    };
  }, [gl.domElement]);

  useFrame(() => {
    // Get the character's current position
    const characterPosition = new THREE.Vector3();
    ref.current.getWorldPosition(characterPosition);

    if (!isMouseDragging && cameraReturn) {
      // Set the camera's desired offset (e.g., behind and above the character)
      const cameraOffset = new THREE.Vector3(0, 0, 2); // Adjust as needed

      // Move the camera smoothly toward the character's position plus the offset
      camera.position.lerp(characterPosition.clone().add(cameraOffset), 0.1);

      // Make the camera look at the character
      camera.lookAt(characterPosition);
    }

    // Update movement controls if not dragging the mouse
    if (!isMouseDragging) {
      frontVector.set(0, 0, Number(backward) - Number(forward));
      sideVector.set(Number(left) - Number(right), 0, 0);

      // Apply the player's movement direction and speed
      direction.subVectors(frontVector, sideVector)
        .normalize()
        .multiplyScalar(SPEED)
        .applyEuler(camera.rotation);

      speed.fromArray(velocity.current);
      api.velocity.set(direction.x, velocity.current[1], direction.z);
    }
  });

  return (
    <group>
      <group scale={[1, 1.5, 1]}>
        <mesh castShadow position={props.position} ref={ref}>
          <sphereGeometry args={props.args} />
          <meshStandardMaterial color="#FFFF00" />
        </mesh>
      </group>
    </group>
  );
};

export default BaseCharacter;
