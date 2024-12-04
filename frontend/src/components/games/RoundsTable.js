import { useState, useEffect } from 'react'
import { useGameContext } from '../../context/GameContext'
import { useAuthContext } from '../../hooks/UseAuthContext'
import { Trophy, Users, Clock } from 'lucide-react';
import { 
    Box, 
    Container,
    Paper, 
    Typography, 
    Grid, 
    Button,
    LinearProgress,
    Stack,
    Avatar,
    Divider
} from '@mui/material';

import '../../css/game.css'
import { useNavigate } from 'react-router-dom'
import TopicWheel from './TopicWheel'

const RoundsTable = () => {

    const { user } = useAuthContext()
    const { game, course } = useGameContext()

    const [roundList, setRoundList] = useState([])

    const [topicList, setTopicList] = useState([])
    const [selectedTopic, setSelectedTopic] = useState()
    const [isAnimating, setIsAnimating] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)

    const [playerOneScore, setPlayerOneScore] = useState(0)
    const [playerTwoScore, setPlayerTwoScore] = useState(0)

    useEffect(() => {

        const fetchRounds = async () => {
            try {

                const response = await fetch(`/api/game/${game.gameId}/rounds`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                })

                const json = await response.json()
                if (response.ok) {
                    setRoundList(json.rounds)
                }

            } catch (err) {
                console.error(err)
            }
        }

        const fetchTopics = async () => {
            try {

                const response = await fetch(`/api/course/${course.courseId}/topics`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                })

                const json = await response.json()
                if (response.ok) {
                    setTopicList(json.topics)
                }

            } catch (err) {
                console.error(err)
            }
        }

        if (user && game && course) {
            fetchRounds()
            fetchTopics()
        }

    }, [user.token, game.gameId, course])

    useEffect(() => {

        let total1 = 0
        let total2 = 0
        roundList.map(round => {
            if (round.roundWinner === 'Unfinished') return

            if (round.playerOneScore > round.playerTwoScore) {
                total1 += 1
            } else if (round.playerOneScore < round.playerTwoScore) {
                total2 += 1
            } else {
                total1 += 0.5
                total2 += 0.5
            }

            return 0

        })

        setPlayerOneScore(total1)
        setPlayerTwoScore(total2)

        if (roundList.length >= game.maxRounds && playerOneScore + playerTwoScore >= roundList.length) {
            if (roundList.at(-1).roundWinner !== 'Unfinished' && (game.status === 'In Progress')) {
                // Declare score
                try {
                    fetch(`/api/game/${game.gameId}/declareScore`, {
                        method: 'POST',
                        body: JSON.stringify({ playerOneScore, playerTwoScore }),
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${user.token}`
                        }
                    })
                } catch (err) {
                    console.error(err)
                }
            }
        }

    }, [roundList])

    const addRound = async (newRound) => {
        setRoundList(prev => ([...prev, newRound]))
    }

    const createRound = async (topicId) => {

        try {

            const response = await fetch(`/api/game/${game.gameId}/newRound`, {
                method: 'POST',
                body: JSON.stringify({ topicId }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })
            
            const json = await response.json()
            if (response.ok) addRound(json.round)

        } catch (err) {
            console.error(err)
        }

    }

    const startSelection = () => {
        if (isAnimating) return
        if (!topicList || topicList.length === 0) return
        
        setIsAnimating(true)
        setSelectedTopic(null)
        
        setTimeout(() => {
            setIsAnimating(false)
        }, 3000)
    }

    const newRoundButtonDisabled = () => {
        if (isAnimating) return true
        if (roundList.length >= game.maxRounds) return true
        if (game.status === 'Player One Win' || game.status === 'Player Two Win' || game.status === 'Tie') return true
        if (roundList.length > 0 && roundList.at(-1).roundWinner === 'Unfinished') return true

        return false
    }

    const gameStatusString = () => {
        if (game?.status === 'Player One Win') return `${game.playerOneName} Wins!`
        if (game?.status === 'Player Two Win') return `${game.playerTwoName} Wins!`
        return game ? game.status : ''
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Game Status Header */}
            <Paper 
                elevation={3}
                sx={{
                    mb: 4,
                    background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                    color: 'white',
                    p: 3,
                    borderRadius: 2
                }}
            >
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            {gameStatusString()}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Clock />
                            <Typography>
                                Round {roundList?.length || 0} of {game?.maxRounds || 0}
                            </Typography>
                        </Stack>
                    </Grid>
                    <Grid item>
                        <Typography variant="h6">Current Score</Typography>
                        <Typography variant="h3" fontWeight="bold">
                            {playerOneScore} - {playerTwoScore}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* Player Score Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Player One */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                        <Stack spacing={2}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Users color="#2196F3" />
                                    <Typography variant="h6">{game?.playerOneName}</Typography>
                                </Stack>
                                <Typography variant="h4" fontWeight="bold">
                                    {playerOneScore}
                                </Typography>
                            </Stack>
                            <LinearProgress 
                                variant="determinate" 
                                value={(playerOneScore / (game?.maxRounds || 1)) * 100}
                                sx={{ height: 10, borderRadius: 5 }}
                            />
                        </Stack>
                    </Paper>
                </Grid>

                {/* Player Two */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                        <Stack spacing={2}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Users color="#673AB7" />
                                    <Typography variant="h6">{game?.playerTwoName}</Typography>
                                </Stack>
                                <Typography variant="h4" fontWeight="bold">
                                    {playerTwoScore}
                                </Typography>
                            </Stack>
                            <LinearProgress 
                                variant="determinate" 
                                value={(playerTwoScore / (game?.maxRounds || 1)) * 100}
                                sx={{ 
                                    height: 10, 
                                    borderRadius: 5,
                                    '& .MuiLinearProgress-bar': {
                                        backgroundColor: '#673AB7'
                                    }
                                }}
                            />
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            {/* Rounds List */}
            <Stack spacing={2} sx={{ mb: 4 }}>
                {roundList && roundList.map((round, index) => (
                    <RoundCard
                        key={index}
                        round={round}
                        number={index + 1}
                        game={game}
                        user={user}
                    />
                ))}
            </Stack>

            {/* Topic Wheel Section */}
            <Box sx={{ textAlign: 'center', mt: 6 }}>
                <TopicWheel 
                    topics={topicList}
                    onTopicSelected={(topic) => {
                        createRound(topic.topicId);
                    }}
                    isSpinning={isAnimating}
                    disabled={newRoundButtonDisabled()}
                />
                {!newRoundButtonDisabled() && (
                    <Button 
                        variant="contained"
                        onClick={startSelection} 
                        disabled={isAnimating}
                        sx={{
                            mt: 3,
                            background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                            color: 'white',
                            px: 4,
                            py: 1.5,
                            '&:hover': {
                                background: 'linear-gradient(45deg, #1976D2 30%, #5E35B1 90%)'
                            }
                        }}
                    >
                        {isAnimating ? 'Spinning...' : 'Spin Wheel'}
                    </Button>
                )}
            </Box>
        </Container>
    );
};

const RoundCard = ({ round, number, game, user }) => {
    const navigate = useNavigate();

    const getStatusColor = () => {
        if (round.roundWinner === 'Unfinished') return '#FFC107';
        if (round.roundWinner === 'Tie') return '#2196F3';
        return '#4CAF50';
    };

    return (
        <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Grid container alignItems="center" spacing={2}>
                <Grid item>
                    <Avatar 
                        sx={{ 
                            width: 40, 
                            height: 40,
                            background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)'
                        }}
                    >
                        {number}
                    </Avatar>
                </Grid>
                <Grid item xs>
                    <Typography variant="h6">{round.topicName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {round.roundQuestions} Questions
                    </Typography>
                </Grid>
                
                <Grid item>
                    <Stack direction="row" spacing={4} alignItems="center">
                        {/* Player One */}
                        <Box textAlign="center">
                            {round.playerOneDone ? (
                                <Typography variant="h6">{round.playerOneScore}</Typography>
                            ) : (
                                game.playerOneId === user.userId && 
                                (game.status === 'New' || game.status === 'In Progress') ? (
                                    <Button 
                                        variant="contained"
                                        onClick={() => navigate(`/game/${game.gameId}/round/${round.roundId}`)}
                                        sx={{ bgcolor: '#2196F3' }}
                                    >
                                        Play Round
                                    </Button>
                                ) : (
                                    <Typography variant="h6" color="text.secondary">-</Typography>
                                )
                            )}
                            <Typography variant="body2" color="text.secondary">
                                {game?.playerOneName}
                            </Typography>
                        </Box>

                        <Divider orientation="vertical" flexItem />

                        {/* Player Two */}
                        <Box textAlign="center">
                            {round.playerTwoDone ? (
                                <Typography variant="h6">{round.playerTwoScore}</Typography>
                            ) : (
                                game.playerTwoId === user.userId && 
                                (game.status === 'New' || game.status === 'In Progress') ? (
                                    <Button 
                                        variant="contained"
                                        onClick={() => navigate(`/game/${game.gameId}/round/${round.roundId}`)}
                                        sx={{ bgcolor: '#673AB7' }}
                                    >
                                        Play Round
                                    </Button>
                                ) : (
                                    <Typography variant="h6" color="text.secondary">-</Typography>
                                )
                            )}
                            <Typography variant="body2" color="text.secondary">
                                {game?.playerTwoName}
                            </Typography>
                        </Box>

                        <Box sx={{ color: getStatusColor(), display: 'flex', alignItems: 'center', gap: 1 }}>
                            {round.roundWinner !== 'Unfinished' && <Trophy />}
                            <Typography fontWeight="medium">{round.roundWinner}</Typography>
                        </Box>
                    </Stack>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default RoundsTable;