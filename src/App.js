import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import './components/DialogBox.css';
// import wordsJson from './words.json';
import AudioControl from './components/AudioControl';
import NodeDialog from './components/NodeDialog';
import NameModal from './components/NameModal';
import CanvasScene from './components/CanvasScene';
import { Node, LineBetweenNodes } from './components/Objects';
import Sidebar from './components/Sidebar'; // Import the new Sidebar component
import { DeleteRounded, FaceRounded, SaveAsRounded, VolumeMuteRounded, VolumeUpRounded } from '@mui/icons-material';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'react-toastify'; // Import toast from react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Import styles for toast
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import TutorialDialog from './components/TutorialDialog';

// ==================== AUTH LOCAL ====================
const registerUser = (username, password) => {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  if (users.find(u => u.username === username)) {
    return { success: false, message: "User already exists" };
  }
  users.push({ username, password, activeNodes: [] });
  localStorage.setItem('users', JSON.stringify(users));
  return { success: true };
};

const loginUser = (username, password) => {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return { success: false, message: "Invalid credentials" };
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("currentUser", username);
  return { success: true };
};

const getCurrentUser = () => {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const username = localStorage.getItem("currentUser");
  return users.find(u => u.username === username);
};

const saveProgressLocal = (activeNodes) => {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const username = localStorage.getItem("currentUser");
  const updatedUsers = users.map(u => u.username === username ? { ...u, activeNodes } : u);
  localStorage.setItem('users', JSON.stringify(updatedUsers));
};

const loadProgressLocal = () => {
  const user = getCurrentUser();
  return user?.activeNodes || [];
};
// ====================================================


// Define initial tutorial steps
const initialTutorialSteps = [
  { action: "clickNode", message: "Click a node to start" },
  { action: "clickIcon", message: "Click the info icon" },
  { action: "addNode", message: "Add a new node" },
  { action: "complete", message: "Tutorial complete!" }
];



const App = () => {

  // console.log(wordsJson.nodes[0]);
  const [activeNodes, setActiveNodes] = useState([]);

  const [compoundListOpen, setCompoundListOpen] = useState(false);
  const [currentCompounds, setCurrentCompounds] = useState([]);
  const [currentParentCompounds, setCurrentParentCompounds] = useState([]);
  
  const [selectedNode, setSelectedNode] = useState(null);
  const [name, setName] = useState('');
  const [isNameModalOpen, setIsNameModalOpen] = useState(!name);
  const [cameraPosition, setCameraPosition] = useState([0, 0, 600]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedNodeForInfo, setSelectedNodeForInfo] = useState(null);
  const [isCameraMoving, setIsCameraMoving] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const [isOrbitActive, setIsOrbitActive] = useState(true);
  const [words, setWords] = useState(null);

  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(true); // Track if the progress is saved
  const [openDialog, setOpenDialog] = useState(false); // State for the dialog visibility

  const targetPosition = [0, 0, 2];

  const [tutorialSteps, setTutorialSteps] = useState([]);
  const [tutorialOn, setTutorialOn] = useState(false);
  const [iconPosition, setIconPosition] = useState([0, 0]); // Icon's position to guide user

  const [firstNodeScreenPosition, setFirstNodeScreenPosition] = useState({ x: 0, y: 0 });

  // useEffect(() => {
  //   if (tutorialOn && firstNodeScreenPosition) {
  //     // console.log("First node screen position:", firstNodeScreenPosition);
  //     // Use this position for the tutorial UI, e.g., position a tooltip or highlight
  //   }
  // }, [firstNodeScreenPosition]);

  // useEffect(()=>{
  //   setTutorialSteps(initialTutorialSteps);
  // },[]);

  useEffect(()=>{
    if(words)
     setActiveNodes([{ ...words.nodes[0], position: [0, 0, 0], level: 0 }])
  },[words])

  // useEffect(() => {
    // Check if tutorial progress is saved in localStorage
    // const savedTutorial = localStorage.getItem('tutorialSteps');
    // if (savedTutorial) {
    //   setTutorialSteps(JSON.parse(savedTutorial));
    // } else {
    //   setTutorialSteps(initialTutorialSteps); // If no progress, start with full tutorial
    // }
  //   showTutorialIcon()
  // },[tutorialSteps, firstNodeScreenPosition]); 

  // const updateTutorialSteps = (actionCompleted) => {
  //   setTutorialSteps(prevSteps => {
  //     const newSteps = prevSteps.filter(step => step.action !== actionCompleted);
  //     localStorage.setItem('tutorialSteps', JSON.stringify(newSteps)); // Save progress
  //     if (newSteps.length === 0) {
  //       setTutorialOn(false); // Tutorial completed
  //     }
  //     return newSteps;
  //   });
  // };

  // const showTutorialIcon = () => {
  //   // console.log(tutorialSteps);
  //   if (tutorialSteps && tutorialSteps.length > 0) {
  //     const currentStep = tutorialSteps[0];
  //     // Set position based on action
  //     switch (currentStep.action) {
  //       case 'clickNode':
  //         setIconPosition([firstNodeScreenPosition.x, firstNodeScreenPosition.y]); // Adjust position accordingly
  //         break;
  //       case 'clickIcon':
  //         setIconPosition([firstNodeScreenPosition.x+200, firstNodeScreenPosition.y-100]);
  //         break;
  //       case 'addNode':
  //         setIconPosition([firstNodeScreenPosition.x+200, firstNodeScreenPosition.y-100]);
  //         break;
  //       default:
  //         setIconPosition([0, 0]); // Reset position if no action
  //     }
  //   }
  //   return null;
  // };


  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await fetch('https://lingoxr.semanticcreation.com/data/nodes');
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        // console.log(data);
        setWords(data);
      } catch (error) {
        console.error("Error loading nodes.json:", error);
      }
    };

    fetchWords();
  }, []);
  
  // const isTutorial = true;
  // Example usage: Call this function to initiate the camera move
  const handleMoveCamera = () => {
    moveCameraToPosition(targetPosition, 3000); // Move to [0, 0, 3] in 3 seconds
  };

  // // Function to move camera to target position over a given duration
  const moveCameraToPosition = (targetPosition, duration = 3000, isTutorial = false, position) => {
    setIsCameraMoving(true); // Start moving

    const framesPerSecond = 60;
    const totalFrames = (duration / 1000) * framesPerSecond;
    let frame = 0;

    const interval = setInterval(() => {
      frame++;
      if (frame >= totalFrames) {
        setCameraPosition(targetPosition);
        setIsCameraMoving(false); // End moving
        // setTutorialOn(true);
        clearInterval(interval);
        return;
      }

      setCameraPosition(prevPosition =>
        prevPosition.map((value, index) => {
          const step = (targetPosition[index] - value) / (totalFrames - frame);
          return value + step;
        })
      );
    }, 1000 / framesPerSecond);
  };

  // Function to move camera to target position over a given duration
  const moveCameraToPositionLinear= (targetPosition, duration = 3000) => {
    setIsCameraMoving(true); // Start moving

    const framesPerSecond = 60;
    const totalFrames = (duration / 1000) * framesPerSecond;
    let frame = 0;

    const interval = setInterval(() => {
      frame++;
      if (frame >= totalFrames) {
        setCameraPosition(targetPosition);
        setIsCameraMoving(false); // End moving
        clearInterval(interval);
        return;
      }

      setCameraPosition(prevPosition =>
        prevPosition.map((value, index) => {
          const step = (targetPosition[index] - value) / (totalFrames - frame);
          return value + step;
        })
      );
    }, 1000 / framesPerSecond);
  };


  const audioRef = useRef(null);
  const audioAddRef = useRef(null);

  const handleInformationClick = (node) => {
    // console.log(node);
    setSelectedNodeForInfo(node);
    setSidebarOpen(true);
  };

  const updateNodeNote = (nodeName, note) => {
    setActiveNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.name === nodeName ? { ...node, notes: note } : node
      )
    );
  };

  const updateNodeLink = (nodeName, link) => {
    setActiveNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.name === nodeName ? { ...node, link: link } : node
      )
    );
  };
  
  useEffect(() => {
      loadProgress();
  }, [name]);

  // Function to play the audio
  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      audioRef.current.volume = 0.2;
    }
  };

  // Function to play the audio
  const playAddAudio = () => {
    if (audioRef.current) {
      audioAddRef.current.play();
      // audioRef.current.volume = 0.2;
    }
  };

  // Function to pause the audio
  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };
  
  const handleNodeClick = (node) => {
    // if(tutorialOn)
    // {
    //   updateTutorialSteps('clickIcon');
    // }
    setCurrentCompounds(node.compounds || []);
    setCurrentParentCompounds(node.parentCompounds || []);
    setSelectedNode(node);
    setCompoundListOpen(true);
  };

  // Array with 30 unique colors
  const colors = [
    '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#33FFA1', 
      '#FF8333', '#33FF83', '#8333FF', '#FF3383', '#83FF33', '#3383FF', 
      '#FFAF33', '#AF33FF', '#33FFAF', '#FF5733', '#5733FF', '#33FF57', 
      '#FF3383', '#83FF33', '#3383FF', '#FFA133', '#A1FF33', '#33A1FF',
      '#FF33FF', '#FF6633', '#33FF66', '#FF3366', '#66FF33', '#3366FF'
  ]

  const [usedColors, setUsedColors] = useState({}); // Initialize usedColors as state

  const handleCompoundSelect = (compound, type, index, isParent) => {
    // alert(isParent);
    if (!selectedNode) return;

    let nodeColor;

    if (isParent) {
        // Assign a unique color for parent compounds
        nodeColor = colors.find(color => !Object.values(usedColors).includes(color));

        if (nodeColor) {
            // Update usedColors state with the new assignment
            setUsedColors(prevUsedColors => ({
                ...prevUsedColors,
                [compound.name]: nodeColor
            }));
        } else {
            console.warn("Ran out of unique colors!");
            nodeColor = '#FFFFFF'; // Fallback color if colors run out
        }
    } else if (selectedNode.level === 0) {
        // Find the first unused color from the colors array
        nodeColor = colors.find(color => !Object.values(usedColors).includes(color));

        if (nodeColor) {
            // Update usedColors state with the new assignment
            setUsedColors(prevUsedColors => ({
                ...prevUsedColors,
                [compound.name]: nodeColor
            }));
        } else {
            console.warn("Ran out of unique colors!");
            nodeColor = '#FFFFFF'; // Fallback color if colors run out
        }
    } else {
        // Inherit the parent's color
        nodeColor = selectedNode.color || '#FFFFFF';
    }

    // Position and angle calculations remain the same
    const siblingsAtLevel = activeNodes.filter(n => n.level === selectedNode.level + 1);
    const angle = (siblingsAtLevel.length) * (2 * Math.PI) / (selectedNode.compounds ? selectedNode.compounds.length + 1 : 1);
    const radius = Math.pow(0.4, (selectedNode.level < 1 ? selectedNode.level : 1) * 1.5);

    let x, y, z;
    if (type === "parent") {
        const angle = (index * (360 / (selectedNode.compounds.length || 1))) * (Math.PI / 180); // Convert degrees to radians
        x = selectedNode.position[0];
        z = selectedNode.position[2] +  radius * (Math.cos(30 * (index+1)));
        y = selectedNode.position[1] + radius * (Math.sin(30 * (index+1)));
    } else {
        x = selectedNode.position[0] + radius * Math.cos(angle) + Math.random() * 0.1;
        z = selectedNode.position[2] + radius * -Math.sin(angle) + Math.random() * 0.1;
        y = selectedNode.position[1] + radius * -Math.sin(angle) * -0.5 + Math.random() * 0.1;
    }

    const newCompoundNode = {
        ...compound,
        position: [x, y, z],
        level: type !== 'parent' ? selectedNode.level + 1 : 2,
        parentPosition: selectedNode.position,
        parent: selectedNode,
        color: nodeColor,
    };

    setActiveNodes(prevNodes => [...prevNodes, newCompoundNode]);
    setCurrentCompounds([]);
    setCompoundListOpen(false);
    setSelectedNode(newCompoundNode);
    playAddAudio();
    zoomToNode([x, y, z]);
    // setIsSaved(false);

    saveProgress(false);
};

  const handlePlaySound = (word) => {
    const utterance = new SpeechSynthesisUtterance(word); // Create a new utterance for the word
    utterance.lang = 'fi-FI'; // Set the language to Finnish
    utterance.volume = 1.0;
    utterance.rate = 0.6;
    // Optional: Choose a specific voice (if desired)
    const voices = window.speechSynthesis.getVoices();
    const finnishVoice = voices.filter(voice => voice.lang === 'fi-FI');
    if (finnishVoice) {
        utterance.voice = finnishVoice[0]; // Set the voice to the Finnish voice
    }
    window.speechSynthesis.speak(utterance);
  };

  const handleDeleteNode = (name) => {
    setActiveNodes((prevNodes) => {return prevNodes.filter(node => node.name !== name)});
  };

  const startVRMovement = () =>{
    setCameraPosition([0,-1.5,1])
    // moveCameraToPositionLinear([0,-1.5,-4], 30000); // Move camera smoothly

  };

  const zoomToNode = (position, node) => {
    if(node) setSelectedNode(node);
    
    const distanceThreshold = 1; // Define a threshold distance for zooming in
  
    // Calculate the current camera position (you'll need to use the actual camera position)
    const currentCameraPosition = cameraPosition; // This should be your current camera position from state
    const distance = Math.sqrt(
      Math.pow(currentCameraPosition[0] - position[0], 2) +
      Math.pow(currentCameraPosition[1] - position[1], 2) +
      Math.pow(currentCameraPosition[2] - position[2], 2)
    );
  
    // Only zoom in if the distance exceeds the threshold
    if (distance > distanceThreshold) {
      const targetPosition = [position[0], position[1], position[2] + 1]; // Adjust the z-value for zooming in
      moveCameraToPosition(targetPosition, 1000, position); // Move camera smoothly
    }

  };

  const createNodes = (nodeData) => {
    return nodeData.map((node,index) => (
      <group key={node.name}>
        <Node 
          compoundsCount={(node.compounds ? node.compounds.length : 0) + (node.parentCompounds ? node.parentCompounds.length : 0)}
          link={node.link}
          name={node.name} 
          suffix={node.suffix} 
          prefix={node.prefix} 
          translation={node.translation} 
          position={node.position} 
          isFirstNode={index === 0} 
          level={node.level} 
          onClick={() => handleNodeClick(node)} 
          color={node.color} 
          onDelete={() => handleDeleteNode(node.name)}
          onInformationClick={() => handleInformationClick(node)}
          zoomToNode={(position, nodeRef) => {
            zoomToNode(position, nodeRef); 
            // if(tutorialOn){
            //   // alert("here");
            //   updateTutorialSteps('clickNode');
            // }
          }}
          key={node.id}
        />
        {node.parentPosition && (
          <LineBetweenNodes start={node.parentPosition} end={node.position} />
        )}
        {!node.parentPosition && (
          <LineBetweenNodes start={[0, 0, 0]} end={node.position} />
        )}
      </group>
    ));
  };

  const onLogin = async (credentials, isRegistering) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
  
    if (isRegistering) {
      // Check if username already exists
      const existingUser = users.find(user => user.username === credentials.username);
      if (existingUser) {
        alert("Username already exists");
        return;
      }
  
      // Create new user
      const newUser = {
        username: credentials.username,
        password: credentials.password,
        activeNodes: []
      };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("username", credentials.username);
      setName(credentials.username);
      setIsNameModalOpen(false);
      playAudio();
      handleMoveCamera();
      return;
    } else {
      // Login logic
      const matchedUser = users.find(
        user =>
          user.username === credentials.username &&
          user.password === credentials.password
      );
      if (!matchedUser) {
        alert("Invalid credentials");
        return;
      }
  
      localStorage.setItem("username", credentials.username);
      setName(credentials.username);
      setIsNameModalOpen(false);
      playAudio();
  
      // Load progress
      if (matchedUser.activeNodes?.length > 0) {
        setActiveNodes(matchedUser.activeNodes);
      }
  
      handleMoveCamera();
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true); // Show the dialog when the delete button is clicked
  };

  const handleCloseDialog = () => {
    setOpenDialog(false); // Close the dialog without resetting
  };

  const resetGame = () => {
    setActiveNodes([{ ...words.nodes[0], position: [0, 0, 0], level: 0 }])
    setOpenDialog(false); // Close the dialog after resetting the game

  }

  const resetView = () => {
    zoomToNode([0,0,2], activeNodes[0]); // Move to [0, 0, 3] in 3 seconds
  }

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Only show the prompt if the progress is not saved
      if (!isSaved) {
        const message = "You have unsaved changes. Are you sure you want to leave?";
        e.returnValue = message; // Standard for most browsers
        return message; // Some browsers require returning the message
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isSaved]);

  const saveProgress = (showSave) => {
    setIsSaveLoading(true);
    const serializableActiveNodes = activeNodes.map(node => ({
      name: node.name,
      prefix: node.prefix,
      suffix: node.suffix,
      translation: node.translation,
      position: node.position,
      level: node.level,
      color: node.color,
      compounds: node.compounds,
      parentCompounds: node.parentCompounds,
      parentPosition: node.parentPosition,
      notes: node.notes,
      link: node.link,
      image: node.image
    }));
  
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const username = localStorage.getItem("username");
    const updatedUsers = users.map(user =>
      user.username === username
        ? { ...user, activeNodes: serializableActiveNodes }
        : user
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  
    setIsSaveLoading(false);
    setIsSaved(true);
    if (showSave) toast.success("Progress saved locally!");
  };


  const loadProgress = () => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const username = localStorage.getItem('currentUser');
    const user = users.find(u => u.username === username);
  
    if (user?.activeNodes?.length > 0) {
      handleMoveCamera(); // same as original
      setActiveNodes(user.activeNodes);
    } else {
      console.error("No saved progress found in localStorage");
    }
  };


  useEffect(() => {
    const storedName = localStorage.getItem('username');
    if (storedName) {
      setName(storedName);
      // playAudio();
      setIsNameModalOpen(false); // Close the modal if name exists in storage
    }
  }, []);


  const handleLogout = () => {
    localStorage.removeItem('username');  // Clear session on logout
    localStorage.removeItem('tutorialCompleted');  // Clear session on logout

    setName('');
    window.location.reload();  // Refresh the page to reset state
  };
  
  // API call to upload image
  const handleUploadImage = async (nodeName, file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(`https://lingoxr.semanticcreation.com/api/nodes/${nodeName}/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setActiveNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.name === nodeName ? { ...node, image:response.data.imageUrl } : node
        )
      );

      return response.data.imageUrl;


      // console.log("Image uploaded:", response.data.imageUrl);
      // Update your state with the image URL if needed
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleSoundButton = () => {
    if(isMusicPlaying){
      pauseAudio();
      setIsMusicPlaying(false);
    }
    else{
      playAudio();
      setIsMusicPlaying(true);
    }
  } 

  useEffect(() => {
    const hasViewedTutorial = localStorage.getItem('tutorialCompleted');
    // alert(hasViewedTutorial);
    if (!hasViewedTutorial) {
      setTutorialOn(true); // Show tutorial only if it hasn’t been viewed
    }
    
  });

  const handleCloseTutorial = () => {
    setTutorialOn(false);
    // Optionally save tutorial state in local storage
    localStorage.setItem('tutorialCompleted', true);
  };
  
  // API call to delete image
  const handleDeleteImage = async (nodeName) => {
    // try {
    //   const response = await axios.delete(`/nodes/${nodeName}/delete-image`);
    //   console.log("Image deleted:", response.data.message);
    //   // Update your state if necessary
    // } catch (error) {
    //   console.error("Error deleting image:", error);
    // }

    setActiveNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.name === nodeName ? { ...node, image:null } : node
      )
    );
  };

  return (
    <>
      {isNameModalOpen && (
        <NameModal 
        setName={setName} 
        setIsNameModalOpen={setIsNameModalOpen} 
        onLogin={onLogin}
      />
 
       
      )}
      
      <Sidebar 
        nodes={activeNodes} 
        handlePlaySound={handlePlaySound} 
        // open={sidebarOpen} 
        selectedNode={selectedNodeForInfo} 
        onOpen = {sidebarOpen}
        onClose={() => setSidebarOpen(false)} 
        onSaveNote={updateNodeNote}
        onSaveLink={updateNodeLink}
        onUploadImage={handleUploadImage}   // Pass the function as prop
        onDeleteImage={handleDeleteImage}
        /> {/* Add Sidebar */}

      <audio ref={audioRef} loop  src={`${process.env.PUBLIC_URL}/audio.mp3`} preload="auto" />
      <audio ref={audioAddRef}  src={`${process.env.PUBLIC_URL}/audio-add.mp3`} preload="auto" />

      {/* <AudioControl 
        src={`${process.env.PUBLIC_URL}/audio.mp3`} 
        onPlay={setPlayAudio} 
        onPause={setPauseAudio} 
      /> */}
      <CanvasScene 
        isOrbitActive={!isCameraMoving}
        setNewCameraPosition={(newPosition)=>{setCameraPosition([newPosition.x,newPosition.y, newPosition.z])}} 
        activeNodes={activeNodes} 
        createNodes={createNodes} 
        cameraPosition={cameraPosition} 
        isCameraMoving={isCameraMoving}  
        selectedNode={selectedNode}
        startVRMovement={startVRMovement}
        setFirstNodeScreenPosition={setFirstNodeScreenPosition}
        />
      
      <NodeDialog
        compoundListOpen={compoundListOpen}
        selectedNode={selectedNode}
        currentCompounds={currentCompounds}
        currentParentCompounds={currentParentCompounds}
        activeNodes={activeNodes}
        handleCompoundSelect={handleCompoundSelect}
        handlePlaySound={handlePlaySound}
        setCompoundListOpen={setCompoundListOpen}
      />
      {name && <div onClick={saveProgress} style={{ position: 'absolute', top: '20px', right: '150px', color: 'white', textAlign:'center' }}>
       
           <div>
            {isSaveLoading ? (
                <CircularProgress size={24} style={{ color: 'white' }} />
              ) : (
                <SaveAsRounded />
              )}
            </div>
        </div>
      }

      {name && <div onClick={handleOpenDialog} style={{ position: 'absolute', top: '20px', right: '100px', color: 'white', textAlign:'center' }}>
          <div><DeleteRounded/>   </div>  
        </div>
      }
      {name && (<div onClick={resetView} className="reset-view-button">
          <div className="reset-view-inner">Reset View</div>
        </div>
      )}
      {name && <div onClick={handleLogout} style={{ position: 'absolute', top: '20px', right: '30px', color: 'white', textAlign:'center' }}><div><FaceRounded/> </div><div>{name}</div></div>}
      <div onClick={handleSoundButton} style={{ position: 'absolute', top: '20px', right: '250px', color: 'white', textAlign:'center' }}><div> { !isMusicPlaying ? <VolumeMuteRounded/>: <VolumeUpRounded/> }</div></div>

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-description"
      >
        <DialogTitle id="confirmation-dialog-title">{"Are you sure you want to reset the game?"}</DialogTitle>
        <DialogContent>
          <p>This action will reset the game and cannot be undone.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={resetGame} color="secondary">
            Reset Game
          </Button>
        </DialogActions>
      </Dialog>
      {name && activeNodes.length <= 1 && <TutorialDialog open={tutorialOn} onClose={handleCloseTutorial} />}
      {/* {tutorialOn && <img src="/tap.png" style={{ width:"50px", zIndex:2000, position: 'absolute', top: iconPosition[1], left: iconPosition[0] }} />} */}
    </>
  );
};

export default App;
