import { useState } from 'react'

import { useAuthContext } from '../../../hooks/UseAuthContext';
import { useCourseContext } from '../../../hooks/UseCourseContext';

import FlashcardView from './FlashcardView'
import TermComponent from './TermComponent'

import { TextField, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography } from '@mui/material';

const TermsComponent = ({ terms, setTerms, topics, refresh, activeForm, setActiveForm }) => {
    
    const { user } = useAuthContext()
    const { course } = useCourseContext()
    
    const [viewMode, setViewMode] = useState('list');
    const [createTermForm, setCreateTermForm] = useState({
        topicName: '',
        termName: '',
        termDefinition: ''
    })
    const [createTermFormError, setCreateTermFormError] = useState()
    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

    
    const handleCreateTermFormChange = (e) => {
        const { name, value } = e.target
        setCreateTermForm({
            ...createTermForm,
            [name]: value
        })
    }

    const handleCreateTerm = async (e) => {
        e.preventDefault()
        try {

            const topic = topics.find(topic => topic.topicName === createTermForm.topicName)
            if (!topic) {
                setCreateTermFormError('No such topic')
                return
            }

            const bodyContent = {
                ...createTermForm,
                topicId: topic.topicId
            }

            const response = await fetch(`/api/term/`, {
                method: 'POST',
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                }
            })

            const json = await response.json()

            if (!response.ok) {
                setCreateTermFormError(json.error || 'Failed to create term')
                return
            }

            setCreateTermFormError()
            setCreateTermForm({
                topicId: '',
                termName: '',
                termDefinition: ''
            })
            setActiveForm(null)
            setTerms(prev => [...prev, json.term])

        } catch (err) {
            console.error(err)
        }
    }

    const handleCancel = () => {
        setShowCancelConfirmation(true);
    };

    const handleCancelConfirm = () => {
        setActiveForm(null)
        setShowCancelConfirmation(false);
    };

    return (
        <Box className='content-card'>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">Study Terms</Typography>
                <Box>
                    {user.userId === course.coordinatorId && (
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={() => setActiveForm(activeForm ? null : 'createTerm')}
                            style={{ position: 'unset' }}
                            sx={{ mr: 1 }}
                        >
                            {activeForm === 'createTerm' ? 'Cancel' : 'Create Term'}
                        </Button>
                    )}
                    <Button 
                        variant={viewMode === 'list' ? 'contained' : 'outlined'} 
                        onClick={() => setViewMode('list')}
                        style={{ position: 'unset' }}
                        sx={{ mr: 1 }}
                    >
                        List View
                    </Button>
                    <Button 
                        variant={viewMode === 'flashcard' ? 'contained' : 'outlined'} 
                        onClick={() => setViewMode('flashcard')}
                        style={{ position: 'unset' }}
                    >
                        Flashcard View
                    </Button>
                </Box>
            </Box>

            {activeForm === 'createTerm' && (
                <Box sx={{ mb: 4, p: 2, border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Create New Term</Typography>
                    <form onSubmit={handleCreateTerm}>
                        <Box display="flex" flexDirection="column" gap={2}>
                            <TextField
                                label="Name of this term's topic"
                                name="topicName"
                                value={createTermForm.topicName}
                                onChange={handleCreateTermFormChange}
                                required
                                fullWidth
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
                        </Box>
                        {createTermFormError && (
                            <Typography color="error" sx={{ mt: 2 }}>{createTermFormError}</Typography>
                        )}
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button onClick={handleCancel} sx={{ mr: 1 }}>Cancel</Button>
                            <Button type="submit" variant="contained" color="primary">Add Term</Button>
                        </Box>
                    </form>
                </Box>
            )}
            <Box sx={{ mt: 2 }}>
                {viewMode === 'list' ? (
                    <Box>
                        {terms && terms.map(term =>
                            <TermComponent
                                key={term.termId}
                                term={term}
                                topics={topics}
                                onDelete={() => {setTerms(prev => prev.filter(item => item.termId !== term.termId))}}
                                onEdit={refresh}
                            />
                        )}
                    </Box>
                ) : (
                    <FlashcardView terms={terms} />
                )}
            </Box>
            <Dialog open={showCancelConfirmation} onClose={handleCancelConfirm}>
                <DialogTitle>Cancel Study Term Creation</DialogTitle>
                <DialogContent>
                    Are you sure you want to cancel? Any unsaved changes will be lost.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowCancelConfirmation(false)} color="primary">
                        No, Keep Editing
                        </Button>
                    <Button onClick={handleCancelConfirm}>
                        Yes, Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default TermsComponent
