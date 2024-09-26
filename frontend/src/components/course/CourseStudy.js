import { useState, useEffect } from 'react'

import { useCourseContext } from "../../context/CourseContext"
import { useAuthContext } from "../../hooks/UseAuthContext"

import { TextField, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { DragHandle as DragIcon, Delete as DeleteIcon } from '@mui/icons-material';

import PopupForm from '../PopupForm'
import Collapsible from '../Collapsible'
import TermComponent from './TermComponent'
import QuestionDetails from './QuestionDetails'

import { GrFormClose, GrEdit } from 'react-icons/gr'

const TopicComponent = ({ topics, setTopics, refresh }) => {

    const { user } = useAuthContext()
    const { course } = useCourseContext()

    const [createTopicEnabled, setCreateTopicEnabled] = useState(false)
    const [createTopicForm, setCreateTopicForm] = useState({
        topicName: ''
    })
    const [createTopicFormError, setCreateTopicFormError] = useState()

    const [selectedTopic, setSelectedTopic] = useState()
    const [editTopicEnabled, setEditTopicEnabled] = useState(false)
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
            setCreateTopicEnabled(false)
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
        setEditTopicEnabled(true)
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
            setEditTopicEnabled(false)
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
                <button className='standard-button' onClick={() => setCreateTopicEnabled(true)}>Create Topic</button>
            </div>}

            <PopupForm
                title='Create a New Topic'
                isOpen={createTopicEnabled}
                onClose={() => {
                    setCreateTopicEnabled(false)
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
                isOpen={editTopicEnabled}
                onClose={() => setEditTopicEnabled(false)}
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

const TermsComponent = ({ terms, setTerms, topics, refresh }) => {
    
    const { user } = useAuthContext()
    const { course } = useCourseContext()
    
    const [createTermFormEnabled, setCreateTermFormEnabled] = useState(false)
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
            setCreateTermFormEnabled(false)
            setTerms(prev => [...prev, json.term])

        } catch (err) {
            console.error(err)
        }
    }

    const handleCancel = () => {
        setShowCancelConfirmation(true);
    };

    const handleCancelConfirm = () => {
        setCreateTermFormEnabled(false)
        setShowCancelConfirmation(false);
    };

    return (
        <div className='content-card'>
            <h2>Study Terms</h2>
            {user.userId === course.coordinatorId && 
                <div>
                    <button className='standard-button' onClick={() => setCreateTermFormEnabled(true)}>Create Term</button>
                </div>
            }
            <Collapsible
                title={`View Terms (${terms ? terms.length : 0})`}
                defaultState={false}
            >
                {terms &&
                    terms.map(term =>
                        <TermComponent
                            key={term.termId}
                            term={term}
                            topics={topics}
                            onDelete={() => {setTerms(prev => prev.filter(item => item.termId !== term.termId))}}
                            onEdit={refresh}
                        />
                    )
                }
            </Collapsible>

            {createTermFormEnabled && (
                <div>
                    <h2>Create Study Terms</h2>
                    <form onSubmit={handleCreateTerm} style={{ marginBottom: '20px' }}>
                        <Box display="flex" flexDirection="column" gap={2}>
                        <TextField
                                label="Name of this term's topic"
                                name="topicName"
                                value={createTermForm.topicName}
                                onChange={handleCreateTermFormChange}
                                required
                                fullWidth
                            />
                            <Box display="flex" alignItems="center" gap={2}>
                                <TextField
                                    label="Term"
                                    name="termName"
                                    value={createTermForm.termName}
                                    onChange={handleCreateTermFormChange}
                                    required
                                    fullWidth
                                />
                            </Box>
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
                            <Button variant="contained" color="primary" type="submit">
                                Add Term
                            </Button>
                        </Box>
                    </form>
                    {createTermFormError && <p className='form-error'>{createTermFormError}</p>}
                    <Button variant="outlined" onClick={handleCancel}>
                        Cancel
                    </Button>
                </div>
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
        </div>
    )
}

const QuestionsComponent = ({ questions, setQuestions, topics, refresh }) => {

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
            <TopicComponent topics={topicList} setTopics={setTopicList} refresh={triggerEffect}/>
            <TermsComponent terms={termList} setTerms={setTermList} topics={topicList} refresh={triggerEffect}/>
            <QuestionsComponent questions={questionList} setQuestions={setQuestionList} refresh={triggerEffect} topics={topicList}/>
        </div>
    )
}

export default CourseStudy