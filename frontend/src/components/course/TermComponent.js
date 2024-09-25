import { useState } from 'react'

import { useCourseContext } from "../../context/CourseContext"
import { useAuthContext } from "../../hooks/UseAuthContext"

import { GrFormClose, GrEdit } from 'react-icons/gr'
import PopupForm from '../PopupForm'

const TermComponent = ({ term, topics, onDelete, onEdit }) => {

    const { user } = useAuthContext()
    const { course } = useCourseContext()

    const topicName = topics.find(t => t.topicId === term.topicId )?.topicName || 'No Topic'

    const [editTermFormEnabled, setEditTermFormEnabled] = useState(false)
    const [editTermForm, setEditTermForm] = useState({
        ...term,
        topicName
    })
    const [editTermFormError, setEditTermFormError] = useState()

    const handleDelete = async () => {

        try {
            await fetch(`/api/term/${term.termId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                }
            })
            
            onDelete()

        } catch (err) {
            console.error(err)
        }
    }

    const handleEditTermFormChange = (e) => {
        const { name, value } = e.target
        setEditTermForm({
            ...editTermForm,
            [name]: value
        })
    }

    const handleEditTermForm = async (e) => {
        e.preventDefault()
        try {

            const topic = topics.find(topic => topic.topicName === editTermForm.topicName)
            if (!topic) {
                setEditTermFormError('No such topic')
                return
            }

            const bodyContent = {
                ...editTermForm,
                topicId: topic.topicId
            }

            const response = await fetch(`/api/term/${term.termId}`, {
                method: 'PATCH',
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                }
            })

            const json = await response.json()

            if (!response.ok) {
                setEditTermFormError(json.error || 'Failed to edit term')
                return
            }

            setEditTermFormError()
            setEditTermFormEnabled(false)
            onEdit()

        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div style={{marginBottom: '15px'}} className='flex'>
            <div style={{display: 'inline-block'}}>
                <strong>{term.termName}</strong>
                <br/>
                <span style={{color: 'grey', fontStyle: 'italic'}}>{topicName}</span>
            </div>
            <span style={{ flex: 1, marginLeft: '15px'}}>{term.termDefinition}</span>
            
            {user.userId === course.coordinatorId &&
                <div>
                    <GrEdit size='20' style={{ marginLeft: '10px' }} onClick={() => setEditTermFormEnabled(true)}/>
                    <GrFormClose size='25' style={{ marginLeft: '5px' }} onClick={handleDelete} />
                </div>
            }

            <PopupForm
                title="Edit Term"
                onClose={() => {
                    setEditTermFormEnabled(false)
                    setEditTermFormError()
                }}
                isOpen={editTermFormEnabled}
                onSubmit={handleEditTermForm}
            >
                <div>
                    <label>Topic Name:</label>
                    <input
                        type='text'
                        name='topicName'
                        placeholder="Name of this term's topic"
                        value={editTermForm.topicName}
                        onChange={handleEditTermFormChange}
                    />
                </div>
                <div>
                    <label>Term:</label>
                    <input
                        type='text'
                        name='termName'
                        placeholder="Name of the term"
                        value={editTermForm.termName}
                        onChange={handleEditTermFormChange}
                    />
                </div>
                <div>
                    <label>Definition:</label>
                    <input
                        type='text'
                        name='termDefinition'
                        placeholder="Term's Definition"
                        value={editTermForm.termDefinition}
                        onChange={handleEditTermFormChange}
                    />
                </div>
            </PopupForm>
        </div>
    )

}

export default TermComponent