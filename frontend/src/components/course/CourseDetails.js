import { useState, useEffect } from 'react'
import { useAuthContext } from '../../hooks/UseAuthContext'

import { Link } from 'react-router-dom'
import { 
    Box,
    Card,
    CardContent,
    Typography,
    IconButton,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    Chip,
    Tooltip,
    Fade
} from '@mui/material';
import { 
    Trash2,
    LogOut,
    Users,
    GamepadIcon,
    ChevronRight,
    ImageIcon
} from 'lucide-react';

const CourseDetails = ({ course, onDelete }) => {

    const { user } = useAuthContext()

    const [deleteCoursePopupEnabled, setDeleteCoursePopupEnabled] = useState(false)
    const [leaveCoursePopupEnabled, setLeaveCoursePopupEnabled] = useState(false)
    const [coursePictureUrl, setCoursePictureUrl] = useState()
    const [isHovered, setIsHovered] = useState(false);
    const [myGames, setMyGames] = useState(0);

    const handleDeleteCourse = async () => {
        const response = await fetch(`/api/course/${course.courseId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })
        if (response.ok) {
            onDelete()
        }
    }

    const handleLeaveCourse = async () => {
        const response = await fetch(`/api/course/${course.courseId}/leave`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })
        if (response.ok) {
            onDelete()
        }
    }

    useEffect(() => {

        const fetchCourseImage = async () => {
            try {

                const response = await fetch(`/api/course/${course.courseId}/picture`)

                if (!response.ok) {
                    console.error('Failed to fetch profile picture.')
                    return
                }

                const blob = await response.blob()
                const imageUrl = URL.createObjectURL(blob)
                setCoursePictureUrl(imageUrl)

            } catch (err) {
                console.error(err)
            }
        }

        const fetchMyGames = async () => {
            try {
                const response = await fetch(`/api/course/${course.courseId}/getUserGameCount/${user.userId}`);

                if (!response.ok) {
                    console.error("Failed to fetch game count");
                    return;
                }

                const json = await response.json()
                setMyGames(json.totalActive)
            } catch (err) {
                console.error(err);
            }
        };

        if (user && course) {
            fetchCourseImage()
            fetchMyGames()
        }

    }, [])

    const ConfirmationDialog = ({ open, title, message, onClose, onConfirm }) => (
        <Dialog 
            open={open} 
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    minWidth: 360
                }
            }}
        >
            <DialogTitle sx={{ 
                background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                color: 'white'
            }}>
                {title}
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                <Typography>{message}</Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                >
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );

    return (
        <Fade in>
            <Card
                component={Link}
                to={`/course/${course.courseId}`}
                sx={{
                    display: 'flex',
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    textDecoration: 'none',
                    color: 'inherit',
                    position: 'relative',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: (theme) => theme.shadows[4],
                        '& .hover-arrow': {
                            opacity: 1,
                            transform: 'translateX(0)'
                        }
                    }
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Course Image/Avatar */}
                <Box sx={{ p: 2, display: 'flex', alignItems: 'flex-start' }}>
                    {coursePictureUrl ? (
                        <Avatar 
                            src={coursePictureUrl}
                            sx={{ 
                                width: 64, 
                                height: 64,
                                border: '2px solid',
                                borderColor: 'primary.main'
                            }}
                        />
                    ) : (
                        <Avatar 
                            sx={{ 
                                width: 64, 
                                height: 64,
                                bgcolor: 'primary.light'
                            }}
                        >
                            <ImageIcon size={24} />
                        </Avatar>
                    )}
                </Box>
    
                <Box sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    pr: 8 // Add more padding to the right to accommodate the action buttons
                }}>
                    <CardContent sx={{ flex: 1 }}>
                        <Stack spacing={1.5}>
                            {/* Course Title */}
                            <Typography variant="h6" component="div">
                                {course.courseName}
                            </Typography>
    
                            {/* Stats Row */}
                            <Stack direction="row" spacing={1}>
                                <Chip 
                                    size="small"
                                    icon={<Users size={14} />}
                                    label={`${course.studentCount || 0} Students`}
                                    variant="outlined"
                                />
                                <Chip 
                                    size="small"
                                    icon={<GamepadIcon size={14} />}
                                    label={`${myGames} / ${course.gameLimit} Games`}
                                    variant="outlined"
                                    color={course.gameLimit === 0 ? "error" : "default"}
                                />
                            </Stack>
    
                            {/* Description */}
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {course.courseDescription}
                            </Typography>
    
                            {/* Join Code */}
                            {course.joinCode && (
                                <Typography 
                                    variant="caption" 
                                    color="text.secondary"
                                    sx={{ 
                                        display: 'inline-block',
                                        bgcolor: 'grey.50',
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 1
                                    }}
                                >
                                    Join Code: {course.joinCode}
                                </Typography>
                            )}
                        </Stack>
                    </CardContent>
                </Box>
    
                {/* Action Buttons - Positioned absolutely */}
                <Box 
                    sx={{ 
                        position: 'absolute',
                        right: 8,
                        top: 8, // Align to top instead of center
                        display: 'flex',
                        flexDirection: 'column', // Stack buttons vertically
                        gap: 1
                    }}
                >
                    {course.coordinatorId === user.userId ? (
                        <Tooltip title="Delete Course" placement="left">
                            <IconButton
                                onClick={(e) => {
                                    e.preventDefault();
                                    setDeleteCoursePopupEnabled(true);
                                }}
                                color="error"
                                size="small"
                                sx={{ 
                                    bgcolor: 'error.lighter',
                                    '&:hover': { bgcolor: 'error.light' }
                                }}
                            >
                                <Trash2 size={18} />
                            </IconButton>
                        </Tooltip>
                    ) : (
                        <Tooltip title="Leave Course" placement="left">
                            <IconButton
                                onClick={(e) => {
                                    e.preventDefault();
                                    setLeaveCoursePopupEnabled(true);
                                }}
                                color="primary"
                                size="small"
                                sx={{ 
                                    bgcolor: 'primary.lighter',
                                    '&:hover': { bgcolor: 'primary.light' }
                                }}
                            >
                                <LogOut size={18} />
                            </IconButton>
                        </Tooltip>
                    )}
                    
                    <ChevronRight 
                        className="hover-arrow"
                        size={20}
                        style={{
                            opacity: isHovered ? 1 : 0,
                            transform: `translateX(${isHovered ? 0 : -10}px)`,
                            transition: 'all 0.3s ease',
                            color: '#666'
                        }}
                    />
                </Box>
    
                {/* Keep the dialog components the same */}
                <ConfirmationDialog
                    open={deleteCoursePopupEnabled}
                    title="Delete Course"
                    message="Are you sure you want to delete this course?"
                    onClose={() => setDeleteCoursePopupEnabled(false)}
                    onConfirm={() => {
                        setDeleteCoursePopupEnabled(false);
                        handleDeleteCourse();
                    }}
                />
    
                <ConfirmationDialog
                    open={leaveCoursePopupEnabled}
                    title="Leave Course"
                    message="Are you sure you want to leave this course?"
                    onClose={() => setLeaveCoursePopupEnabled(false)}
                    onConfirm={() => {
                        setLeaveCoursePopupEnabled(false);
                        handleLeaveCourse();
                    }}
                />
            </Card>
        </Fade>
    );
};

export default CourseDetails;