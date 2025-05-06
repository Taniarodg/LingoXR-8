import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Sphere, Line, OrbitRing, TextLabel } from './components/Objects';
import DialogBox from './components/DialogBox';
import Skybox from './components/Skybox';
import CameraMovement from './components/CameraMovement';
import CurvedLine from './components/CurvedLine';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, Dialog } from '@mui/material';
import { VRButton, ARButton, XR, Controllers, Hands } from '@react-three/xr';
import wordsData from './words1.json'; // Ensure the correct path based on your setup

const planetTextures = [
  { name: 'Earth', texture: '/textures/earth.jpg' },
  { name: 'Mars', texture: '/textures/mars.jpg' },
  { name: 'Jupiter', texture: '/textures/jupiter.jpg' },
  { name: 'Mercury', texture: '/textures/mercury.jpg' },
  { name: 'Neptune', texture: '/textures/neptune.jpg' },
  { name: 'Saturn', texture: '/textures/saturn.jpg' },
  { name: 'Uranus', texture: '/textures/uranus.jpg' },
  { name: 'Venus', texture: '/textures/venus.jpg' },
];

function App() {
  const [name, setName] = useState(''); // State for the name
  const [isNameModalOpen, setIsNameModalOpen] = useState(true); // State for the name modal
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedPlanetId, setSelectedPlanetId] = useState(null);
  const [planets, setPlanets] = useState([
    { id: 1, name: 'Start', position: [0, 0, 0], color: 'yellow', size: 0.5, texture: '/textures/sun.jpg', connectedTo: [] },
  ]);

  const [isMoving, setIsMoving] = useState(false);
  const [targetPlanet, setTargetPlanet] = useState(null);
  const cameraRef = useRef();

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchableWord, setSearchableWord] = useState('');
  const [wordsList, setWordsList] = useState([]);
  const [compoundWords, setCompoundWords] = useState([]);

  const [hoveredPlanetId, setHoveredPlanetId] = useState(null);

  const handleSphereClick = (clickedWord) => {
    // Find the clicked word and its compounds
    const wordData = wordsList.find(wordItem => wordItem.word === clickedWord);
  
    if (wordData && wordData.compounds && wordData.compounds.length > 0) {
      // Set the compounds to display them in the modal
      setCompoundWords(wordData.compounds);
    } else {
      // If no compounds, clear the list or show a message
      setCompoundWords([]);
    }
  
    // Open the modal to show the compounds
    setShowSearchModal(true);
  };

  const handleWordSelect = (newWord) => {
    setPlanets((prevPlanets) =>
      prevPlanets.map((planet) =>
        planet.name === selectedWord ? { ...planet, name: newWord } : planet
      )
    );
    setSelectedWord(null);
  };

  const addNewPlanet = (selectedWord) => {
    const existingPlanet = planets.find((p) => p.name === selectedWord);
    const currentPlanet = planets.find((p) => p.id === selectedPlanetId);

    if (existingPlanet) {
      // If the planet already exists, add the current planet ID to its connections if not already present
      if (!existingPlanet.connectedTo.includes(currentPlanet.id)) {
        existingPlanet.connectedTo.push(currentPlanet.id);
        setPlanets([...planets]); // Update planets to trigger re-render
      }

      setSelectedPlanetId(existingPlanet.id); // Set the existing planet as selected
    } else {
      // If the planet does not exist, create a new one
      const newId = planets.length + 1;
      const newOrbitRadius = newId * 2; // Increment the radius for each new planet
      const basePlanet = planets.find((p) => p.id === selectedPlanetId);

      let newPosition;

      if (newId === 2) {
        // For the first new planet, position it directly outward from the base planet
        newPosition = [
          basePlanet.position[0] + (newOrbitRadius * Math.cos(0)), // x
          0, // y (flat plane)
          basePlanet.position[2] + (newOrbitRadius * Math.sin(0)), // z
        ];
      } else {
        // For subsequent planets, calculate angle based on number of existing planets
        const angleIncrement = (2 * Math.PI) / newId; // Divide 360 degrees by number of planets
        const angle = angleIncrement * (planets.filter(p => p.connectedTo.includes(basePlanet.id)).length); // Find the current angle for the new planet

        newPosition = [
          newOrbitRadius * Math.cos(angle),
          0,
          newOrbitRadius * Math.sin(angle),
        ];
      }

      const randomTexture = planetTextures[Math.floor(Math.random() * planetTextures.length)];

      const newPlanet = {
        id: newId,
        name: selectedWord, // Use the selected word as the name
        position: newPosition,
        color: 'red',
        size: 0.5,
        connectedTo: [basePlanet.id], // Initialize with an array for connections
        texture: randomTexture.texture,
      };

      setPlanets([...planets, newPlanet]);
      setSelectedPlanetId(newPlanet.id); // Set the new planet as selected

      // Close the dialog and move towards the new planet
      setIsMoving(true);
      setTargetPlanet(newPlanet);
    }
  };

  const handleAddStar = () => {
    // if (name) {
      setShowSearchModal(true);
    // } else {
    //   alert('Please enter a name first.');
    // }
  };

  const handleWordChange = (selectedWord) => {
    // Find the selected word in the nodes list
    console.log(selectedWord);
    console.log(wordsData.nodes[0].compounds);
    const selectedNode = wordsData.nodes[0].compounds.find(item => item.name === selectedWord);
    console.log(selectedNode);
    if (selectedNode && selectedNode.compounds.length > 0) {
      // If the word has compounds, update wordsList with its compounds
      const compoundWords = selectedNode.compounds.map(compound => ({
        word: compound.name,
        translation: compound.translation
      }));
  
      setWordsList(compoundWords);
    } else {
      // If no compounds found, reset the word list or keep as is
      setWordsList([]);
    }
  };

  const handleSelectWord = (selectedWord) => {
    handleWordChange(selectedWord);
    setSelectedWord(null);
    addNewPlanet(selectedWord);
    setShowSearchModal(false);
    setSearchableWord('');
  };

  const handleSearch = (event) => {
    setSearchableWord(event.target.value);
  };

  // Fetch and process words
  useEffect(() => {
    const processWords = (nodes) => {
      const flattenWords = (nodeList) => {
        let allWords = [];
        nodeList.forEach(node => {
          allWords.push({ word: node.name, translation: node.translation });
          if (node.compounds && node.compounds.length > 0) {
            allWords = allWords.concat(flattenWords(node.compounds));
          }
        });
        return allWords;
      };

      const processedWords = flattenWords(nodes);
      setWordsList(processedWords);
    };

    processWords(wordsData.nodes);
  }, []);

  return (
    <>
      {isNameModalOpen && (
        <div className="name-modal">
          <h2 className='header'>LingoXR</h2>
          <h2>Enter Your Name</h2>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Your name" 
          /><br></br><br></br>
          <button className='name-submit' onClick={() => setIsNameModalOpen(false)}>Submit</button>
        </div>
      )}
      <Canvas style={{ height: '100vh', background: 'black' }}>
        <XR>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} />
        <Skybox />
        <PerspectiveCamera ref={cameraRef} position={[0, 10, 20]} makeDefault />
        {Array.from({ length: 10 }, (_, index) => (
          <OrbitRing key={index} radius={(index + 1) * 2} />
        ))}
        {planets.map((planet) => (
          <React.Fragment key={planet.id}>
            <Sphere
              position={planet.position}
              color={planet.color}
              size={planet.size}
              texture={planet.texture}
              onPointerOver={() => { setHoveredPlanetId(planet.id)}} // Set hovered planet
              onPointerOut={() => setHoveredPlanetId(null)} // Clear hover when pointer leaves
              onClick={() => handleSphereClick(planet.name, planet.id)}
              isSelected={selectedWord === planet.name}
            />
            <TextLabel position={planet.position} name={planet.name} />
          </React.Fragment>
        ))}
        {planets.map((planet) =>
          planet.connectedTo ? (
            planet.connectedTo.map((connectedId) => (
              <CurvedLine
                key={`line-${planet.id}-${connectedId}`}
                start={planets.find(p => p.id === connectedId).position}
                end={planet.position}
                isHighlighted={hoveredPlanetId === planet.id || hoveredPlanetId === connectedId} // Highlight line if connected to hovered planet
              />
            ))
          ) : null
        )}

        <OrbitControls />
        <CameraMovement 
          isMoving={isMoving} 
          targetPlanet={targetPlanet} 
          cameraRef={cameraRef} 
          setIsMoving={setIsMoving} 
          setSelectedWord={setSelectedWord} 
        />
      </XR>
      </Canvas>

      <VRButton /> {/* Add VR button to enter VR mode */}


      {selectedWord && (
        <DialogBox
          word={selectedWord}
          connectedPlanets={planets.find(p => p.name === selectedWord).connectedTo.map(id => planets.find(p => p.id === id).name)} 
          onClose={() => setSelectedWord(null)}
          onAddStar={handleAddStar}
          onWordSelect={handleWordSelect}
        />
      )}

      {showSearchModal && (
        <Dialog open={showSearchModal} onClose={() => setShowSearchModal(false)}>
          <div style={{ padding: '20px', width:'400px' }}>
            <h2>Select a Word</h2>
            <TextField
              style={{ width: '100%', marginBottom: '20px' }}
              variant="outlined"
              value={searchableWord}
              onChange={handleSearch}
              placeholder="Search words..."
            />

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Finnish</TableCell>
                    <TableCell align="center">English</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {compoundWords.length > 0
                    ? compoundWords.map((compound, index) => (
                        <TableRow key={index} onClick={() => handleSelectWord(compound.name)} style={{ cursor: 'pointer' }}>
                          <TableCell align="center">{compound.name}</TableCell>
                          <TableCell align="center">{compound.translation}</TableCell>
                        </TableRow>
                      ))
                    : wordsList
                        .filter(wordItem => wordItem.word.toLowerCase().includes(searchableWord.toLowerCase()))
                        .map((wordItem, index) => (
                          <TableRow key={index} onClick={() => handleSelectWord(wordItem.word)} style={{ cursor: 'pointer' }}>
                            <TableCell align="center">{wordItem.word}</TableCell>
                            <TableCell align="center">{wordItem.translation}</TableCell>
                          </TableRow>
                        ))
                  }

                </TableBody>
              </Table>
            </TableContainer>

            <Button onClick={() => setShowSearchModal(false)} variant="contained" color="primary" style={{ marginTop: '20px' }}>
              Close
            </Button>
          </div>
        </Dialog>
      )}

      {/* Display the entered name on the top left */}
      {name && <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'white' }}>Hi {name}</div>}
    </>
  );
}

export default App;
