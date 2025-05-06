// components/AudioControl.js
import React, { useRef, useEffect } from 'react';

const AudioControl = ({ src, onPlay, onPause }) => {
  const audioRef = useRef(null);

  const playAudio = () => {
    // console.log(onPlay);
    if (audioRef.current) {
      audioRef.current.play();
      audioRef.current.volume = 0.2;
      if (onPlay) onPlay();
    }
  };
 
  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      if (onPause) onPause();
    }
  };

  useEffect(() => {
    // console.log(onPlay, onPause);
    if (onPlay && onPause) {
      onPlay(playAudio); // Passing playAudio function to parent
      onPause(pauseAudio); // Passing pauseAudio function to parent
    }
  }, [onPlay, onPause]);

  return (
    <>
      <audio ref={audioRef} src={src} preload="auto" />
    </>
  );
};

export default AudioControl;
