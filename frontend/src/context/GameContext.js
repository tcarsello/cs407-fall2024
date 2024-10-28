import { useState, useEffect, createContext, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthContext } from '../hooks/UseAuthContext'
import { useCourseContext } from './CourseContext'

export const GameContext = createContext()

export const useGameContext = () => {
    return useContext(GameContext)
}

export const GameProvider = ({ children }) => {

    const { user } = useAuthContext()
    const { course } = useCourseContext()

    const { gameId } = useParams()

    const [game, setGame] = useState()
    const [gameLoading, setLoading] = useState()
    const [gameError, setError] = useState()

    useEffect(() => {

        const fetchGame = async () => {
            try {

                const response = await fetch(`/api/game/${gameId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                })

                const json = await response.json()
                if (response.ok) setGame(json.game)

            } catch (err) {
                console.error(err)
                setError(err)
            } finally {
                setLoading(false)
            }
        }

        if (user && course && gameId) fetchGame()

    }, [user.token, course, gameId])

    return (
        <GameContext.Provider value={{ game, gameLoading, gameError }}>
            {children}
        </GameContext.Provider>
    )
}
