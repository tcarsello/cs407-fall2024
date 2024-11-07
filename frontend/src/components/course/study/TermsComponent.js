import { useState } from 'react';
import { useAuthContext } from '../../../hooks/UseAuthContext';
import { useCourseContext } from '../../../hooks/UseCourseContext';
import FlashcardView from './FlashcardView';
import TermComponent from './TermComponent';
import { 
    Box,
    Container,
    Typography,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    Paper,
    Alert,
    Fade,
    Autocomplete
} from '@mui/material';
import { Plus, List, LayoutGrid, X }from 'lucide-react';

const TermsComponent = ({ terms, setTerms, topics, refresh, activeForm, setActiveForm }) => {
    const { user } = useAuthContext();
    const { course } = useCourseContext();
    
    const [viewMode, setViewMode] = useState('list');
    const [createTermForm, setCreateTermForm] = useState({
        topicName: '',
        termName: '',
        termDefinition: ''
    });
    const [createTermFormError, setCreateTermFormError] = useState();
    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

    const handleCreateTermFormChange = (e) => {
        const { name, value } = e.target;
        setCreateTermForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateTerm = async (e) => {
        e.preventDefault();
        try {
            const topic = topics.find(topic => topic.topicName === createTermForm.topicName);
            if (!topic) {
                setCreateTermFormError('No such topic');
                return;
            }

            const bodyContent = {
                ...createTermForm,
                topicId: topic.topicId
            };

            const response = await fetch(`/api/term/`, {
                method: 'POST',
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                }
            });

            const json = await response.json();

            if (!response.ok) {
                setCreateTermFormError(json.error || 'Failed to create term');
                return;
            }

            setCreateTermFormError(undefined);
            setCreateTermForm({
                topicId: '',
                termName: '',
                termDefinition: ''
            });
            setActiveForm(null);
            setTerms(prev => [...prev, json.term]);

        } catch (err) {
            console.error(err);
            setCreateTermFormError('An error occurred while creating the term');
        }
    };

    const handleCancel = () => {
        if (createTermForm.termName || createTermForm.termDefinition || createTermForm.topicName) {
            setShowCancelConfirmation(true);
        } else {
            setActiveForm(null);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Stack 
                    direction="row" 
                    justifyContent="space-between" 
                    alignItems="center" 
                    sx={{ mb: 3 }}
                >
                    <Typography variant="h4" fontWeight="bold">
                        Study Terms
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        {user.userId === course.coordinatorId && (
                            <Button
                                variant="contained"
                                startIcon={activeForm === 'createTerm' ? <X /> : <Plus />}
                                onClick={() => setActiveForm(activeForm ? null : 'createTerm')}
                                sx={{
                                    background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                                    color: 'white',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #1976D2 30%, #5E35B1 90%)'
                                    }
                                }}
                            >
                                {activeForm === 'createTerm' ? 'Cancel' : 'Create Term'}
                            </Button>
                        )}
                        <Button
                            variant={viewMode === 'list' ? 'contained' : 'outlined'}
                            startIcon={<List size={18} />}
                            onClick={() => setViewMode('list')}
                        >
                            List View
                        </Button>
                        <Button
                            variant={viewMode === 'flashcard' ? 'contained' : 'outlined'}
                            startIcon={<LayoutGrid size={18} />} // Changed to LayoutGrid icon
                            onClick={() => setViewMode('flashcard')}
                        >
                            Flashcard View
                        </Button>
                    </Stack>
                </Stack>

                {/* Create Term Form */}
                {activeForm === 'createTerm' && (
                    <Fade in={true}>
                        <Paper 
                            elevation={3} 
                            sx={{ 
                                p: 3, 
                                mb: 4, 
                                borderRadius: 2,
                                background: 'linear-gradient(to right bottom, rgba(33, 150, 243, 0.05), rgba(103, 58, 183, 0.05))'
                            }}
                        >
                            <Typography variant="h5" fontWeight="medium" sx={{ mb: 3 }}>
                                Create New Term
                            </Typography>
                            <form onSubmit={handleCreateTerm}>
                                <Stack spacing={3}>
                                    <Autocomplete
                                        options={topics.map(topic => topic.topicName)}
                                        value={createTermForm.topicName}
                                        onChange={(_, newValue) => {
                                            setCreateTermForm(prev => ({
                                                ...prev,
                                                topicName: newValue || ''
                                            }));
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Topic"
                                                name="topicName"
                                                required
                                                fullWidth
                                            />
                                        )}
                                    />
                                    <TextField
                                        label="Term"
                                        name="termName"
                                        value={createTermForm.termName}
                                        onChange={handleCreateTermFormChange}
                                        required
                                        fullWidth
                                    />
                                    <TextField
                                        label="Definition"
                                        name="termDefinition"
                                        value={createTermForm.termDefinition}
                                        onChange={handleCreateTermFormChange}
                                        multiline
                                        rows={4}
                                        required
                                        fullWidth
                                    />

                                    {createTermFormError && (
                                        <Alert severity="error">
                                            {createTermFormError}
                                        </Alert>
                                    )}

                                    <Stack direction="row" justifyContent="flex-end" spacing={2}>
                                        <Button onClick={handleCancel}>
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
                                            Add Term
                                        </Button>
                                    </Stack>
                                </Stack>
                            </form>
                        </Paper>
                    </Fade>
                )}

                {/* Terms List/Flashcard View */}
                <Box sx={{ mt: 2 }}>
                    {viewMode === 'list' ? (
                        <Stack spacing={2}>
                            {terms && terms.map(term => (
                                <Fade in={true} key={term.termId}>
                                    <div>
                                        <TermComponent
                                            term={term}
                                            topics={topics}
                                            onDelete={() => {
                                                setTerms(prev => prev.filter(item => item.termId !== term.termId));
                                            }}
                                            onEdit={refresh}
                                        />
                                    </div>
                                </Fade>
                            ))}
                        </Stack>
                    ) : (
                        <FlashcardView terms={terms} />
                    )}
                </Box>
            </Paper>

            {/* Cancel Confirmation Dialog */}
            <Dialog 
                open={showCancelConfirmation} 
                onClose={() => setShowCancelConfirmation(false)}
                PaperProps={{
                    sx: { borderRadius: 2 }
                }}
            >
                <DialogTitle sx={{ 
                    background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                    color: 'white'
                }}>
                    Cancel Term Creation
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography>
                        Are you sure you want to cancel? Any unsaved changes will be lost.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setShowCancelConfirmation(false)}>
                        Keep Editing
                    </Button>
                    <Button 
                        onClick={() => {
                            setActiveForm(null);
                            setShowCancelConfirmation(false);
                        }}
                        variant="contained"
                        color="error"
                    >
                        Yes, Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default TermsComponent;