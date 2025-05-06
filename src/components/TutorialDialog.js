import React, { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import {
  Button,
  Dialog,
  DialogContent,
  Typography,
  DialogTitle,
  Stack,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import './TutorialDialog.css';

const TutorialDialog = ({ open, onClose }) => {
  const [index, setIndex] = useState(0);
  const swiperRef = useRef();
  const autoplayRef = useRef();

  const slides = [
    { image: '/logo2.jpg', text: 'Welcome to LingoXR' },
    { image: '/tutorial/1.png', text: 'Click on a node to open menu.' },
    { image: '/tutorial/2.png', text: 'Select the + icon to open the list of words.' },
    { image: '/tutorial/3.png', text: 'Select the word you want to add.' },
    { image: '/tutorial/4.png', text: 'Start learning now!' },
  ];

  const handleClose = () => {
    setIndex(0);
    swiperRef.current?.slideTo(0);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        style: {
          borderRadius: '8px',
          backgroundColor: "transparent",
        },
      }}
    >
      <DialogTitle
        style={{
          textAlign: "center",
          color: "white",
          letterSpacing: "2px",
          backgroundColor: "#050b12",
          position: 'relative',
        }}
      >
        <b>TUTORIAL</b>
        {/* Skip button */}
        <IconButton
          onClick={handleClose}
          style={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
          aria-label="skip tutorial"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent style={{ padding: 0 }}>
        <div
          className="tutorial-container"
          onMouseEnter={() => autoplayRef.current?.stop()}
          onMouseLeave={() => autoplayRef.current?.start()}
        >
          <Swiper
            modules={[Autoplay, EffectFade]}
            onSlideChange={(swiper) => setIndex(swiper.activeIndex)}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              autoplayRef.current = swiper.autoplay;
            }}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            autoplay={{ delay: 8000, disableOnInteraction: false }}
            allowTouchMove={false}
            style={{ height: '100%' }}
          >
            {slides.map((slide, i) => (
              <SwiperSlide key={i}>
                <div className="tutorial-slide">
                  <div className="left-column">
                    <img src={slide.image} alt={`Slide ${i + 1}`} className="tutorial-image" />
                  </div>
                  <div className="right-column">
                    <Typography className="tutorial-text">{slide.text}</Typography>
                    <Typography className="step-indicator">Step {index + 1} of {slides.length}</Typography>

                    <div className="button-container">
                      <Stack direction="row" spacing={2}>
                        {i > 0 && (
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => {
                              setIndex(i - 1);
                              swiperRef.current?.slideTo(i - 1);
                            }}
                          >
                            Back
                          </Button>
                        )}
                        {i === slides.length - 1 ? (
                          <Button onClick={handleClose} variant="contained" color="primary">
                            Start LingoXR
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                              setIndex(i + 1);
                              swiperRef.current?.slideTo(i + 1);
                            }}
                          >
                            Next
                          </Button>
                        )}
                      </Stack>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TutorialDialog;
