import { useState, useEffect } from 'react';
import { useCourseContext } from "../../context/CourseContext";
import { useAuthContext } from "../../hooks/UseAuthContext";
import { 
    Container, 
    Box, 
    Typography, 
    Stack,
    Paper,
    Grid,
    CardContent,
    CardHeader,
} from '@mui/material';
import { Home, Users, Calendar } from 'lucide-react';
import CourseAnnouncements from './CourseAnnouncements';

const CourseHome = () => {
    const { user } = useAuthContext();
    const { course } = useCourseContext();
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await fetch(`/api/course/${course.courseId}/members`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                const json = await response.json();
                if (json.members) {
                    setMembers(json.members);
                }
            } catch (err) {
                console.error(err);
            }
        };

        if (user && course) {
            fetchMembers();
        }
    }, [user, course]);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Home size={32} color="#1976d2" />
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        Course Home
                    </Typography>
                </Stack>
            </Box>

            <Grid container spacing={3}>
                {/* Main Content Area - Announcements */}
                <Grid item xs={12} lg={8}>
                    <CourseAnnouncements />
                </Grid>

                {/* Sidebar */}
                <Grid item xs={12} lg={4}>
                    <Stack spacing={3}>
                        {/* Calendar Card */}
                        <Paper elevation={2} sx={{ borderRadius: 2 }}>
                            <CardHeader 
                                title={
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Calendar size={20} />
                                        <Typography variant="h6">
                                            Upcoming Events
                                        </Typography>
                                    </Stack>
                                }
                                sx={{ pb: 1 }}
                            />
                            <CardContent>
                                <Stack spacing={2}>
                                    {/* Placeholder for upcoming events/calendar
                                        We can replace this with actual calendar implementation if we want */}
                                    <Typography variant="body2" color="text.secondary">
                                        No upcoming events
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </Paper>

                        {/* Members Card */}
                        <Paper elevation={2} sx={{ borderRadius: 2 }}>
                            <CardHeader
                                title={
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Users size={20} />
                                        <Typography variant="h6">
                                            Course Members
                                        </Typography>
                                    </Stack>
                                }
                                subheader={`${members.length} members`}
                                sx={{ pb: 1 }}
                            />
                            <CardContent>
                                {members.length > 0 ? (
                                    <Stack spacing={1}>
                                        {members.map((member) => (
                                            <Box 
                                                key={member.userId}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <Typography variant="body2">
                                                    {member.firstName} {member.lastName}
                                                </Typography>
                                                {member.userId === course?.coordinatorId && (
                                                    <Typography 
                                                        variant="caption"
                                                        sx={{ color: 'primary.main' }}
                                                    >
                                                        Coordinator
                                                    </Typography>
                                                )}
                                            </Box>
                                        ))}
                                    </Stack>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No members found
                                    </Typography>
                                )}
                            </CardContent>
                        </Paper>
                    </Stack>
                </Grid>
            </Grid>
        </Container>
    );
};

export default CourseHome;