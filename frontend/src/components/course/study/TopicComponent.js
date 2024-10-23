import { useState } from 'react'

import { useAuthContext } from '../../../hooks/UseAuthContext'
import { useCourseContext} from '../../../hooks/UseCourseContext'

import { GrFormClose, GrEdit } from 'react-icons/gr'

import PopupForm from '../../PopupForm'

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
                <form className='standard-form'>
                    <br />
                    <div>
                        <label>Filter Content By Topic:</label>
                            <select
                                id='topicSelect'
                                value={topicFilter}
                                onChange={(e) => setTopicFilter(e.target.value)}
                                required
                            >
                                <option value={-1}>All</option>
                                {topics && topics.map((topic, index) => (
                                    <option key={index} value={topic.topicId}>
                                        {topic.topicName}
                                    </option>
                                ))}
                            </select>
                    </div>
                </form>
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

export default TopicComponent
