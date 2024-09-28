import { useState, useEffect } from 'react'
import { useAuthContext } from '../../../hooks/UseAuthContext'
import { GrFormClose } from 'react-icons/gr'

import ConfirmDialog from '../../ConfirmDialog'

const QuestionDetails = ({ question, topics, onDelete, refresh }) => {

    const { user } = useAuthContext()

    const [answerList, setAnswerList] = useState([])
    const [pictureUrl, setPictureUrl] = useState()
    const topicName = topics.find(topic => topic.topicId === question.topicId)?.topicName || 'No Topic'

    const [deleteQuestionDialogEnabled, setDeleteQuestionDialogEnabled] = useState(false)

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...question, topicName })
    const [formError, setFormError] = useState()
    const [newAnswers, setNewAnswers] = useState([])

    useEffect(() => {

        const fetchAnswers = async () => {
            try {

                const response = await fetch(`/api/question/${question.questionId}/answers`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`,
                    }
                })

                if (response.ok) {
                    const json = await response.json()
                    setAnswerList(json.answers)
                }

            } catch (err) {
                console.error(err)
            }
        }

        const fetchPicture = async () => {

            try {

                const response = await fetch(`/api/question/${question.questionId}/picture`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`,
                    }
                })

                if (response.ok) {
                    const blob = await response.blob()
                    const imageUrl = URL.createObjectURL(blob)
                    setPictureUrl(imageUrl)


                }

            } catch (err) {
                console.error(err)
            }

        }

        fetchAnswers()
        fetchPicture()

    }, [question, user])

    const handleDeleteQuestion = async () => {

        try {

            await fetch(`/api/question/${question.questionId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                }
            })

        } catch (err) {
            console.error(err)
        }

        onDelete()
    }

    const handleFormChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleAnswerChange = (index, field, value) => {
        const nextAnswers = [...newAnswers]
        nextAnswers[index] = { ...nextAnswers[index], [field]: value}
        setNewAnswers(nextAnswers)

    }

    const addAnswer = () => {
        setNewAnswers(prev => [...prev, { text: '', isCorrecst: false }])
    }

    const removeAnswer = (index) => {
        setNewAnswers(newAnswers.filter((_, i) => index !== i))
    }

    const toggleEdit = () => {
        setIsEditing(!isEditing)
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()

        try {

            const topic = topics.find(topic => topic.topicName === formData.topicName)
            if (!topic) {
                setFormError('No such topic')
                return
            }

            const bodyContent = {
                text: formData.text,
                topicId: topic.topicId,
                difficulty: formData.difficulty,
                answerList: newAnswers.map(a => ({ text: a.text, isCorrect: a.isCorrect }))
            }

            const response = await fetch(`/api/question/${question.questionId}`, {
                method: 'PATCH',
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                }
            })

            const json = await response.json()
            if (!response.ok) {
                setFormError(json.error || 'Failed to create question')
                return
            }

            setFormError()
            refresh()
            setIsEditing(false)
        
        } catch (err) {
            setFormError('Failed to update question')
            console.log(err)
        }

    }

    let answerListToRender = answerList
    if (isEditing) answerListToRender = newAnswers

    return (
        <div className='flex' style={{ marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid lightgrey'}}>
            <div style={{ flex: 1 }}>
                <form className='standard-form' onSubmit={handleEditSubmit}>
                    {/* Question text */}
                    <div>
                        <label>Question:</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="text"
                                value={formData.text}
                                onChange={handleFormChange}
                            />
                        ) : (
                            <span>{formData.text}</span>
                        )}
                    </div>

                    {/* Topic field */}
                    <div>
                        <label>Topic:</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="topicName"
                                value={formData.topicName}
                                onChange={handleFormChange}
                            />
                        ) : (
                            <span>{topicName}</span>
                        )}
                    </div>

                    {/* Difficulty field */}
                    <div>
                        <label>Difficulty:</label>
                        {isEditing ? (
                            <select
                                name="difficulty"
                                value={formData.difficulty}
                                onChange={handleFormChange}
                            >
                                <option value="easy">Easy</option>
                                <option value="regular">Regular</option>
                                <option value="hard">Hard</option>
                            </select>
                        ) : (
                            <span>{formData.difficulty?.toUpperCase()}</span>
                        )}
                    </div>
                    {pictureUrl && <img style={{ maxWidth: '30%', height: 'auto', objectFit: 'contain' }} src={pictureUrl} alt='Question Picture' />}

                    {/* Answer choices */}
                    <label style={{ fontWeight: 'bold' }}>Answer Choices:</label>
                    {answerListToRender.map((answer, index) => (
                        <div key={index} style={{ marginBottom: "10px" }}>
                            {isEditing ? (
                                <div style={{ width: '100%', display: 'flex' }}>
                                    <input
                                        type="checkbox"
                                        checked={answer.isCorrect}
                                        style={{ width: '25px' }}
                                        onChange={(e) =>
                                            handleAnswerChange(index, "isCorrect", e.target.checked)
                                        }
                                    />
     
                                    <input
                                        type="text"
                                        value={answer.text}
                                        onChange={(e) => handleAnswerChange(index, "text", e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                    <button style={{ marginLeft: '25px' }} className='standard-button' type="button" onClick={() => removeAnswer(index)}>
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <span key={answer.answerId} style={{ marginLeft: '25px', fontWeight: answer.isCorrect ? 'bold' : 'normal' }}>{answer.text}</span>
                            )}
                        </div>
                        
                    ))}
                        {isEditing && (
                            <button className='standard-button' type="button" onClick={addAnswer}>
                                Add Answer Choice
                            </button>
                        )}

                        {/* Edit/Update buttons */}
                        <div>
                        {isEditing ? (
                            <>
                                <button className='standard-button' style={{ marginRight: '15px' }} type='submit'>
                                    Submit
                                </button>
                                <button className='standard-button' type="button" onClick={() => {
                                    toggleEdit()
                                }}>
                                    Cancel
                                </button>
                            </>
                        ) : null}
                    </div>
                    {formError && <p className='form-error'>{formError}</p>}
                </form>
                {!isEditing ?
                    <button className='standard-button' type="button" onClick={() => {
                            setNewAnswers(answerList.map(a => a))
                            setFormData({ ...question, topicName })
                            toggleEdit()
                        }}
                    >
                        Edit
                    </button>
                    : null
                }
            </div>
            <div>
                <GrFormClose size='25' style={{ marginLeft: '5px' }} onClick={() => setDeleteQuestionDialogEnabled(true)} />
            </div>
            <ConfirmDialog
                text='Are you sure you want to delete this question?'
                isOpen={deleteQuestionDialogEnabled}
                onClose={() => setDeleteQuestionDialogEnabled(false)}
                onConfirm={() => {
                    setDeleteQuestionDialogEnabled(false)
                    handleDeleteQuestion()
                }}
            />
 
        </div>

    )
}

export default QuestionDetails
