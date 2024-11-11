import { useCourseContext } from "../../context/CourseContext"
import { useAuthContext } from "../../hooks/UseAuthContext"

import GameList from "../games/GameList"

import { useState, useEffect } from 'react'

import { 
    Container,
    Grid,
    Paper,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Stack,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Alert
} from '@mui/material';
import { 
    X, 
    Check, 
    Plus, 
    Shuffle, 
    Users, 
    ChevronDown,
    Gamepad
} from 'lucide-react';

const CourseGames = () => {

    const { user } = useAuthContext()
    const { course, courseFriends } = useCourseContext()

    const [createChallengeEnabled, setCreateChallengeEnabled] = useState(false)
    const [createChallengeError, setCreateChallengeError] = useState()
    const [challengerId, setChallengerId] = useState(-1)
    
    const [createFriendChallengeEnabled, setCreateFriendChallengeEnabled] = useState(false)
    const [createFriendChallengeError, setCreateFriendChallengeError] = useState()

    const [memberList, setMemberList] = useState([])
    const [outgoingChallengeList, setOutgoingChallengeList] = useState([])
    const [incomingChallengeList, setIncomingChallengeList] = useState([])

    const [challengeTrigger, setChallengeTrigger] = useState(false)

    // Used to update the game list
    const [gameList, setGameList] = useState(0)

    useEffect(() => {

        const fetchMembers = async () => {
            try {

                const response = await fetch(`/api/course/${course.courseId}/members`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                })
                const json = await response.json()
                setMemberList([{ userId: -1, firstName: '', lastName: ''}, ...json.members])

            } catch (err) {
                console.error(err)
            }
        }

        if (user && course) {
            fetchMembers()
        }

    }, [user, course])

    useEffect(() => {

        const fetchOutgoingChallenges = async () => {
            try {

                const response = await fetch(`/api/user/${user.userId}/outgoingChallenges/${course.courseId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                })

                const json = await response.json()
                
                setOutgoingChallengeList(json.challenges.map(c => {
                    let challenger = memberList.find(member => parseInt(member.userId) === parseInt(c.challengerId))
                    return {...c, name: `${challenger.firstName} ${challenger.lastName}`}
                }))

            } catch (err) {
                console.error(err)
            }
        }

        const fetchIncomingChallenges = async () => {
            try {

                const response = await fetch(`/api/user/${user.userId}/incomingChallenges/${course.courseId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                })

                const json = await response.json()
                
                setIncomingChallengeList(json.challenges.map(c => {
                    let challenger = memberList.find(member => parseInt(member.userId) === parseInt(c.contenderId))
                    return {...c, name: `${challenger.firstName} ${challenger.lastName}`}
                }))

            } catch (err) {
                console.error(err)
            }
        }



        if (user && course && memberList.length > 0) {
            fetchOutgoingChallenges()
            fetchIncomingChallenges()
        }

    }, [course, memberList, user, challengeTrigger])

    const triggerChallengeRefresh = () => {
        setChallengeTrigger(prev => !prev)
    }

    const handleCreateChallenge = async (e) => {
        e.preventDefault()

        try {

            const bodyContent = {
                courseId: course.courseId,
                contenderId: user.userId,
                challengerId: challengerId,
            }

            const response = await fetch(`/api/challenge/`, {
                method: 'POST',
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }

            })

            const json = await response.json()

            if (!response.ok) {
                setCreateChallengeError(json.error || 'Failed to create challenge')
                setCreateFriendChallengeError(json.error || 'Failed to create challenge')
                throw (json.error || 'Failed to create challenge')
            }

            let challenger = memberList.find(member => parseInt(member.userId) === parseInt(challengerId))
            setOutgoingChallengeList(prev => [...prev, {...json.challenge, name: `${challenger.firstName} ${challenger.lastName}`}])

            setCreateChallengeEnabled(false)
            setCreateChallengeError()

            setCreateFriendChallengeEnabled(false)
            setCreateFriendChallengeError()

            setChallengerId(-1)
        } catch (err) {
            console.error(err)
        }

    }

    const handleCancelChallenge = async (index) => {

        try {

            const challenge = outgoingChallengeList[index]

            const bodyContent = {...challenge}
            const response = await fetch(`/api/challenge`, {
                method: 'DELETE',
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })

            if (response.ok) setOutgoingChallengeList(prev => prev.filter((c,i) => i !== index))

        } catch (err) {
            console.error(err)
        }

    }

    const handleRejectChallenge = async (index) => {

        try {
            
            const challenge = incomingChallengeList[index]

            const bodyContent = {...challenge}
            const response = await fetch(`/api/challenge/reject`, {
                method: 'POST',
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })

            if (response.ok) setIncomingChallengeList(prev => prev.filter((c, i) => i !== index))

        } catch (err) {
            console.error(err)
        }

    }

    const handleAcceptChallenge = async (index) => {

        try {
            
            const challenge = incomingChallengeList[index]

            const bodyContent = {...challenge}
            const response = await fetch(`/api/challenge/accept`, {
                method: 'POST',
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })

            if (response.ok) {
                setIncomingChallengeList(prev => prev.filter((c, i) => i !== index))
                setGameList(gameList + 1)
            }

        } catch (err) {
            console.error(err)
        }

    }
    
    const handleRandomChallenge = async () => {
        try {

            const candidates = memberList.filter(member =>
                !incomingChallengeList.some(incoming => member.userId === incoming.contenderId)
                && !outgoingChallengeList.some(outgoing => member.userId === outgoing.challengerId)
                && member.userId >= 0
                && member.userId !== user.userId
            )

            if (candidates.length === 0) return

            const choice = candidates[Math.floor(Math.random() * candidates.length)]

            const bodyContent = {
                courseId: course.courseId,
                contenderId: user.userId,
                challengerId: choice.userId,
            }

            const response = await fetch(`/api/challenge/`, {
                method: 'POST',
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }

            })

            const json = await response.json()

            if (!response.ok) {
                throw (json.error || 'Failed to create challenge')
            }

            setOutgoingChallengeList(prev => [...prev, {...json.challenge, name: `${choice.firstName} ${choice.lastName}`}])
        
        } catch (err) {
            console.error(err)
        }

    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Grid container spacing={3}>
                {/* Main Content Area */}
                <Grid item xs={12} md={9}>
                    {/* Active Games */}
                    <Paper sx={{ mb: 3, p: 3 }}>
                        <Accordion defaultExpanded>
                        <AccordionSummary 
                expandIcon={<ChevronDown />}
                sx={{ 
                    background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                    color: 'white',
                    borderRadius: '4px 4px 0 0'
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    <Gamepad />
                    <Typography variant="h6">Active Games</Typography>
                </Stack>
            </AccordionSummary>
                            <AccordionDetails>
                                <GameList title="" divClass="" course={course} key={gameList} />
                            </AccordionDetails>
                        </Accordion>
                    </Paper>

                    {/* Game History */}
                    <Paper sx={{ mb: 3, p: 3 }}>
                        <Accordion defaultExpanded>
                        <AccordionSummary 
                expandIcon={<ChevronDown />}
                sx={{ 
                    background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                    color: 'white',
                    borderRadius: '4px 4px 0 0'
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    <Gamepad />
                    <Typography variant="h6">Past Games</Typography>
                </Stack>
            </AccordionSummary>
                            <AccordionDetails>
                                <GameList title="" divClass="" course={course} history={true} key={gameList + 1} refreshChallenges={triggerChallengeRefresh} refreshGames={() => setGameList(prev => prev+1)} />
                            </AccordionDetails>
                        </Accordion>
                    </Paper>

                    {/* Course Games (Coordinator Only) */}
                    {user.userId === course.coordinatorId && (
                        <Paper sx={{ mb: 3, p: 3 }}>
                            <Accordion defaultExpanded>
                            <AccordionSummary 
                expandIcon={<ChevronDown />}
                sx={{ 
                    background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                    color: 'white',
                    borderRadius: '4px 4px 0 0'
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    <Gamepad />
                    <Typography variant="h6">Active Games</Typography>
                </Stack>
            </AccordionSummary>
                                <AccordionDetails>
                                    <GameList title={""} divClass="" masterList={true} course={course} key={gameList + 2} />
                                </AccordionDetails>
                            </Accordion>
                        </Paper>
                    )}
                </Grid>

                {/* Sidebar */}
                <Grid item xs={12} md={3}>
                    {/* Create Challenge */}
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Create Challenge</Typography>
                        <Stack spacing={2}>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<Plus />}
                                onClick={() => setCreateChallengeEnabled(true)}
                                sx={{
                                    background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                                    color: 'white'
                                }}
                            >
                                New Challenge
                            </Button>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<Shuffle />}
                                onClick={handleRandomChallenge}
                                sx={{
                                    background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                                    color: 'white'
                                }}
                            >
                                Random Challenge
                            </Button>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<Users />}
                                onClick={() => setCreateFriendChallengeEnabled(true)}
                                sx={{
                                    background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                                    color: 'white'
                                }}
                            >
                                Challenge Friend
                            </Button>
                        </Stack>
                    </Paper>

                    {/* Incoming Challenges */}
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Incoming Challenges</Typography>
                        <Stack spacing={2}>
                            {incomingChallengeList?.map((incoming, index) => (
                                <Paper 
                                    key={index} 
                                    variant="outlined"
                                    sx={{ p: 1 }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography sx={{ flex: 1 }}>{incoming.name}</Typography>
                                        <IconButton 
                                            size="small" 
                                            color="success"
                                            onClick={() => handleAcceptChallenge(index)}
                                        >
                                            <Check size={20} />
                                        </IconButton>
                                        <IconButton 
                                            size="small" 
                                            color="error"
                                            onClick={() => handleRejectChallenge(index)}
                                        >
                                            <X size={20} />
                                        </IconButton>
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>
                    </Paper>

                    {/* Outgoing Challenges */}
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Outgoing Challenges</Typography>
                        <Stack spacing={2}>
                            {outgoingChallengeList?.map((outgoing, index) => (
                                <Paper 
                                    key={index} 
                                    variant="outlined"
                                    sx={{ p: 1 }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography sx={{ flex: 1 }}>{outgoing.name}</Typography>
                                        <IconButton 
                                            size="small" 
                                            color="error"
                                            onClick={() => handleCancelChallenge(index)}
                                        >
                                            <X size={20} />
                                        </IconButton>
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            {/* Challenge Dialogs */}
            <Dialog
                open={createChallengeEnabled}
                onClose={() => {
                    setCreateChallengeEnabled(false);
                    setCreateChallengeError();
                }}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ 
                    background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                    color: 'white'
                }}>
                    Challenge a Classmate
                </DialogTitle>
                <form onSubmit={handleCreateChallenge}>
                    <DialogContent sx={{ pt: 3 }}>
                        {createChallengeError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {createChallengeError}
                            </Alert>
                        )}
                        <FormControl fullWidth>
                            <InputLabel>Select Student</InputLabel>
                            <Select
                                value={challengerId}
                                onChange={(e) => setChallengerId(e.target.value)}
                                label="Select Student"
                                required
                            >
                                {memberList
                                    .filter(member => member.userId !== user.userId)
                                    .map((member, index) => (
                                        <MenuItem key={index} value={member.userId}>
                                            {`${member.firstName} ${member.lastName}`}
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => {
                            setCreateChallengeEnabled(false);
                            setCreateChallengeError();
                        }}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit"
                            variant="contained"
                            sx={{
                                background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #1976D2 30%, #5E35B1 90%)'
                                }
                            }}
                        >
                            Create Challenge
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog
                open={createFriendChallengeEnabled}
                onClose={() => {
                    setCreateFriendChallengeEnabled(false);
                    setCreateFriendChallengeError();
                }}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ 
                    background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                    color: 'white'
                }}>
                    Challenge a Friend
                </DialogTitle>
                <form onSubmit={handleCreateChallenge}>
                    <DialogContent sx={{ pt: 3 }}>
                        {createFriendChallengeError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {createFriendChallengeError}
                            </Alert>
                        )}
                        <FormControl fullWidth>
                            <InputLabel>Select Friend</InputLabel>
                            <Select
                                value={challengerId}
                                onChange={(e) => setChallengerId(e.target.value)}
                                label="Select Friend"
                                required
                            >
                                <MenuItem value={-1}><em>None</em></MenuItem>
                                {courseFriends
                                    .filter(member => member.userId !== user.userId)
                                    .map((member, index) => (
                                        <MenuItem key={index} value={member.userId}>
                                            {`${member.firstName} ${member.lastName}`}
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => {
                            setCreateFriendChallengeEnabled(false);
                            setCreateFriendChallengeError();
                        }}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit"
                            variant="contained"
                            sx={{
                                background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #1976D2 30%, #5E35B1 90%)'
                                }
                            }}
                        >
                            Create Challenge
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default CourseGames;
