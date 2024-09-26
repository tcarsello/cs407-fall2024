import { useState, useRef, useEffect } from 'react'

import { useCourseContext } from "../../context/CourseContext"
import { useAuthContext } from "../../hooks/UseAuthContext"
import { FlashcardContainer, FlashcardContent } from '../../styles/FlashcardStyles';

import { TextField, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, Grow, IconButton, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight, Flip, Fullscreen, FullscreenExit, SignalCellularNullOutlined } from '@mui/icons-material';

import PopupForm from '../PopupForm'
import Collapsible from '../Collapsible'
import TermComponent from './TermComponent'
import QuestionDetails from './QuestionDetails'

import { GrFormClose, GrEdit } from 'react-icons/gr'

const TopicComponent = ({ topics, setTopics, refresh, activeForm, setActiveForm }) => {

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

    return (
        <div className='content-card'>
            <h2>Course Topics</h2>
            {topics &&
                topics.map(topic => {
                    return (
                        <div key={topic.topicId} className='member-manager'>
                            <p style={{ display: 'inline-block' }}>
                                {topic.topicName}
                            </p>
                            {user.userId === course.coordinatorId &&
                                <>
                                    <GrEdit size='20' style={{ marginLeft: '10px' }} onClick={() => handleEditTopicClick(topic)}/>
                                    <GrFormClose size='25' style={{ marginLeft: '5px' }} onClick={() => {handleDeleteTopics(topic.topicId)}} />
                                </>
                            }
                        </div>
                    )
                })
            }
            {user.userId === course.coordinatorId && <div>
                <button className='standard-button' onClick={() => setActiveForm('createTopic')}>Create Topic</button>
            </div>}

            <PopupForm
                title='Create a New Topic'
                isOpen={activeForm === 'createTopic'}
                onClose={() => {
                    setActiveForm(null)
                    setCreateTopicFormError()
                }}
                onSubmit={handleCreateTopic}
                errorText={createTopicFormError}
            >
                <div>
                    <label>Topic Name:</label>
                    <input
                        type='text'
                        name='topicName'
                        placeholder='Name of the new topic'
                        value={createTopicForm.topicName}
                        onChange={handleCreateTopicFormChange}
                    />
                </div>
            </PopupForm>

            <PopupForm
                title='Update Topic'
                isOpen={activeForm === 'editTopic'}
                onClose={() => setActiveForm(null)}
                onSubmit={handleEditTopic}
                errorText={editTopicFormError}
            >
                <div>
                    <label>Topic Name:</label>
                    <input
                        type='text'
                        name='topicName'
                        placeholder='Name of the new topic'
                        value={editTopicForm.topicName}
                        onChange={handleEditTopicFormChange}
                    />
                </div>
            </PopupForm>
        </div>
    )

}

const FlashcardView = ({ terms }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const flashcardRef = useRef(null);


    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % terms.length);
        }, 300);
    };

    const handlePrevious = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + terms.length) % terms.length);
        }, 300);
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            flashcardRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
    }, []);

    return (
        <Box 
            ref={flashcardRef}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: isFullScreen ? '100vh' : 'auto',
                width: '100%',
                bgcolor: 'background.paper',
            }}
        >
            <FlashcardContainer onClick={handleFlip} sx={{ width: isFullScreen ? '80vw' : '400px', height: isFullScreen ? '60vh' : '250px' }}>
                <FlashcardContent isFlipped={!isFlipped}>
                    <Typography variant={isFullScreen ? "h3" : "h5"}>{terms[currentIndex].termName}</Typography>
                </FlashcardContent>
                <FlashcardContent isFlipped={isFlipped}>
                    <Typography variant={isFullScreen ? "h4" : "body1"}>{terms[currentIndex].termDefinition}</Typography>
                </FlashcardContent>
            </FlashcardContainer>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                <IconButton onClick={handlePrevious} color="primary">
                    <ChevronLeft />
                </IconButton>
                <IconButton onClick={handleFlip} color="primary">
                    <Flip />
                </IconButton>
                <IconButton onClick={handleNext} color="primary">
                    <ChevronRight />
                </IconButton>
                <IconButton onClick={toggleFullScreen} color="primary">
                    {isFullScreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>
            </Box>
            <Typography variant="body2" sx={{ mt: 1 }}>
                {currentIndex + 1} / {terms.length}
            </Typography>
        </Box>
    );
};

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
                            sx={{ mr: 1 }}
                        >
                            {activeForm === 'createTerm' ? 'Cancel' : 'Create Term'}
                        </Button>
                    )}
                    <Button 
                        variant={viewMode === 'list' ? 'contained' : 'outlined'} 
                        onClick={() => setViewMode('list')}
                        sx={{ mr: 1 }}
                    >
                        List View
                    </Button>
                    <Button 
                        variant={viewMode === 'flashcard' ? 'contained' : 'outlined'} 
                        onClick={() => setViewMode('flashcard')}
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

            {viewMode === 'list' || activeForm ? (
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
    )
}

const QuestionsComponent = ({ questions, setQuestions, topics, refresh, activeForm, setActiveForm }) => {

    const { user } = useAuthContext()
    const { course } = useCourseContext()

    const [questionTopicName, setTopicName] = useState('')
    const [questionText, setQuestionText] = useState('')
    const [questionImageFile, setQuestionImageFile] = useState()
    const [questionImageBase64, setQuestionImageBase64] = useState()
    const [createQuestionFormError, setCreateQuestionFormError] = useState()
    const [answerList, setAnswerList] = useState([])

    if (user.userId !== course.coordinatorId) return null

    const resetCreateQuestionForm = () => {
        setTopicName('')
        setQuestionText('')
        setQuestionImageFile()
        setQuestionImageBase64()
        setCreateQuestionFormError()
        setAnswerList([])
    }

    const createQuestionSubmit = async (e) => {
        e.preventDefault()

        try {

            const topic = topics.find(topic => topic.topicName === questionTopicName)
            if (!topic) {
                setCreateQuestionFormError('No such topic')
                return
            }

            const bodyContent = {
                text: questionText,
                topicId: topic.topicId,
                imageMimeType: questionImageFile?.type,
                imageBase64: questionImageBase64,
                answerList
            }

            const response = await fetch(`/api/question/`, {
                method: 'POST',
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                }
            })

            const json = await response.json()
            if (!response.ok) {
                setCreateQuestionFormError(json.error || 'Failed to create question')
                return
            }

            setCreateQuestionFormError()
            setQuestions(prev => [...prev, json.question])

        } catch (err) {
            console.error(err)
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        setQuestionImageFile(file)

        const reader = new FileReader()
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1]
            setQuestionImageBase64(base64)
        }

        if (file) {
            reader.readAsDataURL(file)
        }
    }

    const addAnswerChoice = () => {
        setAnswerList(prev => [...prev, { text: '', isCorrect: false }])
    }

    const handleAnswerChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        setAnswerList(prev => 
            prev.map((answer, i) => 
                i === index 
                    ? { ...answer, [name]: type === 'checkbox' ? checked : value } 
                    : answer
            )
        );
    }

    return (
        <div className='content-card'>
            <h2>Questions</h2>
            <Collapsible
                title='Create Question'
                defaultState={false}
                onCollapse={resetCreateQuestionForm}
            >
                <form className='standard-form' onSubmit={createQuestionSubmit}>
                    <div>
                        <label>Topic Name</label>
                        <input
                            type='text'
                            name='questionTopicName'
                            placeholder='New question topic name'
                            value={questionTopicName}
                            onChange={(e) => setTopicName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Question Text</label>
                        <input
                            type='text'
                            name='questionText'
                            placeholder='Question?'
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Associated Image</label>
                        <input
                            type='file'
                            accept='image/*'
                            onChange={handleFileChange}
                        />
                    </div>
                    <div style={{all: 'unset'}}>
                        <h4>{`Answer Choices (${answerList.length})`}</h4>
                        <button className='standard-button' onClick={addAnswerChoice}>Add Answer Choice</button>
                        {answerList.map((answer, index) => 
                            <div key={index} className='standard-form-div'>
                                <div>
                                    <label>{`Choice ${index + 1}`}</label>
                                    <input
                                        type='checkbox'
                                        name='isCorrect'
                                        value={answer.isCorrect}
                                        onChange={e => handleAnswerChange(index, e)}
                                    />
                                </div>
                                <input
                                    type='text'
                                    name='text'
                                    value={answer.text}
                                    placeholder='Answer option text'
                                    onChange={e => handleAnswerChange(index, e)}
                                    required
                                />
                            </div>
                        )}
                    </div>
                    <button type='submit' className='standard-button'>Create Question</button>
                    {createQuestionFormError && <p className='form-error'>{createQuestionFormError}</p>}
                </form>
            </Collapsible>
            <Collapsible
                title={`View Questions (${questions ? questions.length : 0})`}
                defaultState={false}
            >
                {questions &&
                    questions.map(question =>
                        <QuestionDetails
                            key={question.questionId}
                            question={question}
                            topics={topics}
                            onDelete={() => { setQuestions(questions.filter(q => q.questionId !== question.questionId)) }}
                        />
                    )
                }
            </Collapsible>
        </div>
    )

}

const CourseStudy = () => {
    
    const { user } = useAuthContext()
    const { course } = useCourseContext()
    
    const [topicList, setTopicList] = useState([])
    const [termList, setTermList] = useState([])
    const [questionList, setQuestionList] = useState([])
    const [trigger, setTrigger] = useState(false)

    const [activeForm, setActiveForm] = useState(null)

    const triggerEffect = () => { setTrigger(!trigger) }

    useEffect(() => {

        const fetchTopics = async () => {

            try {

                const response = await fetch(`/api/course/${course.courseId}/topics`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`,
                    }
                })

                const json = await response.json()
                if (json.topics) setTopicList(json.topics)

            } catch (err) {
                console.error(err)
            }

        }

        const fetchTerms = async () => {

            try {

                const response = await fetch(`/api/course/${course.courseId}/terms`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`,
                    }
                })

                const json = await response.json()
                if (json.terms) setTermList(json.terms)

            } catch (err) {
                console.error(err)
            }

        }

        const fetchQuestions = async () => {

            try {

                const response = await fetch(`/api/course/${course.courseId}/questions`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`,
                    }
                })

                const json = await response.json()
                if (json.questions) setQuestionList(json.questions)

            } catch (err) {
                console.error(err)
            }

        }

        if (user && course) {
            fetchTopics()
            fetchTerms()
            fetchQuestions()
        }

    }, [user, course, trigger])

    return (
        <div>
            <TopicComponent
                topics={topicList}
                setTopics={setTopicList}
                refresh={triggerEffect}
                activeForm={activeForm}
                setActiveForm={setActiveForm}
            />
            <TermsComponent
                terms={termList}
                setTerms={setTermList}
                topics={topicList}
                refresh={triggerEffect}
                activeForm={activeForm}
                setActiveForm={setActiveForm}
            />
            <QuestionsComponent
                questions={questionList}
                setQuestions={setQuestionList}
                refresh={triggerEffect}
                topics={topicList}
                activeForm={activeForm}
                setActiveForm={setActiveForm}
            />
        </div>
    )
}

export default CourseStudy