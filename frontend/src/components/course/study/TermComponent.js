import { useState, useCallback } from 'react';
import { useCourseContext } from "../../../context/CourseContext";
import { useAuthContext } from "../../../hooks/UseAuthContext";
import { Edit2, X } from 'lucide-react';
import { 
    Paper,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Autocomplete,
    Box,
    Stack,
    Alert,
    Chip,
    Fade
} from '@mui/material';

const TermComponent = ({ term, topics, onDelete, onEdit }) => {
    const { user } = useAuthContext();
    const { course } = useCourseContext();

    const topicName = topics.find(t => t.topicId === term.topicId)?.topicName || 'No Topic';

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        ...term,
        topicName
    });
    const [error, setError] = useState();

    const resetForm = useCallback(() => {
        setEditDialogOpen(false);
        setError(undefined);
        setEditForm({
            ...term,
            topicName
        });
    }, [term, topicName]);

    const handleDelete = async () => {
        try {
            await fetch(`/api/term/${term.termId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                }
            });
            onDelete();
        } catch (err) {
            console.error(err);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTopicChange = (event, newValue) => {
        setEditForm(prev => ({
            ...prev,
            topicName: newValue
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const topic = topics.find(topic => topic.topicName === editForm.topicName);
            if (!topic) {
                setError('No such topic');
                return;
            }

            const bodyContent = {
                ...editForm,
                topicId: topic.topicId
            };

            const response = await fetch(`/api/term/${term.termId}`, {
                method: 'PATCH',
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                }
            });

            const json = await response.json();

            if (!response.ok) {
                setError(json.error || 'Failed to edit term');
                return;
            }

            resetForm();
            onEdit();
        } catch (err) {
            console.error(err);
            setError('An error occurred while updating the term');
        }
    };

    return (
        <Fade in={true}>
            <Paper 
                elevation={1}
                sx={{ 
                    p: 2, 
                    mb: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 2
                    }
                }}
            >
                <Stack direction="row" alignItems="flex-start" spacing={2}>
                    <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="h6" component="h3">
                                {term.termName}
                            </Typography>
                            <Chip 
                                label={topicName}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        </Stack>
                        <Typography variant="body1" color="text.secondary">
                            {term.termDefinition}
                        </Typography>
                    </Box>
                    
                    {user.userId === course.coordinatorId && (
                        <Stack direction="row">
                            <IconButton 
                                onClick={() => setEditDialogOpen(true)}
                                size="small"
                                color="primary"
                            >
                                <Edit2 size={18} />
                            </IconButton>
                            <IconButton 
                                onClick={handleDelete}
                                size="small"
                                color="error"
                            >
                                <X size={18} />
                            </IconButton>
                        </Stack>
                    )}
                </Stack>

                {/* Edit Dialog */}
                <Dialog
                    open={editDialogOpen}
                    onClose={resetForm}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle sx={{ 
                        background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                        color: 'white'
                    }}>
                        Edit Term
                    </DialogTitle>
                    <form onSubmit={handleSubmit}>
                        <DialogContent sx={{ pt: 3 }}>
                            <Stack spacing={3}>
                                {error && (
                                    <Alert severity="error">
                                        {error}
                                    </Alert>
                                )}
                                
                                <Autocomplete
                                    value={editForm.topicName}
                                    onChange={handleTopicChange}
                                    options={topics.map(topic => topic.topicName)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Topic"
                                            required
                                        />
                                    )}
                                />
                                
                                <TextField
                                    fullWidth
                                    label="Term Name"
                                    name="termName"
                                    value={editForm.termName}
                                    onChange={handleFormChange}
                                    required
                                />
                                
                                <TextField
                                    fullWidth
                                    label="Definition"
                                    name="termDefinition"
                                    value={editForm.termDefinition}
                                    onChange={handleFormChange}
                                    multiline
                                    rows={3}
                                    required
                                />
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ p: 3 }}>
                            <Button onClick={resetForm}>
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
                                Save Changes
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </Paper>
        </Fade>
    );
};

export default TermComponent;