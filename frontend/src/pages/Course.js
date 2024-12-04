import { useState, useEffect } from 'react'

import { CourseProvider, useCourseContext } from "../context/CourseContext"

import '../css/course.css'
import { useAuthContext } from '../hooks/UseAuthContext'
import CourseHome from '../components/course/CourseHome'
import CourseStudy from '../components/course/CourseStudy'
import CourseGames from '../components/course/CourseGames'
import CourseDiscussion from '../components/course/CourseDiscussion'
import CourseMembers from '../components/course/CourseMembers'
import CourseSettings from '../components/course/CourseSettings'

import { 
    Box, 
    Drawer, 
    IconButton, 
    Typography, 
    Paper,
    Stack,
    Tooltip,
    CircularProgress,
    Alert,
    Divider
} from '@mui/material';
import { 
    Home,
    BookOpen,
    GamepadIcon,
    MessageSquare,
    Users,
    Settings,
    ChartBar
} from 'lucide-react';
import CourseGameStats from '../components/course/CourseGameStats'

const Course = () => {

    return (
        <CourseProvider>
            <CourseHomeContent />
        </CourseProvider>
    );

};

const CourseHomeContent = () => {
    
    const drawerWidth = 80;
    const navbarHeight = 64;

    const navItems = [
        { id: 'Home', icon: Home, label: 'Home' },
        { id: 'Study', icon: BookOpen, label: 'Study Materials' },
        { id: 'Games', icon: GamepadIcon, label: 'Games' },
        { id: 'Discussion', icon: MessageSquare, label: 'Discussion' },
        { id: 'Course Members', icon: Users, label: 'Members' },
        { id: 'Game Stats', icon: ChartBar, label: 'Game Stats'},
    ];

    const { user } = useAuthContext()
    const { course, loading, error } = useCourseContext()

    const [mainComponent, setMainComponent] = useState('Home')

    const [coordinator, setCoordinator] = useState()
    const [keyValue, setKeyValue] = useState(0)

    useEffect(() => {

        if (course) {
            try {
                fetch(`/api/user/${course.coordinatorId}/public`, {
                    method: 'GET'
                })
                    .then(response => response.json())
                    .then(json => setCoordinator(json))
            } catch (err) {
                console.log(err)
            }
        }

    }, [course])

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!course) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="info">No course data available</Alert>
            </Box>
        );
    }

    const renderMainComponent = () => {
        switch (mainComponent) {
            case 'Study': return <CourseStudy />;
            case 'Games': return <CourseGames />;
            case 'Discussion': return <CourseDiscussion />;
            case 'Course Members': return <CourseMembers />;
            case 'Settings': return <CourseSettings />;
            case 'Game Stats': return <CourseGameStats />;
            case 'Home':
            default: return <CourseHome />;
        }
    };

    return (
        <Box sx={{ 
            display: 'flex', 
            minHeight: `calc(100vh - ${navbarHeight}px)`,
            mt: `${navbarHeight}px`
        }}>
            {/* Sidebar Navigation */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        background: 'linear-gradient(180deg, #2196F3 0%, #673AB7 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        py: 2,
                        gap: 1,
                        height: `calc(100vh - ${navbarHeight}px)`,
                        top: `${navbarHeight}px`,
                        borderRight: '1px solid rgba(0, 0, 0, 0.12)'
                    },
                }}
            >
                <Stack spacing={1} alignItems="center" sx={{ width: '100%' }}>
                    {navItems.map((item) => (
                        <Tooltip key={item.id} title={item.label} placement="right">
                            <IconButton
                                onClick={() => {setKeyValue(keyValue + 1); setMainComponent(item.id);}}
                                sx={{
                                    color: mainComponent === item.id ? 'white' : 'rgba(255,255,255,0.7)',
                                    backgroundColor: mainComponent === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                    },
                                    width: '48px',
                                    height: '48px',
                                }}
                            >
                                <item.icon size={24} />
                            </IconButton>
                        </Tooltip>
                    ))}
                    {user.userId === course.coordinatorId && (
                        <Tooltip title="Settings" placement="right">
                            <IconButton
                                onClick={() => {setKeyValue(keyValue + 1); setMainComponent('Settings');}}
                                sx={{
                                    color: mainComponent === 'Settings' ? 'white' : 'rgba(255,255,255,0.7)',
                                    backgroundColor: mainComponent === 'Settings' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                    },
                                    width: '48px',
                                    height: '48px',
                                }}
                            >
                                <Settings size={24} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
            </Drawer>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1 }}>
                {/* Header */}
                <Paper 
                    elevation={2}
                    sx={{ 
                        p: 3, 
                        background: 'white',
                        position: 'sticky',
                        top: navbarHeight,
                        zIndex: 1
                    }}
                >
                    <Stack 
                        direction="row" 
                        justifyContent="space-between" 
                        alignItems="center"
                        spacing={2}
                    >
                        <Box>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                {course.courseName}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="subtitle1" color="text.secondary">
                                    {mainComponent}
                                </Typography>
                                <Divider orientation="vertical" flexItem />
                                <Typography variant="body2" color="text.secondary">
                                    {course.courseDescription}
                                </Typography>
                            </Stack>
                        </Box>
                        <Paper 
    elevation={1}
    sx={{ 
        p: 2, 
        background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
        borderRadius: 2,
        minWidth: 200
    }}
>
    <Typography variant="subtitle2" color="white" sx={{ opacity: 0.8 }} gutterBottom>
        Course Coordinator
    </Typography>
    {coordinator && (
        <Typography variant="body1" color="white" fontWeight="medium">
            {`${coordinator.firstName} ${coordinator.lastName}`}
        </Typography>
    )}
</Paper>
                    </Stack>
                </Paper>

                {/* Page Content */}
                <Box sx={{ p: 3 }} key={keyValue}>
                    {renderMainComponent()}
                </Box>
            </Box>
        </Box>
    );
};

export default Course;