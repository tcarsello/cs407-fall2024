import { useState, useEffect } from 'react'
import { useNavigate, useParams } from "react-router-dom"
import { GameProvider, useGameContext } from "../context/GameContext"
import { useAuthContext } from "../hooks/UseAuthContext"

const Round = () => {
    return (
        <GameProvider>
            <RoundComponent />
        </GameProvider>
    )
}

const RoundComponent = () => {

    const { user } = useAuthContext()
    const { game, course } = useGameContext()

    const { roundId } = useParams()

    const navigate = useNavigate()

    const [questionText, setQuestionText] = useState()
    const [questionId, setQuestionId] = useState()
    const [answerList, setAnswerList] = useState([])

    const [selectedAnswerId, setSelectedAnswerId] = useState()
    const [correctAnswerId, setCorrectAnswerId] = useState()
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {

        const fetchQuestion = async () => {
            try {

                const response = await fetch(`/api/round/${roundId}/fetchQuestion`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                })

                const json = await response.json()
                if (response.ok) {

                    if (!json.found) {
                        navigate(`/game/${game.gameId}`)
                        return
                    } else {
                        setQuestionText(json.question.text)
                        setQuestionId(json.question.questionId)
                        setAnswerList(json.answers)
                    }

                }

            } catch (err) {
                console.error(err)
            }
        }

        if (!submitted && user?.token && game?.gameId && roundId) fetchQuestion()

    }, [user, game, roundId, submitted])

    const handleSelect = (answer) => {
        if (submitted) return

        setSelectedAnswerId(answer.answerId)
    }

    const handleSubmit = async () => {

        if (!selectedAnswerId) return

        try {

            const bodyContent = {
                questionId: questionId,
                answerId: selectedAnswerId,
            }

            const response = await fetch(`/api/round/${roundId}/submitAnswer`, {
                method: 'POST',
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })

            const json = await response.json()
            if (response.ok) {

                setCorrectAnswerId(json.correctId)

                setSubmitted(true)
            }
        } catch (err) {
            console.error(err)
        }

    }

    const advanceQuestion = async () => {

        if (!submitted) return

        setQuestionText()
        setQuestionId()
        setAnswerList([])

        setSelectedAnswerId()
        setCorrectAnswerId()
        setSubmitted(false)
    }

    return (
        <div className='page-container flex-col' style={{ marginLeft: '15px', marginRight: '15px' }}>
             <div>
                { game && <button className='standard-button' style={{ marginLeft: '5px' }} onClick={() => navigate(game ? `/game/${game.gameId}` : '/')}>Back to Game</button> }
            </div>
            {(game && course) &&
                <div className='content-card' style={{ marginTop: '25px' }}>
                    <div className='flex-col' style={{ marginTop: '15px' }}>
                       <h2>Answer the Questions</h2> 
                        {questionText && <p><strong>Question: </strong>{questionText}</p>}
                        {answerList && answerList.map((answer, index) => (
                            <AnswerOption
                                key={index}
                                answer={answer}
                                selected={selectedAnswerId == answer.answerId}
                                correct={submitted && correctAnswerId == answer.answerId}
                                incorrect={submitted && correctAnswerId !== selectedAnswerId && selectedAnswerId === answer.answerId}
                                handleSelect={handleSelect}
                            />
                        ))}
                    </div>
                    {!submitted ?
                        <button className='standard-button' onClick={handleSubmit}>Submit</button>
                        :
                        <button className='standard-button' onClick={advanceQuestion}>Next Question</button>
                    }
                </div>
            }

        </div>
    )
}

const AnswerOption = ({ answer, selected, correct, incorrect, handleSelect }) => {

    let bgColor = ''
    if (selected) bgColor = 'lightgrey'
    if (correct) bgColor = 'lightgreen'
    if (incorrect) bgColor = 'red'

    return (
        <div style={{ padding: '15px', marginBottom: '10px', border: '1px solid lightgrey', backgroundColor: bgColor }} onClick={() => handleSelect(answer)}>
            <p style={{ margin: 0 }}>{answer.text}</p>
        </div>
    )
}

export default Round
