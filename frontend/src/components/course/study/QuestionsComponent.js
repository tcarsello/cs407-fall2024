import { useState } from 'react'

import { useAuthContext } from '../../../hooks/UseAuthContext'
import { useCourseContext } from '../../../hooks/UseCourseContext'

import QuestionDetails from './QuestionDetails'

import Collapsible from '../../Collapsible'

const QuestionsComponent = ({ questions, setQuestions, topics, refresh, activeForm, setActiveForm }) => {

    const { user } = useAuthContext()
    const { course } = useCourseContext()

    const [questionTopicName, setTopicName] = useState('')
    const [questionText, setQuestionText] = useState('')
    const [questionDifficulty, setQuestionDifficulty] = useState('regular')
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
                difficulty: questionDifficulty,
                answerList,
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
                    <div>
                        <label style={{ textAlign: 'center'}}>
                            Easy
                            <input
                                type='radio'
                                value='easy'
                                checked={questionDifficulty === 'easy'}
                                onChange={(e) => setQuestionDifficulty(e.target.value)}
                            />
                        </label>
                        <label style={{ textAlign: 'center'}}>
                            Regular
                            <input
                                type='radio'
                                value='regular'
                                checked={questionDifficulty === 'regular'}
                                onChange={(e) => setQuestionDifficulty(e.target.value)}
                            />
                        </label>
                        <label style={{ textAlign: 'center'}}>
                            Hard
                            <input
                                type='radio'
                                value='hard'
                                checked={questionDifficulty === 'hard'}
                                onChange={(e) => setQuestionDifficulty(e.target.value)}
                            />
                        </label>

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
                            hasImage={question.hasImage}
                            topics={topics}
                            refresh={refresh}
                            onDelete={() => { setQuestions(questions.filter(q => q.questionId !== question.questionId)) }}
                        />
                    )
                }
            </Collapsible>
        </div>
    )

}

export default QuestionsComponent
