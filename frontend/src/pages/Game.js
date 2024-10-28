import { useState } from 'react'

import ConfirmDialog from '../components/ConfirmDialog'

import { GameProvider, useGameContext} from "../context/GameContext"
import { useAuthContext } from "../hooks/UseAuthContext"

import { useNavigate } from "react-router-dom"

const Game = () => {

    return (
        <GameProvider>
            <GameComponent />
        </GameProvider>
    )

}

const GameComponent = () => {

    const { user } = useAuthContext()
    const { game, course } = useGameContext()

    const navigate = useNavigate()

    const [resignDialogEnabled, setResignDialogEnabled] = useState(false)

    const handleResign = async () => {
        try {

            const bodyContent = {
                userId: user.userId
            }

            const response = await fetch(`/api/game/${game.gameId}/resign`, {
                method: 'POST',
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })

            if (response.ok) navigate(course ? `/course/${course.courseId}` : '/')

        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className='page-container flex-col' style={{ marginLeft: '15px', marginRight: '15px' }}>
            <div>
                <button className='standard-button' onClick={() => navigate(`/`)}>Back to Home</button>
                { course && <button className='standard-button' style={{ marginLeft: '5px' }} onClick={() => navigate(course ? `/course/${course.courseId}` : '/')}>Back to Course</button> }
            </div>
            {game &&
                <div className='content-card flex-col' style={{ marginTop: '15px' }}>
                    <div className='flex'>
                        <h2 style={{ display: 'inline-block', flex: 1 }}>{game.playerOneName} vs. {game.playerTwoName}</h2>
                        <button className='standard-button' onClick={() => setResignDialogEnabled(true)}>Resign</button>
                    </div>
                </div>
            }

            <ConfirmDialog
                text='Are you sure you want to resign from this game?'
                isOpen={resignDialogEnabled}
                onClose={() => setResignDialogEnabled(false)}
                onConfirm={() => {
                    setResignDialogEnabled(false)
                    handleResign()
                }}
            />


        </div>
    )

}

export default Game
