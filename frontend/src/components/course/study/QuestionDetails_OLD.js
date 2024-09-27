import { useState, useEffect } from 'react'
import { useAuthContext } from '../../../hooks/UseAuthContext'
import { GrFormClose, GrEdit } from 'react-icons/gr'

import ConfirmDialog from '../../ConfirmDialog'

const QuestionDetails = ({ question, topics, onDelete }) => {
    
    const { user } = useAuthContext()

    const [answerList, setAnswerList] = useState([])

    const [deleteQuestionDialogEnabled, setDeleteQuestionDialogEnabled] = useState(false)

    const topicName = topics.find(topic => topic.topicId === question.topicId)?.topicName || 'No Topic'
    
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

        fetchAnswers()

    }, [question, user])

    const handleDeleteQuestion = async () => {

        try {

            const repsonse = await fetch(`/api/question/${question.questionId}`, {
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

    return (
        <div className='flex' style={{borderBottom: '1px solid lightgrey'}}>
            <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: 0 }}>{question.text}</h3>
                <p style={{ margin: 0, color: 'grey', fontStyle: 'italic' }}>{topicName}</p>
                <ul>
                    {answerList && answerList.map(answer => 
                        <li key={answer.answerId} style={{ fontWeight: answer.isCorrect ? 'bold' : 'normal' }}>{answer.text}</li>
                    )}
                </ul>
            </div>
            <div className='flex-col' style={{ justifyContent: 'space-around' }}>
                <GrFormClose size='25' style={{ marginLeft: '5px' }} onClick={() => setDeleteQuestionDialogEnabled(true)} />
                <GrEdit size='20' style={{ marginLeft: '10px' }} onClick={() => {}}/>
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
