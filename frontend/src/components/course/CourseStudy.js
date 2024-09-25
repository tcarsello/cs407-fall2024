import { useState, useEffect } from 'react'

import { useCourseContext } from "../../context/CourseContext"
import { useAuthContext } from "../../hooks/UseAuthContext"

import PopupForm from '../PopupForm'
import Collapsible from '../Collapsible'
import TermComponent from './TermComponent'

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

    return (
        <div className='content-card'>
            <h2>Study Terms</h2>
            {user.userId === course.coordinatorId && 
                <div>
                    <button className='standard-button' onClick={() => setCreateTermFormEnabled(true)}>Create Term</button>
                </div>
            }
            <Collapsible
                title={`View terms (${terms ? terms.length : 0})`}
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

            <PopupForm
                title='Create a New Term'
                isOpen={createTermFormEnabled}
                onClose={() => {
                    setCreateTermFormEnabled(false)
                    setCreateTermFormError()
                }}
                onSubmit={handleCreateTerm}
                errorText={createTermFormError}
            >
                <div>
                    <label>Topic Name:</label>
                    <input
                        type='text'
                        name='topicName'
                        placeholder="Name of this term's topic"
                        value={createTermForm.topicName}
                        onChange={handleCreateTermFormChange}
                    />
                </div>
                <div>
                    <label>Term:</label>
                    <input
                        type='text'
                        name='termName'
                        placeholder="Name of the term"
                        value={createTermForm.termName}
                        onChange={handleCreateTermFormChange}
                    />
                </div>
                <div>
                    <label>Definition:</label>
                    <input
                        type='text'
                        name='termDefinition'
                        placeholder="Term's Definition"
                        value={createTermForm.termDefinition}
                        onChange={handleCreateTermFormChange}
                    />
                </div>
            </PopupForm>
        </div>
    )
}

const CourseStudy = () => {
    
    const { user } = useAuthContext()
    const { course } = useCourseContext()
    
    const [topicList, setTopicList] = useState([])
    const [termList, setTermList] = useState([])
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

        if (user && course) {
            fetchTopics()
            fetchTerms()
        }

    }, [user, course, trigger])

    return (
        <div>
            <TopicComponent topics={topicList} setTopics={setTopicList} refresh={triggerEffect}/>
            <TermsComponent terms={termList} setTerms={setTermList} topics={topicList} refresh={triggerEffect}/>
        </div>
    )
}

export default CourseStudy