import React, { useEffect, useState } from 'react';
import './DialogBox.css';

const DialogBox = ({ word, connectedPlanets, onClose, onAddStar, onWordSelect }) => {
  const [words, setWords] = useState([]);
  const [showWordList, setShowWordList] = useState(false);

  useEffect(() => {
    // Fetch words from JSON when the dialog is opened
    fetch('/words.json')
      .then(response => response.json())
      .then(data => {
        setWords(data.words);
      })
      .catch(error => console.error('Error fetching words:', error));
  }, []);

  const handleAddImage = () => {
    console.log('Add Image for:', word);
    // Add logic to handle image upload
  };

  const handlePlaySound = () => {
    const utterance = new SpeechSynthesisUtterance(word); // Create a new utterance for the word
    window.speechSynthesis.speak(utterance); // Speak the word
  };

  const handleAddStar = (e) => {
    e.preventDefault();
    onAddStar(word); // Call the add star function
    setShowWordList(true); // Show the word list modal
  };

  const handleWordSelect = (selectedWord) => {
    onWordSelect(selectedWord); // Set the new planet name
    setShowWordList(false); // Close the list after selecting the word
  };

  return (
    <div className="dialog-box">
      <h2>{word}</h2>

      {connectedPlanets.length > 0 && (
        <div>
          <h4>Connected Planets:</h4>
          <ul>
            {connectedPlanets.map((planet, index) => (
              <li key={index}>{planet}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Grid Row 1: Image, Video Link, and Text to Speech */}
      <div className="grid-row" style={{marginBottom:'30px'}}>
        <div className="grid-item" style={{background: "url('/placeholder.jpg') no-repeat center/cover"}}>
          <div className="grid-label">Image</div>
        </div>
        <div className="grid-item" style={{background: "url('/video-placeholder.jpg') no-repeat center/cover"}}>
          <div className="grid-label">Video Link</div>
        </div>
        <div 
          className="grid-item" 
          style={{background: "url('/sound-placeholder.png') no-repeat center/cover"}} 
          onClick={handlePlaySound} // Add click event for Play Sound
        >
          <div className="grid-label">Play Sound</div>
        </div>
      </div>
      <hr />
      {/* Grid Row 2: Add Star */}
      <div className="grid-row" style={{marginTop:'30px'}}>
        <div onClick={handleAddStar} className="grid-item" style={{background: "url('/planet-placeholder.png') no-repeat center/cover"}}>
          <div className="grid-label">Add Star</div>
        </div>
      </div>

      <div className="footer">
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default DialogBox;
