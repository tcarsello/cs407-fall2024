import { useState, useEffect, createContext, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthContext } from '../hooks/UseAuthContext'

export const GameContext = createContext()

export const useGameContext = () => {
    return useContext(GameContext)
}

export const GameProvider = ({ children }) => {

    const { user } = useAuthContext()

    const { gameId } = useParams()

    const [game, setGame] = useState()
    const [gameLoading, setLoading] = useState()
    const [gameError, setError] = useState()

    const [course, setCourse] = useState()

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
                if (response.ok) {
                    setGame(json.game)
                }

            } catch (err) {
                console.error(err)
                setError(err)
            } finally {
                setLoading(false)
            }
        }

        if (user && gameId) fetchGame()

    }, [user.token, gameId])

    useEffect(() => {

        const fetchCourse = async () => {
            try {
                const response = await fetch(`/api/course/${game.courseId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                })

                const json = await response.json()
                if (response.ok) {
                    setCourse(json)
                }

            } catch (err) {
                console.error(err)
            }

        }

        if (game && game.courseId) fetchCourse()

    }, [game])

    return (
        <GameContext.Provider value={{ game, course, gameLoading, gameError }}>
            {children}
        </GameContext.Provider>
    )
}
