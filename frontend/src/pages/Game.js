import { useState } from 'react'

import { GameProvider, useGameContext} from "../context/GameContext"
import { useAuthContext } from "../hooks/UseAuthContext"

import { useNavigate } from "react-router-dom"

import RoundsTable from '../components/games/RoundsTable'
import { 
    Container,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Stack,
    Paper,
    IconButton,
    Breadcrumbs,
    Link,
    Chip
} from '@mui/material';
import { 
    Home, 
    BookOpen, 
    ArrowLeftCircle, 
    Flag, 
    Users,
    Trophy 
} from 'lucide-react';

const Game = () => {

    return (
        <GameProvider>
            <GameComponent />
        </GameProvider>
    )

}

const GameComponent = () => {

    const { user } = useAuthContext()
    const { game, course } = useGameContext()

    const navigate = useNavigate()

    const [resignDialogEnabled, setResignDialogEnabled] = useState(false)

    const handleResign = async () => {
        try {

            const bodyContent = {
                userId: user.userId
            }

            const response = await fetch(`/api/game/${game.gameId}/resign`, {
                method: 'POST',
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })

            if (response.ok) navigate(course ? `/course/${course.courseId}` : '/')

        } catch (err) {
            console.error(err)
        }
    }

    const getGameStatusColor = () => {
        switch (game?.status) {
            case 'New': return 'info';
            case 'In Progress': return 'warning';
            case 'Player One Win':
            case 'Player Two Win': return 'success';
            default: return 'default';
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Navigation Breadcrumbs */}
            <Box sx={{ mb: 3 }}>
                <Breadcrumbs separator="›" aria-label="navigation">
                    <Link
                        component="button"
                        onClick={() => navigate('/')}
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            color: 'text.secondary',
                            textDecoration: 'none',
                            '&:hover': { color: 'primary.main' }
                        }}
                    >
                        <Home size={16} style={{ marginRight: '4px' }} />
                        Home
                    </Link>
                    {course && (
                        <Link
                            component="button"
                            onClick={() => navigate(`/course/${course.courseId}`)}
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                color: 'text.secondary',
                                textDecoration: 'none',
                                '&:hover': { color: 'primary.main' }
                            }}
                        >
                            <BookOpen size={16} style={{ marginRight: '4px' }} />
                            {course.courseName}
                        </Link>
                    )}
                    <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Trophy size={16} style={{ marginRight: '4px' }} />
                        Game
                    </Typography>
                </Breadcrumbs>
            </Box>

            {(game && course) && (
                <Paper 
                    elevation={3} 
                    sx={{ 
                        p: 3,
                        mb: 3,
                        borderRadius: 2
                    }}
                >
                    {/* Game Header */}
                    <Stack 
                        direction="row" 
                        justifyContent="space-between" 
                        alignItems="center" 
                        sx={{ mb: 3 }}
                    >
                        <Box>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Users size={32} color="#1976d2" />
                                <Typography variant="h4" component="h1" fontWeight="bold">
                                    {game.playerOneName} vs. {game.playerTwoName}
                                </Typography>
                            </Stack>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                                <Chip 
                                    label={course.courseName}
                                    color="primary"
                                    size="small"
                                />
                                <Chip 
                                    label={game.status}
                                    color={getGameStatusColor()}
                                    size="small"
                                />
                            </Stack>
                        </Box>
                        {(game.status === 'New' || game.status === 'In Progress') && (
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<Flag />}
                                onClick={() => setResignDialogEnabled(true)}
                            >
                                Resign
                            </Button>
                        )}
                    </Stack>

                    {/* Game Content */}
                    <RoundsTable />
                </Paper>
            )}

            {/* Resign Dialog */}
            <Dialog 
                open={resignDialogEnabled} 
                onClose={() => setResignDialogEnabled(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ 
                    background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                    color: 'white'
                }}>
                    Confirm Resignation
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography>
                        Are you sure you want to resign from this game? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setResignDialogEnabled(false)}>
                        Cancel
                    </Button>
                    <Button 
                        variant="contained" 
                        color="error"
                        onClick={() => {
                            setResignDialogEnabled(false);
                            handleResign();
                        }}
                    >
                        Resign
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Game;
