import React, { useState, useEffect } from 'react';
import { useCourseContext } from "../../context/CourseContext";
import { useAuthContext } from "../../hooks/UseAuthContext";
import { TextField, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { DragHandle as DragIcon, Delete as DeleteIcon } from '@mui/icons-material';

const CourseStudyManager = () => {
    const [isStudyTermVisible, setIsStudyTermVisible] = useState(false);
    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

    const handleCreateStudyTerm = () => {
        setIsStudyTermVisible(true);
    };

    const handleCancel = () => {
        setShowCancelConfirmation(true);
    };

    const handleCancelConfirm = () => {
        setIsStudyTermVisible(false);
        setShowCancelConfirmation(false);
    };

    const handleCancelClose = () => {
        setShowCancelConfirmation(false);
    };

    return (
        <div className="content-card">
            <h2>Study Terms</h2>
            {!isStudyTermVisible && (
                <Button variant="contained" color="primary" onClick={handleCreateStudyTerm}>
                    Create New Study Terms
                </Button>
            )}
            {isStudyTermVisible && (
                <div>
                    <CourseStudy />
                    <Button variant="outlined" onClick={handleCancel}>
                        Cancel
                    </Button>
                </div>
            )}
            <Dialog open={showCancelConfirmation} onClose={handleCancelClose}>
                <DialogTitle>Cancel Study Term Creation</DialogTitle>
                <DialogContent>
                    Are you sure you want to cancel? Any unsaved changes will be lost.
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelClose}color="primar y">
                        No, Keep Editing
                    </Button>
                    <Button onClick={handleCancelConfirm}>
                        Yes, Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

const CourseStudy = () => {
    const { course } = useCourseContext();
    const { user } = useAuthContext();

    const [topics, setTopics] = useState([]);
    const [newTopic, setNewTopic] = useState({
        topicName: '',
    });

    const [newTerm, setNewTerm] = useState({
        termName: '',
        termDefinition: '',
    });

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await fetch(`/api/course/${course.courseId}/topics`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`,
                    },
                });
                const data = await response.json();
                setTopics(data.topics);
            } catch (error) {
                console.error('Error fetching topics:', error);
            }
        };

        if (course.courseId) {
            fetchTopics();
        }
    }, [course.courseId, user.token]);

    const handleTopicChange = (e) => {
        setNewTopic({ ...newTopic, topicName: e.target.value });
    };

    const handleTermChange = (e) => {
        setNewTerm({ ...newTerm, termName: e.target.value });
    };

    const handleDefinitionChange = (e) => {
        setNewTerm({ ...newTerm, termDefinition: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const topicResponse = await fetch(`/api/course/${course.courseId}/topics`, {
                method: 'POST',
                body: JSON.stringify(newTopic),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
            });

            const createdTopic = await topicResponse.json();

            const termResponse = await fetch(`/api/course/${course.courseId}/topics/${createdTopic.topicId}/terms`, {
                method: 'POST',
                body: JSON.stringify(newTerm),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
            });

            const createdTerm = await termResponse.json();

            setTopics([...topics, { ...createdTopic, terms: [createdTerm] }]);
            setNewTopic({ topicName: '' });
            setNewTerm({ termName: '', termDefinition: '' });

        } catch (error) {
            console.error('Error creating topic and term:', error);
        }
    };

    const handleDelete = async (termId) => {
            // TODO: Logic to handle term deletion
        };

    return (
        <div className="content-card">
            <h2>Create Study Terms</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
                <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                        label="Topic Name"
                        value={newTopic.topicName}
                        onChange={handleTopicChange}
                        required
                        fullWidth
                    />
                    <Box display="flex" alignItems="center" gap={2}>
                        <TextField
                            label="Term"
                            value={newTerm.term}
                            onChange={handleTermChange}
                            required
                            fullWidth
                        />
                        <Box display="flex" alignItems="center" gap={1}>
                            <IconButton disabled>
                                <DragIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(-1)}>
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    </Box>
                    <TextField
                        label="Definition"
                        value={newTerm.definition}
                        onChange={handleDefinitionChange}
                        multiline
                        rows={4}
                        required
                        fullWidth
                    />
                    <Button variant="contained" color="primary" type="submit">
                        Add Term
                    </Button>
                </Box>
            </form>

            <Box display="flex" flexDirection="column" gap={2}>
                {topics.map((topic) => (
                    <Box key={topic.topicId} className="tdkdyew">
                        <h3>{topic.topicName}</h3>
                        {topic.terms?.map((term, index) => (
                            <Box key={index} className="tdkdyew" data-term-luid={`term-${index}`}>
                                <Box className="TermRow t1ewc4qf">
                                    <Box className="TermText bidlgnh bcuxhjr">{term.termName}</Box>
                                    <Box className="TermText bidlgnh bvisa2s">
                                        {term.termDefinition}
                                    </Box>
                                    <Box className="TermContent has-richTextToolbar">
                                        <IconButton disabled>
                                            <DragIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(term.termId)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                ))}
            </Box>
        </div>
    );
};

export default CourseStudyManager;