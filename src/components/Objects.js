import React, { useState, useEffect } from 'react';
import { useRef, useMemo } from 'react';

import { useFrame, useLoader } from '@react-three/fiber';
import { Line as DreiLine, Plane, Sparkles } from '@react-three/drei';
import { TextureLoader } from 'three'; // Import TextureLoader
import { Ring } from '@react-three/drei';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import {  Sphere } from '@react-three/drei';
import FakeGlowMaterial from './FakeGlowMaterial';
import { createIconTexture } from '../utils/createIconTexture'; // Helper function

export const Node = ({ name, translation, suffix, prefix, position, level, onClick, color, compoundsCount, onDelete, onInformationClick, zoomToNode, link }) => {

  const [showIcons, setShowIcons] = useState(false);
  const [opacity, setOpacity] = useState(0); // Initial opacity set to 0 (invisible)
  const [isHovered, setIsHovered] = useState(false); // New state for hover
  const fadeDuration = 0.05; // Adjust fade speed
  const [prefixWidth, setPrefixWidth] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);

  const nodeRef = useRef();
  let timerRef = useRef(null); // Store the timer reference
  const prefixRef = useRef();

  const radius = 0.2 * Math.pow(1, level);
  const iconSize = 0.05; // Adjust size of icons
  
  const prefixXPos = -0.05;
  const fontSize = 0.04 * Math.pow(0.7, level);
  const suffixXPos = prefixWidth / 2 * 0.5 *(level/2+1); // Adjust padding if necessary
  const backgroundPadding = 0.02; // Extra padding around the text
  const borderThickness = 0.005; // Thickness of the white border

  // Fade-in effect on click
  useFrame(() => {
    if (showIcons && opacity < 1) {
      setOpacity((prev) => Math.min(prev + fadeDuration, 1));
    }
  });

  const raycastableLayer = 1; // Custom layer

  const handleHover = () => {
    setShowTranslation(true);
  };
  
  const handleUnhover = () => {
    setShowTranslation(false);
  };
  

  const handleNodeClick = (e) => {
    e.stopPropagation(); // Prevents event from affecting other nodes
    zoomToNode(position, nodeRef.current);
    if (showIcons) {
      // Icons are currently visible
      setShowIcons(false);
      setOpacity(0);
      clearTimeout(timerRef.current); // Clear the timer if it's currently running

      // Trigger fade-out if icons are already showing
      const fadeOutInterval = setInterval(() => {
        setOpacity((prev) => {
          if (prev <= 0) {
            clearInterval(fadeOutInterval);
            setShowIcons(false); // Hide icons completely
            return 0;
          }
          return prev - fadeDuration; // Gradually decrease opacity
        });
      }, 5);
    } else {
      // Icons are not visible
      setShowIcons(true);
      setOpacity(0);
      timerRef.current = setTimeout(() => {
        setShowIcons(false); // Automatically hide icons after 7 seconds
      }, 5000); // 7 seconds
    }
  };

  // Memoize icon textures so they are only created once
  const textures = useMemo(() => {
    const loader = new TextureLoader();

    return {
      information: loader.load('/icons/information.png'),
      face: loader.load('/icons/add.png'),
      speak: loader.load('/icons/volume-up.png'),
      delete: loader.load('/icons/delete.png'),
      link: loader.load('/icons/link.png'),
    };
  }, []);

  // Function to handle text-to-speech for node name
  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(name); // Create a new utterance for the word
    utterance.lang = 'fi-FI'; // Set the language to Finnish
    utterance.volume = 1.0;
    utterance.rate = 0.6;
    const voices = window.speechSynthesis.getVoices();
    const finnishVoice = voices.filter(voice => voice.lang === 'fi-FI');
    if (finnishVoice) {
      utterance.voice = finnishVoice[0]; // Set the voice to the Finnish voice
    }
    window.speechSynthesis.speak(utterance);
  };

  // Clean up timer on component unmount
  React.useEffect(() => {
    return () => {
      clearTimeout(timerRef.current); // Clear the timer if component unmounts
    };
  }, []);

  useEffect(() => {
    // console.log(nodeRef.current);
    // Measure the width of the prefix text after the component mounts
    if (prefixRef.current) {
      setPrefixWidth(prefixRef.current.text.length *  0.10 * 1/(level+1)); // Adjust multiplier if needed
    }
  }, [prefix]);

  
  return (
    <group position={position} ref={nodeRef}>
      <Sparkles count={3} scale={0.1} size={10} speed={1} opacity={0.1} color="#43d9ff" />

      <Sphere
        args={[0.45 / (level + 1), 32, 32]}
        position={[0, 0, 0]}
      >
        <Sphere 
          args={[0.1 / (level + 2), 32, 32]} 
          position={[0, 0, 0]} 
          // ref={(mesh) => mesh?.layers.set(raycastableLayer)}
          onClick={(e) => { handleNodeClick(e) }}
          onPointerOver={() => { setIsHovered(true); handleHover(); }} // Set hover state on pointer over
          onPointerOut={() => {setIsHovered(false); handleUnhover(); }}
        >
          <meshStandardMaterial emissive="white" emissiveIntensity={0.1} roughness={0} color={color} />
        </Sphere>
        <meshStandardMaterial color={color} roughness={0} />
        <FakeGlowMaterial glowInternalRadius={30} glowSharpness={0.5} glowColor={color} />
      </Sphere>

      {showIcons && (
        <>
          <sprite onClick={onInformationClick} position={[1 / (level + 1) * 0.2, 1 / (level + 1) * 0.2, 1 / (level + 1) * 0]} scale={[2 / (level + 1) * iconSize, 2 / (level + 1) * iconSize, 1]}>
            <spriteMaterial map={textures.information} />
          </sprite>
          {compoundsCount && <sprite position={[1 / (level + 1) * 0.3, 1 / (level + 1) * 0.1, 0]} scale={[2 / (level + 1) * iconSize, 2 / (level + 1) * iconSize, 1]} onClick={onClick}>
            <spriteMaterial map={textures.face} />
          </sprite>}
          <sprite onClick={handleSpeak} position={[1 / (level + 1) * 0.3, 1 / (level + 1) * -0.05, 0]} scale={[2 / (level + 1) * iconSize, 2 / (level + 1) * iconSize, 1]}>
            <spriteMaterial map={textures.speak} />
          </sprite>
          <sprite onClick={onDelete} position={[1 / (level + 1) * 0.2, 1 / (level + 1) * -0.13, 0]} scale={[2 / (level + 1) * iconSize, 2 / (level + 1) * iconSize, 1]}>
            <spriteMaterial map={textures.delete} />
          </sprite>

          {link && <sprite position={[1 / (level + 1) * 0.07, 1 / (level + 1) * -0.2, 0]} scale={[2 / (level + 1) * iconSize, 2 / (level + 1) * iconSize, 1]} onClick={() => window.open(link, "_blank")}>
            <spriteMaterial color={"white"} map={textures.link} />
          </sprite>}
        </>
      )}

      {/* Conditionally render the Text component based on hover state */}
      {
        prefix &&
      // isHovered && 
      (
        <>
           <>
             {/* Prefix Background Border */}
            <Plane
              position={[prefixXPos, radius * Math.pow(0.7, level), -0.02]} // Behind the prefix text
              args={[
                prefix.length * fontSize * 0.8   + borderThickness, // Width with padding and border
                fontSize + backgroundPadding + borderThickness, // Height with padding and border
              ]}
            >
              <meshStandardMaterial  color="black" />
            </Plane>

            {/* Prefix Black Background */}
            <Plane
              position={[prefixXPos, radius * Math.pow(0.7, level), -0.019]} // Slightly in front of the border
              args={[
                prefix.length * fontSize * 0.8 , // Width based on prefix length
                fontSize + backgroundPadding, // Height
              ]}
            >
              <meshStandardMaterial opacity={0.3} color="white" />
            </Plane>

            {/* Prefix Text */}
            <Text
              ref={prefixRef}
              position={[prefixXPos, radius * Math.pow(0.7, level),  -0.016]}
              fontSize={fontSize}
              color="black"
              anchorX="center"
              anchorY="middle"
              // color="black"
            >
              {prefix}
            </Text>
           {/* Suffix Background */}
          <Plane
            position={[suffixXPos*0.9 * 0.9/(level ==0 ? 0.8 : level+1), radius * Math.pow(0.7, level), -0.02]} // Slight offset to prevent z-fighting
            args={[
              suffix.length * fontSize * 0.8 , // Width based on suffix length
              fontSize + backgroundPadding+borderThickness, // Height
            ]}
          >
            <meshStandardMaterial color="black" />
          </Plane>

          {/* Suffix Text */}
          <Text
            position={[suffixXPos * 1/(level+1), radius * Math.pow(0.7, level), -0.016]}
            fontSize={fontSize}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {suffix}
          </Text>
          </>
        </>
      )}

    {
      !prefix  &&
      // isHovered && 
      (
        <Text position={[0, radius*Math.pow(0.7, level), 0]} fontSize={0.05 * Math.pow(0.7, level)} color="white" anchorX="center" anchorY="middle">
          {name}
        </Text>
      )}

      {showTranslation && translation && (
        <Text position={[0, radius * Math.pow(0.7, level)+0.07, 0]} fontSize={0.04 * Math.pow(0.7, level)} color="white" anchorX="center" anchorY="middle">
          {translation}
        </Text>
      )}
    </group>
  );
};


export const LineBetweenNodes = ({ start, end, isHovered }) => {
  const points = [start, end];
  const color = isHovered ? 'red' : 'white'; // Change color on hover
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p)));

  return (
    <line>
      <bufferGeometry attach="geometry" {...lineGeometry} />
      <lineBasicMaterial color={color} opacity={0.1} />
      {/* <FakeGlowMaterial glowInternalRadius={10} glowSharpness={1} glowColor = {color} /> */}
    </line>
  );
};


export const Sphere1 = ({ position, texture, size, onClick, isSelected, onPointerOver, onPointerOut }) => {
  const sphereRef = useRef(); // Reference for the sphere mesh

  // Rotate the sphere on its axis
  useFrame(() => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.01; // Adjust the speed of rotation here
    }
  });

  return (
    <>
      <mesh
        ref={sphereRef} // Attach the ref to the mesh
        position={position}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial attach="material" map={useLoader(TextureLoader, texture)} />
      </mesh>

      {isSelected && (
        <mesh position={position}>
          <sphereGeometry args={[size * 1.1, 32, 32]} /> {/* Slightly larger sphere */}
          <meshBasicMaterial
            color="white"
            transparent
            opacity={0.5}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </>
  );
};

export const Line = ({ start, end }) => {
  return (
    <DreiLine
      points={[start, end]}  // Start and end points of the line
      color="white"
      lineWidth={2}
    />
  );
};


export const OrbitRing = ({ radius }) => {
  return (
    <Ring args={[radius, radius + 0.1, 32]} rotation={[-Math.PI / 2,0, 0]} >
      <meshStandardMaterial color="white" transparent opacity={0.15} />
    </Ring>
  );
};

export const TextLabel = ({ position, name }) => {
    // console.log(position);
  return (
    <Text
      position={[position[0], position[1] + 1, position[2]]} // Position it above the sphere
      fontSize={0.5} // Adjust font size as needed
      color="white" // Text color
      anchorX="center" // Center the text horizontally
      anchorY="middle" // Center the text vertically
    >
      {name}
    </Text>
  );
};

