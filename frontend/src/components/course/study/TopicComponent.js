import { useState } from 'react'

import { useAuthContext } from '../../../hooks/UseAuthContext'
import { useCourseContext} from '../../../hooks/UseCourseContext'

import { 
    Paper,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Stack,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    Fade
} from '@mui/material';
import { Edit2, X, Plus, BookOpen } from 'lucide-react';

const TopicComponent = ({ topics, setTopics, refresh, activeForm, setActiveForm, setTopicFilter, topicFilter }) => {

    const { user } = useAuthContext()
    const { course } = useCourseContext()

    const [createTopicForm, setCreateTopicForm] = useState({
        topicName: ''
    })
    const [createTopicFormError, setCreateTopicFormError] = useState()

    const [selectedTopic, setSelectedTopic] = useState()
    const [editTopicForm, setEditTopicForm] = useState({
        topicName: ''
    })
    const [editTopicFormError, setEditTopicFormError] = useState()

    const handleDeleteTopics = async (topicId) => {

        setTopics(topics.filter(item => item.topicId !== topicId))

        try {

            fetch(`/api/topic/${topicId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                }
            }).then(resp => refresh())

        } catch (err) { console.error(err) }

    }

    const handleCreateTopicFormChange = (e) => {
        const { name, value } = e.target
        setCreateTopicForm({
            ...createTopicForm,
            [name]: value
        })
    }

    const handleCreateTopic = async (e) => {
        e.preventDefault()

        try {

            const bodyContent = {
                ...createTopicForm,
                courseId: course.courseId
            }
            const response = await fetch(`/api/topic/`, {
                method: 'POST',
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                }
            })

            const json = await response.json()

            if (!response.ok) {
                setCreateTopicFormError(json.error || 'Failed to create topic')
                return
            }

            setCreateTopicFormError()
            setTopics([...topics, json.topic])
            setActiveForm(null)
            setCreateTopicForm({
                topicName: ''
            })

        } catch (err) {
            console.error(err)
        }
    }

    const handleEditTopicClick = (topic) => {
        setSelectedTopic(topic)
        setEditTopicForm({
            topicName: topic.topicName
        })
        setActiveForm('editTopic')
    }

    const handleEditTopicFormChange = (e) => {
        const { name, value } = e.target
        setEditTopicForm({
            ...editTopicForm,
            [name]: value
        })
    }

    const handleEditTopic = async (e) => {
        e.preventDefault()

        try {

            const response = await fetch(`/api/topic/${selectedTopic.topicId}/`, {
                method: 'PATCH',
                body: JSON.stringify(editTopicForm),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                }
            })

            const json = await response.json()

            if (!response) {
                setEditTopicFormError(json.error || 'Failed to update topic')
                return
            }

            setEditTopicFormError()
            setTopics(prev => prev.map(item => {
                if (item.topicId !== selectedTopic.topicId) return item
                return {
                    ...item,
                    topicName: editTopicForm.topicName
                }
            }))
            setActiveForm(null)
            refresh()

        } catch (err) {
            console.error(err)
        }

    }

    const resetCreateForm = () => {
        setActiveForm(null);
        setCreateTopicFormError(undefined);
        setCreateTopicForm({ topicName: '' });
    };

    const resetEditForm = () => {
        setActiveForm(null);
        setEditTopicFormError(undefined);
        setEditTopicForm({ topicName: '' });
        setSelectedTopic(undefined);
    };

    return (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Stack spacing={3}>
                {/* Header */}
                <Stack direction="row" spacing={2} alignItems="center">
                    <BookOpen size={24} color="#1976d2" />
                    <Typography variant="h5" fontWeight="bold">
                        Course Topics
                    </Typography>
                </Stack>

                {/* Topics List */}
                <List>
                    {topics && topics.map((topic, index) => (
                        <Fade in={true} key={topic.topicId}>
                            <div>
                                <ListItem
                                    sx={{
                                        borderRadius: 1,
                                        '&:hover': {
                                            bgcolor: 'grey.50'
                                        }
                                    }}
                                >
                                    <ListItemText 
                                        primary={topic.topicName}
                                    />
                                    {user.userId === course.coordinatorId && (
                                        <ListItemSecondaryAction>
                                            <IconButton 
                                                onClick={() => handleEditTopicClick(topic)}
                                                size="small"
                                                sx={{ mr: 1 }}
                                            >
                                                <Edit2 size={18} />
                                            </IconButton>
                                            <IconButton 
                                                onClick={() => handleDeleteTopics(topic.topicId)}
                                                size="small"
                                                color="error"
                                            >
                                                <X size={18} />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    )}
                                </ListItem>
                                {index < topics.length - 1 && <Divider />}
                            </div>
                        </Fade>
                    ))}
                </List>

                {/* Coordinator Controls */}
                {user.userId === course.coordinatorId && (
                    <Stack spacing={3}>
                        <Button
                            variant="contained"
                            startIcon={<Plus size={20} />}
                            onClick={() => setActiveForm('createTopic')}
                            sx={{
                                alignSelf: 'flex-start',
                                background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #1976D2 30%, #5E35B1 90%)'
                                }
                            }}
                        >
                            Create Topic
                        </Button>

                        <FormControl fullWidth>
                            <InputLabel>Filter Content By Topic</InputLabel>
                            <Select
                                value={topicFilter}
                                onChange={(e) => setTopicFilter(e.target.value)}
                                label="Filter Content By Topic"
                            >
                                <MenuItem value={-1}>All</MenuItem>
                                {topics && topics.map((topic) => (
                                    <MenuItem key={topic.topicId} value={topic.topicId}>
                                        {topic.topicName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                )}

                {/* Create Topic Dialog */}
                <Dialog 
                    open={activeForm === 'createTopic'} 
                    onClose={resetCreateForm}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle sx={{ 
                        background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                        color: 'white'
                    }}>
                        Create a New Topic
                    </DialogTitle>
                    <form onSubmit={handleCreateTopic}>
                        <DialogContent sx={{ pt: 3 }}>
                            <Stack spacing={3}>
                                {createTopicFormError && (
                                    <Alert severity="error">
                                        {createTopicFormError}
                                    </Alert>
                                )}
                                <TextField
                                    fullWidth
                                    label="Topic Name"
                                    name="topicName"
                                    value={createTopicForm.topicName}
                                    onChange={handleCreateTopicFormChange}
                                    required
                                />
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ p: 3 }}>
                            <Button onClick={resetCreateForm}>Cancel</Button>
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
                                Create Topic
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

                {/* Edit Topic Dialog */}
                <Dialog 
                    open={activeForm === 'editTopic'} 
                    onClose={resetEditForm}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle sx={{ 
                        background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                        color: 'white'
                    }}>
                        Update Topic
                    </DialogTitle>
                    <form onSubmit={handleEditTopic}>
                        <DialogContent sx={{ pt: 3 }}>
                            <Stack spacing={3}>
                                {editTopicFormError && (
                                    <Alert severity="error">
                                        {editTopicFormError}
                                    </Alert>
                                )}
                                <TextField
                                    fullWidth
                                    label="Topic Name"
                                    name="topicName"
                                    value={editTopicForm.topicName}
                                    onChange={handleEditTopicFormChange}
                                    required
                                />
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ p: 3 }}>
                            <Button onClick={resetEditForm}>Cancel</Button>
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
                                Update Topic
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </Stack>
        </Paper>
    );
};

export default TopicComponent;