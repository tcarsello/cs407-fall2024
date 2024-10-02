import { useState, useEffect, useRef } from 'react'
import { FlashcardContainer, FlashcardContent } from '../../../styles/FlashcardStyles';

import { TextField, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight, Flip, Fullscreen, FullscreenExit } from '@mui/icons-material';



const FlashcardView = ({ terms }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const flashcardRef = useRef(null);


    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % terms.length);
        }, 300);
    };

    const handlePrevious = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + terms.length) % terms.length);
        }, 300);
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            flashcardRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
    }, []);

    if (!terms || terms.length === 0) {
        return (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '250px',
              width: '100%',
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="h6">No flashcards available.</Typography>
          </Box>
        );
      }

    return (
        <Box 
            ref={flashcardRef}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: isFullScreen ? '100vh' : 'auto',
                width: '100%',
                bgcolor: 'background.paper',
            }}
        >
            <FlashcardContainer 
                onClick={handleFlip} 
                sx={{ 
                    width: isFullScreen ? '80vw' : '400px', 
                    height: isFullScreen ? '60vh' : '250px',
                    transition: 'transform 0.3s ease-in-out',
                    transform: `rotateY(${isFlipped ? '180deg' : '0deg'})`,
                    transformStyle: 'preserve-3d'
                }}
            >
                <FlashcardContent
                    sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        transition: 'opacity 0.15s ease-in-out',
                        opacity: isTransitioning ? 0 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: 'rotateY(0deg)',
                    }}
                >
                    <Typography variant={isFullScreen ? "h3" : "h5"}>{terms[currentIndex].termName}</Typography>
                </FlashcardContent>
                <FlashcardContent
                    sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        transition: 'opacity 0.15s ease-in-out',
                        opacity: isTransitioning ? 0 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: 'rotateY(180deg)',
                    }}
                >
                    <Typography variant={isFullScreen ? "h4" : "body1"}>{terms[currentIndex].termDefinition}</Typography>
                </FlashcardContent>
            </FlashcardContainer>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                <IconButton onClick={handlePrevious} color="primary" disabled={isTransitioning}>
                    <ChevronLeft />
                </IconButton>
                <IconButton onClick={handleFlip} color="primary" disabled={isTransitioning}>
                    <Flip />
                </IconButton>
                <IconButton onClick={handleNext} color="primary" disabled={isTransitioning}>
                    <ChevronRight />
                </IconButton>
                <IconButton onClick={toggleFullScreen} color="primary">
                    {isFullScreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>
            </Box>
            <Typography variant="body2" sx={{ mt: 1 }}>
                {currentIndex + 1} / {terms.length}
            </Typography>
        </Box>
    );
};

export default FlashcardView
