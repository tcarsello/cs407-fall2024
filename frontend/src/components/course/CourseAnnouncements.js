import { useState, useEffect } from 'react';
import { useCourseContext } from "../../context/CourseContext";
import { useAuthContext } from "../../hooks/UseAuthContext";
import { 
    Box, 
    Typography, 
    Stack,
    Paper,
    Button,
    CardContent,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Switch,
    FormControlLabel,
    Alert,
    IconButton,
} from '@mui/material';
import { Megaphone, Plus, X } from 'lucide-react';

const CourseAnnouncements = () => {
    const { user } = useAuthContext();
    const { course } = useCourseContext();
    
    const [announcements, setAnnouncements] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        public: true
    });

    useEffect(() => {
        
        const fetchAnnouncements = async () => {
            if (!course?.courseId || !user?.token) {
                setIsLoading(false);
                return;
            }
            
            try {
                setIsLoading(true);
                setError('');

                const publicResponse = await fetch(`/api/course/${course.courseId}/announcements/public`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });

                const privateResponse = await fetch(`/api/course/${course.courseId}/announcements/private`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });

                if (!publicResponse.ok || !privateResponse.ok) {
                    throw new Error('Failed to fetch announcements');
                }

                let publicAnnouncements = [];
                let privateAnnouncements = [];

                const publicContentType = publicResponse.headers.get('content-type');
                if (publicContentType && publicContentType.includes('application/json')) {
                    const publicData = await publicResponse.json();
                    publicAnnouncements = publicData.announcements || [];
                }

                const privateContentType = privateResponse.headers.get('content-type');
                if (privateContentType && privateContentType.includes('application/json')) {
                    const privateData = await privateResponse.json();
                    privateAnnouncements = privateData.announcements || [];
                }

                const allAnnouncements = [...publicAnnouncements, ...privateAnnouncements];
                
                if (allAnnouncements.length > 0) {
                    allAnnouncements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                }
                
                setAnnouncements(allAnnouncements);
                
            } catch (err) {
                if (err.message !== 'Unexpected end of JSON input') {
                    setError('Failed to fetch announcements');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnnouncements();
    }, [user, course]);

    const handleCreateAnnouncement = async () => {
        try {
            const response = await fetch('/api/announcement', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    courseId: course.courseId,
                    title: formData.title,
                    body: formData.body,
                    public: formData.public
                })
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create announcement');
            }

            const json = await response.json();
            setAnnouncements(prev => [json.announcement, ...prev]);
            setIsDialogOpen(false);
            setFormData({ title: '', body: '', public: true });
            setError('');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to create announcement');
        }
    };

    const handleDeleteAnnouncement = async (announcementId) => {
        try {
            const response = await fetch(`/api/announcement/${announcementId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete announcement');
            }

            setAnnouncements(prev => prev.filter(a => a.announcementId !== announcementId));
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to delete announcement');
        }
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Megaphone size={24} color="#1976d2" />
                        <Typography variant="h5" fontWeight="bold">
                            Announcements
                        </Typography>
                    </Stack>
                    
                    {course?.coordinatorId === user?.userId && (
                        <Button 
                            variant="contained"
                            color="primary"
                            startIcon={<Plus size={20} />}
                            onClick={() => setIsDialogOpen(true)}
                        >
                            New Announcement
                        </Button>
                    )}
                </Stack>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Announcements List */}
            {isLoading ? (
                <Typography variant="body1" color="text.secondary" align="center">
                    Loading announcements...
                </Typography>
            ) : announcements.length > 0 ? (
                <Stack spacing={2}>
                    {announcements.map((announcement) => (
                        <Paper 
                            key={announcement.announcementId} 
                            elevation={1}
                            sx={{ borderRadius: 2 }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                                            {announcement.title}
                                        </Typography>
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                            {announcement.body}
                                        </Typography>
                                    </Box>
                                    {course?.coordinatorId === user?.userId && (
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteAnnouncement(announcement.announcementId)}
                                            sx={{ color: 'error.main', ml: 2 }}
                                        >
                                            <X size={20} />
                                        </IconButton>
                                    )}
                                </Box>
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    mt: 2,
                                    pt: 2,
                                    borderTop: '1px solid',
                                    borderColor: 'divider',
                                    color: 'text.secondary'
                                }}>
                                    <Typography variant="caption">
                                        {new Date(announcement.createdAt).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="caption">
                                        {announcement.public ? 'Public' : 'Private'}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Paper>
                    ))}
                </Stack>
            ) : (
                <Paper 
                    elevation={1} 
                    sx={{ 
                        borderRadius: 2, 
                        p: 4, 
                        textAlign: 'center',
                        backgroundColor: 'background.default'
                    }}
                >
                    <Typography variant="body1" color="text.secondary">
                        No announcements yet
                    </Typography>
                    {course?.coordinatorId === user?.userId && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Click the "New Announcement" button to create one
                        </Typography>
                    )}
                </Paper>
            )}

            {/* Create Announcement Dialog */}
            <Dialog 
                open={isDialogOpen} 
                onClose={() => setIsDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Create New Announcement</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <TextField
                            label="Title"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            fullWidth
                        />
                        <TextField
                            label="Message"
                            value={formData.body}
                            onChange={(e) => setFormData({...formData, body: e.target.value})}
                            multiline
                            rows={4}
                            fullWidth
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.public}
                                    onChange={(e) => setFormData({...formData, public: e.target.checked})}
                                />
                            }
                            label="Make announcement public"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button 
                        variant="contained"
                        onClick={handleCreateAnnouncement}
                        disabled={!formData.title || !formData.body}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CourseAnnouncements;