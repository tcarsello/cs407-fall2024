import { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/UseAuthContext";

//import '../css/home.css'
import "../css/generalAssets.css";
import CourseDetails from "../components/course/CourseDetails";
import InviteDetails from "../components/course/InviteDetails";

import { useDisplayContext } from "../context/DisplayContext";
import { useFriendContext } from "../context/FriendContext";

import GameList from "../components/games/GameList";

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
    IconButton,
    Box,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    ListItemSecondaryAction,
    Avatar,
    Chip,
    Stack,
    Fade,
	Alert
} from '@mui/material';

import {
	Trash2,
    Plus,
    UserPlus,
    Share2,
    Mail,
    X as CloseIcon
} from 'lucide-react';

const Home = () => {
	const { user } = useAuthContext();
	const { getClassNames } = useDisplayContext();
	const { friendsList, removeFriend } = useFriendContext();

	const [myCourseList, setMyCourseList] = useState([]);
	const [joinedCourseList, setJoinedCourseList] = useState([]);
	const [inviteList, setInviteList] = useState([]);

	const [createCourseEnabled, setCreateCourseEnabled] = useState(false);
	const [createCourseForm, setCreateCourseForm] = useState({
		courseName: "",
		courseDescription: "",
	});
	const [createCourseFormError, setCreateCourseFormError] = useState();

	const [invitesOpen, setInvitesOpen] = useState(false);

	const [joinCourseEnabled, setJoinCourseEnabled] = useState(false);
	const [joinCourseForm, setJoinCourseForm] = useState({
		joinCode: "",
	});
	const [joinCourseFormError, setJoinCourseFormError] = useState();

	const [classNames, setClassNames] = useState(getClassNames("lightMode"));

	const [referFriendEnabled, setReferFriendEnabled] = useState(false);
	const [referFriendEmail, setReferFriendEmail] = useState("");
	const [referFriendError, setReferFriendError] = useState("");

	useEffect(() => {
		if (user && !user.lightMode) {
			setClassNames(getClassNames("darkMode"));
		} else if (user && user.lightMode) {
			setClassNames(getClassNames("lightMode"));
		}
	}, [user, getClassNames]);

	const handleJoinCourseFormChange = (e) => {
		const { name, value } = e.target;
		setJoinCourseForm({
			...joinCourseForm,
			[name]: value,
		});
	};

	const handleJoinCourseFormSubmit = async (e) => {
		e.preventDefault();

		const response = await fetch(`/api/course/join`, {
			method: "POST",
			body: JSON.stringify(joinCourseForm),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${user.token}`,
			},
		});

		const json = await response.json();
		console.log(json);

		if (response.ok) {
			setJoinCourseFormError();
			setJoinCourseEnabled(false);
			setJoinedCourseList((prev) => [...prev, json]);
		} else {
			setJoinCourseFormError(json.error);
		}
	};

	const handleCreateCourseFormChange = (e) => {
		const { name, value } = e.target;
		setCreateCourseForm({
			...createCourseForm,
			[name]: value,
		});
	};
	const handleCreateCourseFormSubmit = async (e) => {
		e.preventDefault();

		const response = await fetch(`/api/course`, {
			method: "POST",
			body: JSON.stringify(createCourseForm),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${user.token}`,
			},
		});

		const json = await response.json();

		if (response.ok) {
			setCreateCourseEnabled(false);
			setMyCourseList((prev) => [...prev, json]);
		} else {
			setCreateCourseFormError(json.error);
		}
	};

	useEffect(() => {
		if (!user.userId) return;

		fetch(`/api/user/${user.userId}/courses/coordinating`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${user.token}`,
			},
		})
			.then((resp) => resp.json())
			.then((json) => {
				setMyCourseList(json.courses);
			});

		fetch(`/api/user/${user.userId}/courses/joined`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${user.token}`,
			},
		})
			.then((resp) => resp.json())
			.then((json) => {
				setJoinedCourseList(json.courses);
			});

		fetch(`/api/user/${user.userId}/invites`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${user.token}`,
			},
		})
			.then((resp) => resp.json())
			.then((json) => {
				setInviteList(json.invites);
			});
	}, [user]);

	const handleReferFriendSubmit = async (e) => {
		e.preventDefault();

		try {
			const response = await fetch(`/api/user/refer`, {
				method: "POST",
				body: JSON.stringify({ email: referFriendEmail }),
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${user.token}`,
				},
			});

			if (!response.ok) {
				throw Error("Failed to send reference email");
			}

			setReferFriendEnabled(false);
			alert("Reference email sent");
		} catch (err) {
			console.log(err);
			setReferFriendError("Failed to send email");
		}
	};

	return (
		<Container maxWidth={false} sx={{ height: '100vh', bgcolor: 'background.default' }}>
			<Grid container spacing={3} sx={{ py: 4, px: 2 }}>
				{/* Left Sidebar */}
				<Grid item xs={12} md={3}>
					<Stack spacing={3} position="sticky" top={20}>
						{/* Profile Card */}
						<Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
							<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
								<Avatar 
									sx={{ 
										width: 48, 
										height: 48,
										bgcolor: 'primary.main',
										fontSize: '1.2rem'
									}}
								>
									{user?.firstName?.[0]}
								</Avatar>
								<Box>
									<Typography variant="h6">
										{user?.firstName} {user?.lastName}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{user?.email}
									</Typography>
								</Box>
							</Stack>
	
							<Stack spacing={2}>
								<Button
									fullWidth
									size="large"
									variant="contained"
									startIcon={<Plus />}
									onClick={() => setCreateCourseEnabled(true)}
									sx={{
										background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
										color: 'white',
										borderRadius: 2,
										textTransform: 'none',
										py: 1.5,
										boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)'
									}}
								>
									Create New Course
								</Button>
								<Button
									fullWidth
									size="large"
									variant="outlined"
									startIcon={<UserPlus />}
									onClick={() => setJoinCourseEnabled(true)}
									sx={{
										borderRadius: 2,
										textTransform: 'none',
										py: 1.5
									}}
								>
									Join a Course
								</Button>
							</Stack>
						</Paper>
	
						{/* Friends List */}
						<Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
							<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
								<Typography variant="h6">Friends</Typography>
								<Chip 
									label={friendsList?.length || 0}
									color="primary"
									size="small"
								/>
							</Stack>
							
							<List sx={{ maxHeight: 300, overflow: 'auto' }}>
								{friendsList?.map((friend, index) => (
									<ListItem
										key={index}
										secondaryAction={
											<IconButton 
												edge="end" 
												size="small" 
												onClick={() => removeFriend(friend.userId)}
												sx={{ color: 'error.main' }}
											>
												<Trash2 size={16} />
											</IconButton>
										}
										sx={{ px: 0 }}
									>
										<ListItemAvatar>
											<Avatar sx={{ 
												bgcolor: 'primary.light', 
												width: 32, 
												height: 32, 
												fontSize: '0.875rem' 
											}}>
												{friend.firstName[0]}
											</Avatar>
										</ListItemAvatar>
										<ListItemText 
											primary={`${friend.firstName} ${friend.lastName}`}
											primaryTypographyProps={{ variant: 'body2' }}
										/>
									</ListItem>
								))}
							</List>
							
							<Button
								fullWidth
								startIcon={<Share2 size={18} />}
								onClick={() => setReferFriendEnabled(true)}
								sx={{ 
									mt: 2, 
									textTransform: 'none',
									color: 'primary.main'
								}}
							>
								Invite Friends
							</Button>
						</Paper>
					</Stack>
				</Grid>
	
				{/* Main Content Area */}
				<Grid item xs={12} md={9}>
					<Stack spacing={3}>
						{/* Course Invites Banner */}
						{inviteList?.length > 0 && (
							<Paper 
								elevation={0} 
								sx={{ 
									p: 2, 
									borderRadius: 2,
									bgcolor: 'primary.light',
									color: 'primary.contrastText'
								}}
							>
								<Stack direction="row" justifyContent="space-between" alignItems="center">
									<Stack direction="row" spacing={2} alignItems="center">
										<Mail />
										<Box>
											<Typography variant="h6">
												New Course Invites
											</Typography>
											<Typography variant="body2">
												You have {inviteList.length} pending course {inviteList.length === 1 ? 'invitation' : 'invitations'}
											</Typography>
										</Box>
									</Stack>
									{inviteList.map((invite, idx) => (
										<Fade in key={idx}>
											<Box>
												<InviteDetails
													invite={invite}
													onAccept={() => {
														setInviteList(inviteList.filter((item) => item.courseId !== invite.courseId));
														setJoinedCourseList((prev) => [...prev, invite]);
													}}
													onDecline={() => {
														setInviteList(inviteList.filter((item) => item.courseId !== invite.courseId));
													}}
												/>
											</Box>
										</Fade>
									))}
								</Stack>
							</Paper>
						)}
	
						{/* My Courses Section */}
						<Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
							<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
								<Typography variant="h5">
									My Courses
								</Typography>
								<Chip 
									label={`${myCourseList?.length || 0} Courses`}
									color="primary"
									variant="outlined"
								/>
							</Stack>
							<Stack spacing={2}>
								{myCourseList?.map((course) => (
									<Fade in key={course.courseId}>
										<div>
											<CourseDetails
												course={course}
												onDelete={() => setMyCourseList(
													myCourseList.filter(item => item.courseId !== course.courseId)
												)}
											/>
										</div>
									</Fade>
								))}
								{myCourseList?.length === 0 && (
									<Box 
										sx={{ 
											py: 4, 
											textAlign: 'center',
											color: 'text.secondary',
											bgcolor: 'grey.50',
											borderRadius: 2
										}}
									>
										<Typography variant="body1" gutterBottom>
											No courses created yet
										</Typography>
										<Button
											startIcon={<Plus />}
											onClick={() => setCreateCourseEnabled(true)}
											sx={{ mt: 1 }}
										>
											Create Your First Course
										</Button>
									</Box>
								)}
							</Stack>
						</Paper>
	
						{/* Joined Courses Section */}
						<Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
							<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
								<Typography variant="h5">
									Joined Courses
								</Typography>
								<Chip 
									label={`${joinedCourseList?.length || 0} Courses`}
									color="primary"
									variant="outlined"
								/>
							</Stack>
							<Stack spacing={2}>
								{joinedCourseList?.map((course) => (
									<Fade in key={course.courseId}>
										<div>
											<CourseDetails
												course={course}
												onDelete={() => setJoinedCourseList(
													joinedCourseList.filter(item => item.courseId !== course.courseId)
												)}
											/>
										</div>
									</Fade>
								))}
								{joinedCourseList?.length === 0 && (
									<Box 
										sx={{ 
											py: 4, 
											textAlign: 'center',
											color: 'text.secondary',
											bgcolor: 'grey.50',
											borderRadius: 2
										}}
									>
										<Typography variant="body1" gutterBottom>
											You haven't joined any courses yet
										</Typography>
										<Button
											startIcon={<UserPlus />}
											onClick={() => setJoinCourseEnabled(true)}
											sx={{ mt: 1 }}
										>
											Join a Course
										</Button>
									</Box>
								)}
							</Stack>
						</Paper>
	
						{/* Games Section */}
						<Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
							<Typography variant="h5" gutterBottom>
								Games
							</Typography>
							<Divider sx={{ mb: 3 }} />
							<Stack spacing={3}>
								<Box>
									<Typography variant="h6" gutterBottom>Active Games</Typography>
									<GameList title="" divClass="" />
								</Box>
								<Box>
									<Typography variant="h6" gutterBottom>Game History</Typography>
									<GameList title="" divClass="" history={true} />
								</Box>
							</Stack>
						</Paper>
					</Stack>
				</Grid>
			</Grid>
	
			{/* Create Course Dialog */}
			<Dialog 
				open={createCourseEnabled} 
				onClose={() => {
					setCreateCourseEnabled(false);
					setCreateCourseFormError();
				}}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle sx={{ 
					background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
					color: 'white'
				}}>
					Create a New Course
				</DialogTitle>
				<form onSubmit={handleCreateCourseFormSubmit}>
					<DialogContent sx={{ pt: 3 }}>
						<Stack spacing={3}>
							{createCourseFormError && (
								<Alert severity="error">
									{createCourseFormError}
								</Alert>
							)}
							
							<TextField
								fullWidth
								label="Course Name"
								name="courseName"
								value={createCourseForm.courseName}
								onChange={handleCreateCourseFormChange}
								required
							/>
							
							<TextField
								fullWidth
								label="Course Description"
								name="courseDescription"
								value={createCourseForm.courseDescription}
								onChange={handleCreateCourseFormChange}
								multiline
								rows={4}
							/>
						</Stack>
					</DialogContent>
					<DialogActions sx={{ p: 3 }}>
						<Button onClick={() => setCreateCourseEnabled(false)}>
							Cancel
						</Button>
						<Button 
							type="submit"
							variant="contained"
							sx={{
								background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
							}}
						>
							Create Course
						</Button>
					</DialogActions>
				</form>
			</Dialog>
	
			{/* Join Course Dialog */}
			<Dialog 
				open={joinCourseEnabled}
				onClose={() => {
					setJoinCourseEnabled(false);
					setJoinCourseFormError();
				}}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle sx={{ 
					background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
					color: 'white'
				}}>
					Join a Course
				</DialogTitle>
				<form onSubmit={handleJoinCourseFormSubmit}>
					<DialogContent sx={{ pt: 3 }}>
						<Stack spacing={3}>
							{joinCourseFormError && (
								<Alert severity="error">
									{joinCourseFormError}
								</Alert>
							)}
							
							<TextField
								fullWidth
								label="Join Code"
								name="joinCode"
								value={joinCourseForm.joinCode}
								onChange={handleJoinCourseFormChange}
								required
							/>
						</Stack>
					</DialogContent>
					<DialogActions sx={{ p: 3 }}>
						<Button onClick={() => setJoinCourseEnabled(false)}>
							Cancel
						</Button>
						<Button 
							type="submit"
							variant="contained"
							sx={{
								background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
							}}
						>
							Join Course
						</Button>
					</DialogActions>
				</form>
			</Dialog>

            {/* Refer Friend Dialog */}
            <Dialog 
                open={referFriendEnabled}
                onClose={() => {
                    setReferFriendEnabled(false);
                    setReferFriendEmail("");
                    setReferFriendError();
                }}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ 
                    background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                    color: 'white'
                }}>
                    Refer a Friend
                </DialogTitle>
                <form onSubmit={handleReferFriendSubmit}>
                    <DialogContent sx={{ pt: 3 }}>
                        <Stack spacing={3}>
                            {referFriendError && (
                                <Alert severity="error">
                                    {referFriendError}
                                </Alert>
                            )}
                            
                            <TextField
                                fullWidth
                                label="Email"
                                name="referFriendEmail"
                                type="email"
                                value={referFriendEmail}
                                onChange={(e) => setReferFriendEmail(e.target.value)}
                                required
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => setReferFriendEnabled(false)}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit"
                            variant="contained"
                            sx={{
                                background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                            }}
                        >
                            Send Invitation
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default Home;