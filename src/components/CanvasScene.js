import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { XR, XROrigin, createXRStore, Ray, DefaultXRInputSourceRayPointer } from '@react-three/xr';
import { VrpanoRounded } from '@mui/icons-material';
import Reticle from './Reticle';
import { OrbitRing } from './Objects';

const store = createXRStore();

const MovingCamera = ({ isXrActive, position }) => {
  const xrOriginRef = useRef();

  useEffect(() => {
    if (isXrActive && xrOriginRef.current) {
      // Set position and orientation for XR origin
      xrOriginRef.current.position.set([0,-1.5,1]);
    }
  }, [isXrActive, position]);

  return (
    <XROrigin ref={xrOriginRef} position={[0, -2.5, 1]}>
      {/* Any other XR-specific elements */}
    </XROrigin>
  );
};



const CanvasScene = ({ activeNodes, isCameraMoving, createNodes, cameraPosition, selectedNode, setNewCameraPosition, isOrbitActive, startVRMovement,setFirstNodeScreenPosition }) => {
  const cameraRef = useRef();
  const xrOrigin = useRef();

  const [isPanning, setIsPanning] = useState(false);
  const [isXrActive, setIsXrActive] = useState(false);
  
  const [isHovering, setIsHovering] = useState(false);

  const handleHoverStart = () => {
    // console.log("Reticle is hovering over the sphere.");
    setIsHovering(true);
  };

  const handleHoverEnd = () => {
    // console.log("Reticle stopped hovering over the sphere.");
    setIsHovering(false);
  };

  const startTouch = useRef(null);
  
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 3);
      cameraRef.current.lookAt(0, 0, 0);
    }
  }, []);

  const handlePanStart = (x, y) => {
    setIsPanning(true);
    startTouch.current = { x, y };
  };

  const handlePanMove = (x, y) => {
    if (isPanning && startTouch.current && cameraRef.current) {
      const deltaX = x - startTouch.current.x;
      const deltaY = y - startTouch.current.y;
      const panSpeed = 0.002;

      cameraRef.current.position.x -= deltaX * panSpeed;
      cameraRef.current.position.y += deltaY * panSpeed;

      startTouch.current = { x, y };
    }
  };

  useEffect(() => {
    if (activeNodes.length > 0 && cameraRef.current) {
      const firstNodePosition = new THREE.Vector3(...activeNodes[0].position);
      const screenPosition = firstNodePosition.clone().project(cameraRef.current);

      // Convert from normalized device coordinates (NDC) to screen coordinates
      const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
      const y = (1 - screenPosition.y * 0.5 - 0.5) * window.innerHeight;

      setFirstNodeScreenPosition({ x, y });
    }
  },[activeNodes]);


  const handlePanEnd = () => {
    setIsPanning(false);
    startTouch.current = null;
    if (cameraRef.current) setNewCameraPosition(cameraRef.current.position);
  };

  const handleGazeSelect = (object) => {
    // console.log(object);
  };

  return (
    <>
      <Canvas
        style={{ height: '100vh', background: 'black' }}
        // onTouchStart={(e) => handlePanStart(e.touches[0].clientX, e.touches[0].clientY)}
        // onTouchMove={(e) => handlePanMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={handlePanEnd}
        // onMouseDown={(e) => handlePanStart(e.clientX, e.clientY)}
        // onMouseMove={(e) => isPanning && handlePanMove(e.clientX, e.clientY)}
        onMouseUp={handlePanEnd}
        // onMouseLeave={handlePanEnd} 
      >
       
        
        <XR store={store} 
          onSessionStart={() => setIsXrActive(true)}
          onSessionEnd={() => setIsXrActive(false)}>
          <ambientLight intensity={0.5} />
          <directionalLight intensity={2} position={[10, 10, 5]} />
          {/* {isXrActive && <MovingCamera isXrActive={isXrActive} position={cameraPosition} />} */}
           {
          //  !isXrActive && 
           <PerspectiveCamera ref={cameraRef} position={cameraPosition} makeDefault /> 
           }
          {isOrbitActive && !isCameraMoving && 
          <OrbitControls
            touches={{
              ONE: THREE.TOUCH.PAN, // One-finger pan
              TWO: THREE.TOUCH.DOLLY_ROTATE, // Two-finger rotate
          }}
          target={selectedNode ? selectedNode.position : [0,0,0]}></OrbitControls> }
          {createNodes(activeNodes)}
          <Stars count={800} speed={3} />
          {/* <OrbitRing/> */}
          <XROrigin ref={xrOrigin} position={cameraPosition}>
            
          </XROrigin>
          
          {
          isXrActive && 
          (
            <Reticle 

              onSelect={(event) => {
                // console.log('Selected object:', event.intersection?.object);
                // Add your selection logic here
              }}
              
              onHoverStart={handleHoverStart}
              onHoverEnd={handleHoverEnd}
            />
          )}
        </XR>
      </Canvas>
      <button onClick={() => {
                    store.enterVR(); 
                    setIsXrActive(!isXrActive)

                    startVRMovement()
                }} style={{
        position: 'absolute', top: '20px', right: '200px', color: 'white', border: 0,
        fontSize: 14, backgroundColor: 'transparent'
      }}>
        <VrpanoRounded />
      </button>
    </>
  );
};

export default CanvasScene;
