import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';

const NodeDialog = ({ 
  compoundListOpen, 
  selectedNode, 
  currentParentCompounds, 
  currentCompounds, 
  activeNodes, 
  handleParentCompoundSelect, 
  handleCompoundSelect, 
  handlePlaySound, 
  setCompoundListOpen 
}) => {
  return (
    <Dialog
      open={compoundListOpen}
      onClose={() => setCompoundListOpen(false)}
      // PaperProps={{
      //   style: {
      //     backgroundImage: "url('/bg.png')",
      //     backgroundSize: 'cover',
      //     backgroundPosition: 'center',
      //     color: 'white', // Ensure text is visible on the background
      //   },
      // }}
    >
      <DialogTitle style={{textAlign:"center"}}>{selectedNode?.name} ({selectedNode?.translation})</DialogTitle>
      <DialogContent>
        <div style={{ boxShadow: "0px 0px 0px white !important", padding: '10px', border: "0px" }}>
          <Box display="grid" sx={{
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)', // Single column for extra small screens (portrait phones)
                sm: 'repeat(3, 1fr)', // Two columns for small screens
                md: 'repeat(3, 1fr)', // Three columns for medium and larger screens
              },
            }} gap={2}>
            {currentCompounds.map((compound) => {
              const isCompoundExisting = activeNodes.some(node => node.name === compound.name);

              return (
                <Box
                  key={compound.name}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  padding={1}
                  style={{ backgroundColor: isCompoundExisting ? '#f0f0f0' : 'transparent', borderRadius: '8px' }}
                >
                  <Typography variant="body1" align="center">{compound.name}</Typography>
                  <Typography variant="caption" align="center" style={{ fontSize: '12px' }}>({compound.translation})</Typography>
                  
                  <Box display="flex" gap={1} mt={1}>
                    <Button 
                      style={{ color: 'white', filter: isCompoundExisting ? 'grayscale(100%)' : 'grayscale(0%)' }}
                      onClick={() => handlePlaySound(compound.name)}>
                      <img src="/icons/play.png" style={{ width: "50px" }} />
                    </Button>
                    <Button
                      style={{ color: 'white', filter: isCompoundExisting ? 'grayscale(100%)' : 'grayscale(0%)' }}
                      disabled={isCompoundExisting}
                      onClick={!isCompoundExisting ? () => handleCompoundSelect(compound, 'child') : null}
                    >
                      <img src="/icons/plus.png" style={{ width: "50px" }} />
                    </Button>
                  </Box>
                </Box>
              );
            })}

            {currentParentCompounds.map((compound, index) => {
              const isCompoundExisting = activeNodes.some(node => node.name === compound.name);

              return (
                <Box
                  key={compound.name}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  padding={1}
                  style={{ backgroundColor: isCompoundExisting ? '#f0f0f0' : 'transparent', borderRadius: '8px' }}
                >
                  <Typography variant="body1" align="center">{compound.name}</Typography>
                  <Typography variant="caption" align="center" style={{ fontSize: '12px' }}>({compound.translation})</Typography>
                  
                  <Box display="flex" gap={1} mt={1}>
                    <Button 
                      style={{ filter: isCompoundExisting ? 'grayscale(100%)' : 'grayscale(0%)' }}
                      onClick={() => handlePlaySound(compound.name)}>
                      <img src="/icons/play.png" style={{ width: "50px" }} />
                    </Button>
                    <Button
                      style={{ color: 'white', filter: isCompoundExisting ? 'grayscale(100%)' : 'grayscale(0%)' }}
                      disabled={isCompoundExisting}
                      onClick={!isCompoundExisting ? () => handleCompoundSelect(compound, "parent", index, true) : null}
                    >
                      <img src="/icons/plus.png" style={{ width: "50px" }} />
                    </Button>
                  </Box>
                </Box>
              );
            })}
          </Box>

        </div>
        <Button style={{position:"absolute", right:"0px", top:"0px"}} onClick={() => setCompoundListOpen(false)}><img src="/icons/remove.png" style={{width:"50px"}} /></Button>

      </DialogContent>
    </Dialog> 
  );
};

export default NodeDialog;
