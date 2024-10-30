import { useState, useEffect } from 'react'
import { useGameContext } from '../../context/GameContext'
import { useAuthContext } from '../../hooks/UseAuthContext'

import '../../css/game.css'
import { useNavigate } from 'react-router-dom'

const RoundsTable = () => {

    const { user } = useAuthContext()
    const { game, course } = useGameContext()

    const [roundList, setRoundList] = useState([])

    const [topicList, setTopicList] = useState([])
    const [selectedTopic, setSelectedTopic] = useState()
    const [isAnimating, setIsAnimating] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)

    const [playerOneScore, setPlayerOneScore] = useState(0)
    const [playerTwoScore, setPlayerTwoScore] = useState(0)

    useEffect(() => {

        const fetchRounds = async () => {
            try {

                const response = await fetch(`/api/game/${game.gameId}/rounds`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                })

                const json = await response.json()
                if (response.ok) {
                    setRoundList(json.rounds)
                }

            } catch (err) {
                console.error(err)
            }
        }

        const fetchTopics = async () => {
            try {

                const response = await fetch(`/api/course/${course.courseId}/topics`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                })

                const json = await response.json()
                if (response.ok) {
                    setTopicList(json.topics)
                }

            } catch (err) {
                console.error(err)
            }
        }

        if (user && game && course) {
            fetchRounds()
            fetchTopics()
        }

    }, [user.token, game.gameId, course])

    useEffect(() => {

        let total1 = 0
        let total2 = 0
        roundList.map(round => {
            if (round.roundWinner === 'Unfinished') return

            if (round.playerOneScore > round.playerTwoScore) {
                total1 += 1
            } else if (round.playerOneScore < round.playerTwoScore) {
                total2 += 1
            } else {
                total1 += 0.5
                total2 += 0.5
            }

            return 0

        })

        setPlayerOneScore(total1)
        setPlayerTwoScore(total2)

    }, [roundList])

    const addRound = async (newRound) => {
        setRoundList(prev => ([...prev, newRound]))
    }

    const createRound = async (topicId) => {

        try {

            const response = await fetch(`/api/game/${game.gameId}/newRound`, {
                method: 'POST',
                body: JSON.stringify({ topicId }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })
            
            const json = await response.json()
            if (response.ok) addRound(json.round)

        } catch (err) {
            console.error(err)
        }

    }

    const startSelection = () => {
        if (isAnimating) return
        if (!topicList || topicList.length === 0) return

        setIsAnimating(true)
        setSelectedTopic(null)

        let spinDuration = 2000
        let interval = 100
        let elapsed = 0

        const spinInterval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % topicList.length)
            elapsed += interval

            if (elapsed >= spinDuration / 2) {
                interval += 50;
            }

            if (elapsed >= spinDuration) {
                clearInterval(spinInterval)
                setIsAnimating(false)
                const topic = topicList[Math.floor(Math.random() * topicList.length)]
                setSelectedTopic(topic)
                createRound(topic.topicId)
            }
        }, interval)
    }

    const newRoundButtonDisabled = () => {
        if (isAnimating) return true
        if (roundList.length >= game.maxRounds) return true
        if (game.status === 'Player One Win' || game.status === 'Player Two Win' || game.status === 'Tie') return true
        if (roundList.length > 0 && roundList.at(-1).roundWinner === 'Unfinished') return true

        return false
    }

    const gameStatusString = () => {
        if (game?.status === 'Player One Win') return game.playerOneName
        if (game?.status === 'Player Two Win') return game.playerTwoName
        return game ? game.status : ''
    }

    return (
        <div>
            <h4>Game Status: {gameStatusString()}</h4>
            <h4>Current Score: {playerOneScore} - {playerTwoScore}</h4>
            <h4>Rounds ({roundList ? roundList.length : 0} / {game ? game.maxRounds : 0})</h4>
            <table className='round-table' border="1" style={{ width: '100%', margin: '0 auto', borderCollapse: 'collapse' }}> 
                <thead>
                    <tr>
                        <th>Round #</th>
                        <th>Topic</th>
                        <th>Round Questions</th>
                        <th>{game?.playerOneName}'s Score</th>
                        <th>{game?.playerTwoName}'s Score</th>
                        <th>Round Winner</th>
                    </tr>
                </thead>
                <tbody>
                    {roundList && roundList.map((round, index) => (
                        <RoundRow
                            key={index}
                            round={round}
                            number={index + 1}
                            game={game}
                            user={user}
                        />))}
                </tbody>
            </table>
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                {(isAnimating || selectedTopic) && <div style={{ fontSize: '24px', margin: '0px', minHeight: '50px' }}>
                    {isAnimating ? (<span>{topicList[currentIndex].topicName}</span>) : (<span>{selectedTopic?.topicName || 'Start Selection'}</span>)}
                </div>
                }
                { !newRoundButtonDisabled() && <button className='standard-button' onClick={startSelection} disabled={newRoundButtonDisabled()}>{isAnimating ? 'Selecting Topic ...' : 'Start new Round'}</button> } 
            </div>
        </div>
    )

}

const RoundRow = ({ round, number, game, user }) => {

    const navigate = useNavigate()

    return (
        <tr style={{ textAlign: 'center' }}>
            <td>{number}</td>
            <td>{round.topicName}</td>
            <td>{round.roundQuestions}</td>
            <td>{round.playerOneDone ?
                    round.playerOneScore
                :
                    (
                        game.playerOneId === user.userId && (game.status === 'New' || game.status === 'In Progress') ?
                            <button className='standard-button' style={{ margin: 0 }} onClick={() => navigate(`/game/${game.gameId}/round/${round.roundId}`)}>Play Round</button>
                        :
                            '-'
                    )
            }</td>
            <td>{round.playerTwoDone ?
                    round.playerTwoScore
                :
                    (
                        game.playerTwoId === user.userId  && (game.status === 'New' || game.status === 'In Progress')?
                            <button className='standard-button' style={{ margin: 0 }} onClick={() => navigate(`/game/${game.gameId}/round/${round.roundId}`)}>Play Round</button>
                        :
                            '-'
                    )
            }</td>

            <td>{round.roundWinner}</td>
        </tr>
    )

}

export default RoundsTable
