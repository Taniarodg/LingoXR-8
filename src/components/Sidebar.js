import React, { useState, useEffect, useRef } from 'react';
import { Button, Typography, Card, CardContent, TextField } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { ArrowBackIosNewRounded, BackHand, ExpandMoreOutlined, ExpandMoreRounded } from '@mui/icons-material';

const Sidebar = ({ nodes, handlePlaySound, open, selectedNode, onClose, onSaveNote, onSaveLink, onUploadImage, onDeleteImage, onOpen }) => {
  const [isOpen, setIsOpen] = useState(open);
  const [note, setNote] = useState('');
  const [link, setLink] = useState('');
  const [image, setImage] = useState(null);

  const sidebarRef = useRef(null);

  useEffect(() => {
    if (selectedNode) {
      setNote(selectedNode.notes || '');
      setLink(selectedNode.link || '');
      setImage(selectedNode.image || null);
    }

    if (onOpen) {
      setIsOpen(true);
    }
  }, [selectedNode, onOpen]);

  useEffect(() => {
    if (selectedNode && note !== selectedNode.notes) {
      onSaveNote && onSaveNote(selectedNode.name, note);
    }
  }, [note, onSaveNote, selectedNode]);

  useEffect(() => {
    if (selectedNode && link !== selectedNode.link) {
      onSaveLink && onSaveLink(selectedNode.name, link);
    }
  }, [link, onSaveLink, selectedNode]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUploadImage(selectedNode.name, file)
        .then((uploadedImageUrl) => { setImage(uploadedImageUrl); })
        .catch(error => console.error("Image upload failed", error));
    }
  };

  const handleImageDelete = () => {
    onDeleteImage(selectedNode.name)
      .then(() => setImage(null))
      .catch(error => console.error("Image deletion failed", error));
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div ref={sidebarRef} style={{
      position: 'fixed', zIndex: 100, left: 0, top: 0,
      width: isOpen ? '300px' : '0px', height: '100vh',
      backgroundColor: '#2C3E50', color: 'white', padding: isOpen ? '20px' : '0px',
      overflowY: 'auto', transition: 'width 0.3s ease', boxShadow: isOpen ? '2px 0px 5px rgba(0,0,0,0.2)' : 'none'
    }}>
      {isOpen ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'left', alignItems: 'left' }}>
            <Button onClick={toggleSidebar} style={{ color: 'white' }}>
              <ArrowBackIosNewRounded/>
            </Button>
            <Typography variant="h5" style={{ margin: 0, color: '#ECF0F1' }}>LingoXR</Typography>
          </div>
          
          {selectedNode && (
            <>
              <Typography variant="h6" style={{ textAlign:'center', marginTop: '20px', color: '#ECF0F1' }}>
                {selectedNode.name}
              </Typography>
              <Typography variant="body2" style={{textAlign:'center',  color: '#ECF0F1'}} color="textSecondary">
                {selectedNode.translation}
              </Typography>
              
              <div style={{ backgroundColor: '#2C3E50', border:"0px", boxShadow:"0px", marginTop: '20px', padding: '10px', color: 'white', textAlign: 'center' }}>
                {/* <CardContent> */}
                  {image ? (
                    <>
                      <img 
                        src={"https://lingoxr.semanticcreation.com" + image}
                        alt="Node" style={{ width: '100px', height: '100px', cursor: 'pointer', borderRadius: '5px' }}
                      /><br></br>
                      <Button onClick={handleImageDelete} variant="outlined" style={{ borderColor:"white", color:"white", marginTop: '10px' }}>
                        Delete Image
                      </Button>
                    </>
                  ) : (
                    <>
                      <label htmlFor="upload-button" style={{ display: 'block', marginBottom: '10px', color: '#ECF0F1' }}>
                        <img 
                          src="https://placehold.co/100x100" alt="Upload Placeholder"
                          style={{ width: '100px', cursor: 'pointer', borderRadius: '5px' }}
                        />
                      </label>
                      <input id="upload-button" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                      {/* <Button htmlFor="upload-button" variant="outlined" style={{ borderColor:"white", color:"white", }}>
                        Upload Image
                      </Button> */}
                    </>
                  )}
                {/* </CardContent> */}
              </div>

              <Card style={{ backgroundColor: '#34495E', marginTop: '20px', padding: '10px', color: 'white' }}>
                <CardContent>
                  <TextField
                    label="Notes"
                    multiline
                    rows={1}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    variant="filled"
                    style={{ width: '100%', backgroundColor: '#2C3E50', borderRadius: '5px' }}
                    InputProps={{ style: { color: 'white' } }}
                    InputLabelProps={{
                      style: { color: 'white' }, // Optional: to change the label color
                    }}
                    sx={{
                      '& .MuiInputBase-input::placeholder': {
                        color: 'white', // Placeholder text color
                      },
                    }}
                  />
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: '#34495E', marginTop: '20px', padding: '10px', color: 'white' }}>
                <CardContent>
                  <TextField
                    label="Link"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    variant="filled"
                    style={{ width: '100%', backgroundColor: '#2C3E50', borderRadius: '5px' }}
                    InputLabelProps={{
                      style: { color: 'white' }, // Optional: to change the label color
                    }}
                    InputProps={{ style: { color: 'white' } }}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </>
      ) : (
        <Button onClick={toggleSidebar} style={{color: 'white', position:'fixed', top:20, left:20 }}>
          <ExpandMoreRounded/>
        </Button>
      )}
    </div>
  );
};

export default Sidebar;
