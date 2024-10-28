import { useState, useEffect } from 'react'
import { useGameContext } from '../../context/GameContext'
import { useAuthContext } from '../../hooks/UseAuthContext'

import '../../css/game.css'

const RoundsTable = () => {

    const { user } = useAuthContext()
    const { game, course } = useGameContext()

    const [roundList, setRoundList] = useState([])

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

        if (user && game) fetchRounds()

    }, [user.token, game.gameId])

    const addRound = async (newRound) => {

    }

    return (
        <div>
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
                    {roundList && roundList.map((round, index) => (<RoundRow key={index} round={round}/>))}
                </tbody>
            </table>
        </div>
    )

}

const RoundRow = ({ round }) => {

    return (
        <tr style={{ textAlign: 'center' }}>
            <td>1</td>
            <td>Topic Name</td>
            <td>5</td>
            <td>4</td>
            <td>3</td>
            <td>User Last</td>
        </tr>
    )

}

export default RoundsTable
