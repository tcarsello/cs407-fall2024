// FlashcardStyles.js
import { styled } from '@mui/system';
import { Paper, Box } from '@mui/material';

export const FlashcardContainer = styled(Paper)(({ theme }) => ({
    width: '400px',
    height: '250px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    perspective: '1000px',
    transition: 'transform 0.6s',
    transformStyle: 'preserve-3d',
    position: 'relative',
    margin: '20px auto',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
}));

export const FlashcardContent = styled(Box)(({ isFlipped }) => ({
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box',
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
    transition: 'transform 0.6s',
}));