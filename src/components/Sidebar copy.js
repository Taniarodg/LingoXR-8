// components/Sidebar.js
import React, { useState } from 'react';
import { List, ListItem, ListItemText, ListItemIcon, Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'; // Icon for the collapsed state

const Sidebar = ({ nodes, handlePlaySound }) => {
  const [isOpen, setIsOpen] = useState(false); // State to manage sidebar visibility

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      zIndex: 100, 
      left: 0, 
      top: 0, 
      width: isOpen ? '250px' : '0px', // Width of expanded and collapsed sidebar
      height: '100vh', 
      backgroundColor: '#282c34', 
      color: 'white', 
      padding: isOpen ? '20px': '0px', 
      overflowY: 'auto', 
      transition: 'width 0.3s ease' // Smooth transition for width change
    }}>
      {isOpen ? (
        <>
          <Button onClick={toggleSidebar} style={{ color: 'white', marginBottom: '20px' }}>
            <ExpandLessIcon />
          </Button>
          <h2>LingoXR</h2>
          <List>
            {nodes.map((node) => (
              <ListItem key={node.name} style={{ cursor: 'pointer' }}>
                <ListItemIcon>
                  <Button onClick={() => handlePlaySound(node.name)} style={{ color: 'white' }}>
                    <PlayArrowIcon />
                  </Button>
                </ListItemIcon>
                <ListItemText primary={node.name + " ("+node.translation+")"}  />
              </ListItem>
            ))}
          </List>
        </>
      ) : (
        <div style={{
            display:'flex',
            position: 'fixed',
            alignItems: 'center',
            justifyContent: 'center',
            width: '50px',
            height: '50px',
            margin:'20px',
            backgroundColor: '#1f1f1f', // Darker color for the collapsed state
            borderRadius: '5px',
            cursor: 'pointer'
        }} onClick={toggleSidebar}>
          <UnfoldMoreIcon style={{ color: 'white' }} />
        </div>
      )}
    </div>
  );
};

export default Sidebar;
