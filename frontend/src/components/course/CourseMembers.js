import { useState, useEffect, useCallback } from 'react'

import { useCourseContext } from "../../context/CourseContext"
import { useAuthContext } from "../../hooks/UseAuthContext"

import InviteManager from './InviteManager'
import MemberDetails from './MemberDetails'

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
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    Box,
    Stack,
    IconButton,
    Collapse,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    Card,
    CardContent,
    CardHeader
} from '@mui/material';
import { 
    UserPlus, 
    Users, 
    Mail, 
    X as CloseIcon,
    ChevronDown,
    ChevronUp,
    UserMinus
} from 'lucide-react';

const CourseMembers = () => {

    const { user } = useAuthContext()
    const { course, courseFriends, addCourseFriend, removeCourseFriend } = useCourseContext()

    const [inviteList, setInviteList] = useState([])
    const [memberList, setMemberList] = useState([])
    const [invitesExpanded, setInvitesExpanded] = useState(true);
    const [assistantList, setAssistantList] = useState([])

    const [inviteUserEnabled, setInviteUserEnabled] = useState(false)
    const [inviteUserError, setInviteUserError] = useState()
    const [inviteUserForm, setInviteUserForm] = useState({
        email: ''
    })

    const [addFriendEnabled, setAddFriendEnabled] = useState(false)
    const [addFriendId, setAddFriendId] = useState(-1)

    const [promoteUserEnabled, setPromoteUserEnabled] = useState(false)
    const [promoteUserId, setPromoteUserId] = useState(-1)

    const resetInviteForm = useCallback(() => {
        setInviteUserEnabled(false);
        setInviteUserError(undefined);
        setInviteUserForm({ email: '' });
    }, []);

    const resetFriendForm = useCallback(() => {
        setAddFriendEnabled(false);
        setAddFriendId(-1);
    }, []);

    const resetPromoteForm = useCallback(() => {
        setPromoteUserEnabled(false)
        setPromoteUserId(-1)
    })

    useEffect(() => {

        const fetchInvites = async () => {
            try {

                const response = await fetch(`/api/course/${course.courseId}/invites`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                })
                const json = await response.json()
                setInviteList(json.invites)

            } catch (err) {
                console.error(err)
            }
        }

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
                setMemberList(json.members)

            } catch (err) {
                console.error(err)
            }
        }

        const fetchAssistants = async () => {
            try {

                const response = await fetch(`/api/course/${course.courseId}/assistants`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                })

                const json = await response.json()
                setAssistantList(json.assistants)

            } catch (err) {
                console.error(err)
            }
        }

        if (user && course) {
            fetchInvites()
            fetchMembers()
            fetchAssistants()
        }

    }, [user, course])

    const handleInviteUserFormChange = (e) => {
        const { name, value } = e.target
        setInviteUserForm({ ...inviteUserForm, [name]: value })
    }

    const handleInviteUserFormSubmit = async (e) => {
        e.preventDefault()
        setInviteUserError()

        const response = await fetch(`/api/course/${course.courseId}/invite`, {
            method: 'POST',
            body: JSON.stringify(inviteUserForm),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })

        const json = await response.json()

        if (!response.ok) {
            setInviteUserError(json.error || "Failed to invite user")
            return
        }

        setInviteUserEnabled(false)
        setInviteList(prev => [...prev, json.invite])
    }

    const handleAddFriendSubmit = async (e) => {
        e.preventDefault()

        try {
            if (parseInt(addFriendId) >= 0) addCourseFriend(addFriendId)
        } catch (err) { console.error(err) }

        setAddFriendEnabled(false)
        setAddFriendId(-1)
    }

    const handlePromoteAssistant = async (e) => {
        e.preventDefault()
        try {

            const response = await fetch(`/api/assistant/promote`, {
                method: 'POST',
                body: JSON.stringify({
                        courseId: course.courseId,
                        userId: promoteUserId,
                    }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })

            if (response.ok && !assistantList.some(assistant => assistant.userId === promoteUserId)) {
                setAssistantList(prev => [...prev, memberList.find(member => member.userId === promoteUserId)])
            }

        } catch (err) {
            console.error(err)
        }

        setPromoteUserEnabled(false)
        setPromoteUserId(-1)
    }

    const handleDemoteAssistant = async (userId) => {
        try {

            await fetch(`/api/assistant/demote`, {
                method: 'POST',
                body: JSON.stringify({
                        courseId: course.courseId,
                        userId: userId,
                    }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })

        } catch (err) {
            console.error(err)
        }
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Grid container spacing={3}>
                {/* Main Content */}
                <Grid item xs={12} md={8}>
                    {user.userId === course.coordinatorId && (
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Mail size={24} color="#1976d2" />
                                    <Typography variant="h5" fontWeight="medium">
                                        User Invites
                                    </Typography>
                                </Stack>
                                <Button
                                    variant="contained"
                                    startIcon={<UserPlus />}
                                    onClick={() => setInviteUserEnabled(true)}
                                    sx={{
                                        background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                                        color: 'white'
                                    }}
                                >
                                    Invite Users
                                </Button>
                            </Stack>

                            <Paper 
                                variant="outlined" 
                                sx={{ mt: 2 }}
                            >
                                <Box
                                    onClick={() => setInvitesExpanded(!invitesExpanded)}
                                    sx={{
                                        p: 2,
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: 'action.hover' }
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        {invitesExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        <Typography>
                                            Pending Invites ({inviteList?.length || 0})
                                        </Typography>
                                    </Stack>
                                </Box>
                                <Collapse in={invitesExpanded}>
                                    <Divider />
                                    <List>
                                        {inviteList?.map((invite) => (
                                            <ListItem key={invite.email}>
                                                <InviteManager
                                                    invite={invite}
                                                    onDelete={() => {
                                                        setInviteList(inviteList.filter(item => item.email !== invite.email));
                                                    }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Collapse>
                            </Paper>
                        </Paper>
                    )}

                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <Users size={24} color="#1976d2" />
                            <Typography variant="h5" fontWeight="medium">
                                Course Members ({memberList?.length || 0})
                            </Typography>
                        </Stack>
                        <List>
                            {memberList?.map((member) => (
                                <ListItem key={member.userId}>
                                    <MemberDetails
                                        member={member}
                                        onDelete={() => {
                                            setMemberList(memberList.filter(item => item.userId !== member.userId));
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>

                    {user.userId === course.coordinatorId && (
                        <Paper sx={{ p: 3, mb: 3}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Mail size={24} color="#1976d2" />
                                    <Typography variant="h5" fontWeight="medium">
                                        Teaching Assistants ({assistantList ? assistantList.length : 0})
                                    </Typography>
                                </Stack>
                                <Button
                                    variant="contained"
                                    startIcon={<UserPlus />}
                                    onClick={() => setPromoteUserEnabled(true)}
                                    sx={{
                                        background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                                        color: 'white'
                                    }}
                                >
                                    Promote Assistant
                                </Button>
                            </Stack>

                            <List>
                                {assistantList?.map((member) => (
                                    <ListItem key={member.userId}>
                                        <MemberDetails
                                            member={member}
                                            onDelete={() => {
                                                setAssistantList(prev => prev.filter(assistant => assistant.userId !== member.userId))
                                                handleDemoteAssistant(member.userId)
                                            }}
                                            canKick={false} 
                                        />
                                    </ListItem>
                                ))}
                            </List>

                        </Paper>
                    )}
                </Grid>

                {/* Friends Sidebar */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardHeader 
                            title="Friends"
                            titleTypography={{ variant: 'h6' }}
                            action={
                                <Button
                                    variant="contained"
                                    startIcon={<UserPlus />}
                                    onClick={() => setAddFriendEnabled(true)}
                                    size="small"
                                    sx={{
                                        background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                                        color: 'white'
                                    }}
                                >
                                    Add Friend
                                </Button>
                            }
                        />
                        <CardContent>
                            <List>
                                {courseFriends.map((friend) => (
                                    <ListItem key={friend.userId}>
                                        <ListItemText 
                                            primary={`${friend.firstName} ${friend.lastName}`}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton 
                                                edge="end" 
                                                onClick={() => removeCourseFriend(friend.userId)}
                                                color="error"
                                                size="small"
                                            >
                                                <UserMinus size={20} />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Invite User Dialog */}
            <Dialog 
                open={inviteUserEnabled} 
                onClose={resetInviteForm}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ 
                    background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                    color: 'white'
                }}>
                    Invite a User
                </DialogTitle>
                <form onSubmit={handleInviteUserFormSubmit}>
                    <DialogContent sx={{ pt: 3 }}>
                        <Stack spacing={3}>
                            {inviteUserError && (
                                <Alert severity="error">
                                    {inviteUserError}
                                </Alert>
                            )}
                            <TextField
                                fullWidth
                                label="Email Address"
                                type="email"
                                name="email"
                                value={inviteUserForm.email}
                                onChange={(e) => setInviteUserForm({ email: e.target.value })}
                                required
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={resetInviteForm}>Cancel</Button>
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
                            Send Invite
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Add Friend Dialog */}
            <Dialog 
                open={addFriendEnabled} 
                onClose={resetFriendForm}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ 
                    background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                    color: 'white'
                }}>
                    Add a Friend
                </DialogTitle>
                <form onSubmit={handleAddFriendSubmit}>
                    <DialogContent sx={{ pt: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel>Select Student</InputLabel>
                            <Select
                                value={addFriendId}
                                onChange={(e) => setAddFriendId(e.target.value)}
                                label="Select Student"
                                required
                            >
                                <MenuItem value={-1}><em>None</em></MenuItem>
                                {memberList
                                    ?.filter(member => 
                                        member.userId !== user.userId && 
                                        !courseFriends.some(friend => friend.userId === member.userId)
                                    )
                                    .map((member) => (
                                        <MenuItem key={member.userId} value={member.userId}>
                                            {`${member.firstName} ${member.lastName}`}
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={resetFriendForm}>Cancel</Button>
                        <Button 
                            type="submit"
                            variant="contained"
                            disabled={addFriendId === -1}
                            sx={{
                                background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #1976D2 30%, #5E35B1 90%)'
                                }
                            }}
                        >
                            Add Friend
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog 
                open={promoteUserEnabled} 
                onClose={resetPromoteForm}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ 
                    background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                    color: 'white'
                }}>
                    Promote a Teaching Assistant
                </DialogTitle>
                <form onSubmit={handlePromoteAssistant}>
                    <DialogContent sx={{ pt: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel>Select User</InputLabel>
                            <Select
                                value={promoteUserId}
                                onChange={(e) => setPromoteUserId(e.target.value)}
                                label="Select User"
                                required
                            >
                                <MenuItem value={-1}><em>None</em></MenuItem>
                                {memberList
                                    ?.filter(member => 
                                        member.userId !== user.userId && 
                                        !assistantList.some(assistant => assistant.userId === member.userId)
                                    )
                                    .map((member) => (
                                        <MenuItem key={member.userId} value={member.userId}>
                                            {`${member.firstName} ${member.lastName}`}
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={resetPromoteForm}>Cancel</Button>
                        <Button 
                            type="submit"
                            variant="contained"
                            disabled={promoteUserId === -1}
                            sx={{
                                background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #1976D2 30%, #5E35B1 90%)'
                                }
                            }}
                        >
                            Promote User
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
 
        </Container>
    );
};

export default CourseMembers;
