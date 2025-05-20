import React, { useState, useEffect } from 'react';
import { useRef, useMemo } from 'react';

import { useFrame, useLoader } from '@react-three/fiber';
import { Line as DreiLine, Plane, Sparkles } from '@react-three/drei';
import { TextureLoader } from 'three';
import { Ring } from '@react-three/drei';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import {  Sphere } from '@react-three/drei';
import FakeGlowMaterial from './FakeGlowMaterial';
import { createIconTexture } from '../utils/createIconTexture';

export const Node = ({ name, translation, suffix, prefix, position, level, onClick, color, compoundsCount, onDelete, onInformationClick, zoomToNode, link }) => {
  const [showIcons, setShowIcons] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const fadeDuration = 0.05;
  const [prefixWidth, setPrefixWidth] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const nodeRef = useRef();
  let timerRef = useRef(null);
  const prefixRef = useRef();

  const radius = 0.2 * Math.pow(1, level);
  const iconSize = 0.05;
  const prefixXPos = -0.05;
  const fontSize = 0.04 * Math.pow(0.7, level);
  const suffixXPos = prefixWidth / 2 * 0.5 *(level/2+1);

  useFrame(() => {
    if (showIcons && opacity < 1) {
      setOpacity((prev) => Math.min(prev + fadeDuration, 1));
    }
  });

  const handleHover = () => setShowTranslation(true);
  const handleUnhover = () => setShowTranslation(false);

  const handleNodeClick = (e) => {
    e.stopPropagation();
    zoomToNode(position, nodeRef.current);
    if (showIcons) {
      setShowIcons(false);
      setOpacity(0);
      clearTimeout(timerRef.current);
      const fadeOutInterval = setInterval(() => {
        setOpacity((prev) => {
          if (prev <= 0) {
            clearInterval(fadeOutInterval);
            setShowIcons(false);
            return 0;
          }
          return prev - fadeDuration;
        });
      }, 5);
    } else {
      setShowIcons(true);
      setOpacity(0);
      timerRef.current = setTimeout(() => setShowIcons(false), 5000);
    }
  };

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

  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(name);
    utterance.lang = 'fi-FI';
    utterance.volume = 1.0;
    utterance.rate = 0.6;
    const voices = window.speechSynthesis.getVoices();
    const finnishVoice = voices.find(voice => voice.lang === 'fi-FI');
    if (finnishVoice) utterance.voice = finnishVoice;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (prefixRef.current) {
      setPrefixWidth(prefixRef.current.text.length *  0.10 * 1/(level+1));
    }
  }, [prefix]);

  return (
    <group position={position} ref={nodeRef}>
      <Sparkles count={3} scale={0.1} size={10} speed={1} opacity={0.1} color="#43d9ff" />

      <Sphere args={[0.45 / (level + 1), 32, 32]} position={[0, 0, 0]}>
        <Sphere
          args={[0.1 / (level + 2), 32, 32]}
          position={[0, 0, 0]}
          onClick={handleNodeClick}
          onPointerOver={() => { setIsHovered(true); handleHover(); }}
          onPointerOut={() => { setIsHovered(false); handleUnhover(); }}
        >
          <meshStandardMaterial emissive="white" emissiveIntensity={0.1} roughness={0} color={color} />
        </Sphere>
        <meshStandardMaterial color={color} roughness={0} />
        <FakeGlowMaterial glowInternalRadius={30} glowSharpness={0.5} glowColor={color} />
      </Sphere>

      {showIcons && (
        <>
          <sprite onClick={onInformationClick} position={[0.2 / (level + 1), 0.2 / (level + 1), 0]} scale={[iconSize, iconSize, 1]}>
            <spriteMaterial map={textures.information} />
          </sprite>
          {compoundsCount && (
            <sprite position={[0.3 / (level + 1), 0.1 / (level + 1), 0]} scale={[iconSize, iconSize, 1]} onClick={onClick}>
              <spriteMaterial map={textures.face} />
            </sprite>
          )}
          <sprite onClick={handleSpeak} position={[0.3 / (level + 1), -0.05 / (level + 1), 0]} scale={[iconSize, iconSize, 1]}>
            <spriteMaterial map={textures.speak} />
          </sprite>
          <sprite onClick={onDelete} position={[0.2 / (level + 1), -0.13 / (level + 1), 0]} scale={[iconSize, iconSize, 1]}>
            <spriteMaterial map={textures.delete} />
          </sprite>
          {link && (
            <sprite position={[0.07 / (level + 1), -0.2 / (level + 1), 0]} scale={[iconSize, iconSize, 1]} onClick={() => window.open(link, '_blank')}>
              <spriteMaterial color="white" map={textures.link} />
            </sprite>
          )}
        </>
      )}

      {prefix && suffix ? (
        <>
          <Text
            ref={prefixRef}
            position={[-0.03, radius, -0.016]}
            fontSize={fontSize}
            color="yellow"
            anchorX="center"
            anchorY="middle"
          >
            {prefix}
          </Text>
          <Text
            position={[0.04, radius, -0.016]}
            fontSize={fontSize}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {suffix}
          </Text>
        </>
      ) : (
        <Text
          position={[0, radius, 0]}
          fontSize={fontSize}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
      )}

      {showTranslation && translation && (
        <Text position={[0, radius + 0.07, 0]} fontSize={0.04 * Math.pow(0.7, level)} color="white" anchorX="center" anchorY="middle">
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

