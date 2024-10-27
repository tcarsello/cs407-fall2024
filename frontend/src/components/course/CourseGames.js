import { useCourseContext } from "../../context/CourseContext"
import { useAuthContext } from "../../hooks/UseAuthContext"

import PopupForm from "../PopupForm"
import Collapsible from '../Collapsible'
import GameList from "../games/GameList"

import { useState, useEffect } from 'react'

import { GrFormClose, GrFormCheckmark } from 'react-icons/gr'

const CourseGames = () => {

    const { user } = useAuthContext()
    const { course, courseFriends } = useCourseContext()

    const [createChallengeEnabled, setCreateChallengeEnabled] = useState(false)
    const [createChallengeError, setCreateChallengeError] = useState()
    const [challengerId, setChallengerId] = useState(-1)
    
    const [createFriendChallengeEnabled, setCreateFriendChallengeEnabled] = useState(false)
    const [createFriendChallengeError, setCreateFriendChallengeError] = useState()

    const [memberList, setMemberList] = useState([])
    const [outgoingChallengeList, setOutgoingChallengeList] = useState([])
    const [incomingChallengeList, setIncomingChallengeList] = useState([])

    // Used to update the game list
    const [gameList, setGameList] = useState(0)

    useEffect(() => {

        const fetchMembers = async () => {
            try {

                const response = await fetch(`/api/course/${course.courseId}/members`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                })
                const json = await response.json()
                setMemberList([{ userId: -1, firstName: '', lastName: ''}, ...json.members])

            } catch (err) {
                console.error(err)
            }
        }

        if (user && course) {
            fetchMembers()
        }

    }, [user, course])

    useEffect(() => {

        const fetchOutgoingChallenges = async () => {
            try {

                const response = await fetch(`/api/user/${user.userId}/outgoingChallenges/${course.courseId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                })

                const json = await response.json()
                
                setOutgoingChallengeList(json.challenges.map(c => {
                    let challenger = memberList.find(member => parseInt(member.userId) === parseInt(c.challengerId))
                    return {...c, name: `${challenger.firstName} ${challenger.lastName}`}
                }))

            } catch (err) {
                console.error(err)
            }
        }

        const fetchIncomingChallenges = async () => {
            try {

                const response = await fetch(`/api/user/${user.userId}/incomingChallenges/${course.courseId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                })

                const json = await response.json()
                
                setIncomingChallengeList(json.challenges.map(c => {
                    let challenger = memberList.find(member => parseInt(member.userId) === parseInt(c.contenderId))
                    return {...c, name: `${challenger.firstName} ${challenger.lastName}`}
                }))

            } catch (err) {
                console.error(err)
            }
        }



        if (user && course && memberList.length > 0) {
            fetchOutgoingChallenges()
            fetchIncomingChallenges()
        }

    }, [course, memberList, user])

    const handleCreateChallenge = async (e) => {
        e.preventDefault()

        try {

            const bodyContent = {
                courseId: course.courseId,
                contenderId: user.userId,
                challengerId: challengerId,
            }

            const response = await fetch(`/api/challenge/`, {
                method: 'POST',
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }

            })

            const json = await response.json()

            if (!response.ok) {
                setCreateChallengeError(json.error || 'Failed to create challenge')
                setCreateFriendChallengeError(json.error || 'Failed to create challenge')
                throw (json.error || 'Failed to create challenge')
            }

            let challenger = memberList.find(member => parseInt(member.userId) === parseInt(challengerId))
            setOutgoingChallengeList(prev => [...prev, {...json.challenge, name: `${challenger.firstName} ${challenger.lastName}`}])

            setCreateChallengeEnabled(false)
            setCreateChallengeError()

            setCreateFriendChallengeEnabled(false)
            setCreateFriendChallengeError()

            setChallengerId(-1)
        } catch (err) {
            console.error(err)
        }

    }

    const handleCancelChallenge = async (index) => {

        try {

            const challenge = outgoingChallengeList[index]

            const bodyContent = {...challenge}
            const response = await fetch(`/api/challenge`, {
                method: 'DELETE',
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })

            if (response.ok) setOutgoingChallengeList(prev => prev.filter((c,i) => i !== index))

        } catch (err) {
            console.error(err)
        }

    }

    const handleRejectChallenge = async (index) => {

        try {
            
            const challenge = incomingChallengeList[index]

            const bodyContent = {...challenge}
            const response = await fetch(`/api/challenge/reject`, {
                method: 'POST',
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })

            if (response.ok) setIncomingChallengeList(prev => prev.filter((c, i) => i !== index))

        } catch (err) {
            console.error(err)
        }

    }

    const handleAcceptChallenge = async (index) => {

        try {
            
            const challenge = incomingChallengeList[index]

            const bodyContent = {...challenge}
            const response = await fetch(`/api/challenge/accept`, {
                method: 'POST',
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })

            if (response.ok) {
                setIncomingChallengeList(prev => prev.filter((c, i) => i !== index))
                setGameList(gameList + 1)
            }

        } catch (err) {
            console.error(err)
        }

    }
    
    const handleRandomChallenge = async () => {
        try {

            const candidates = memberList.filter(member =>
                !incomingChallengeList.some(incoming => member.userId === incoming.contenderId)
                && !outgoingChallengeList.some(outgoing => member.userId === outgoing.challengerId)
                && member.userId >= 0
                && member.userId !== user.userId
            )

            if (candidates.length === 0) return

            const choice = candidates[Math.floor(Math.random() * candidates.length)]

            const bodyContent = {
                courseId: course.courseId,
                contenderId: user.userId,
                challengerId: choice.userId,
            }

            const response = await fetch(`/api/challenge/`, {
                method: 'POST',
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }

            })

            const json = await response.json()

            if (!response.ok) {
                throw (json.error || 'Failed to create challenge')
            }

            setOutgoingChallengeList(prev => [...prev, {...json.challenge, name: `${choice.firstName} ${choice.lastName}`}])
        
        } catch (err) {
            console.error(err)
        }

    }

    return ( <>
        <div className='flex page-container'>
            <div style={{ flex: 1, paddingRight: '15px' }}>
               	<div className="content-card">
					<Collapsible title="Active Games" defaultState={true}>
						<GameList title="" divClass="" course={course} key={gameList} />
					</Collapsible>
				</div>
                <div className="content-card">
                    <Collapsible title="Game History" defaultState={true} >
                        <GameList title="" divClass="" course={course} history={true} key={gameList + 1} />
                    </Collapsible>
                </div>
                {user.userId === course.coordinatorId &&
                    <div className="content-card">
                        <Collapsible title="Course Games" defaultState={true}>
                            <GameList title={""} divClass="" masterList={true} course={course} key={gameList + 2} />
                        </Collapsible>
                    </div>
                }
            </div>

            <div style={{ width: '20%', minWidth: '250px' }}>
                <div className='content-card'>
                    <h4 style={{ margin: 0 }} >Create Challenge</h4>
                    <div className='flex-col'>
                        <button className='standard-button' onClick={() => setCreateChallengeEnabled(true)}>New</button>
                        <button className='standard-button' onClick={handleRandomChallenge}>Random</button>
                        <button className='standard-button' onClick={() => setCreateFriendChallengeEnabled(true)}>Friend</button>
                    </div>
                </div>

                <div className='content-card'>
                    <h4 style={{ margin: 0 }} >Incoming Challenges</h4>
                    {incomingChallengeList && incomingChallengeList.map((incoming, index) => (
                        <div key={index} className='flex'>
                            <span style={{ flex: 1 }}>{incoming.name}</span> 
                            <GrFormCheckmark size='25' onClick={() => handleAcceptChallenge(index)}/>
                            <GrFormClose size='25' onClick={() => handleRejectChallenge(index)}/>
                        </div>
                    ))}

                </div>

                <div className='content-card'>
                    <h4 style={{ margin: 0 }} >Outgoing Challenges</h4>
                    {outgoingChallengeList && outgoingChallengeList.map((outgoing, index) => (
                        <div key={index} className='flex'>
                            <span style={{ flex: 1 }}>{outgoing.name}</span> 
                            <GrFormClose size='25' onClick={() => handleCancelChallenge(index)}/>
                        </div>
                    ))}
                </div>

            </div>
        </div>

        <PopupForm
            title={'Challenge a Classmate'}
            isOpen={createChallengeEnabled}
            onClose={() => {
                setCreateChallengeEnabled(false)
                setCreateChallengeError()
            }}
            onSubmit={handleCreateChallenge}
            errorText={createChallengeError}
        >
            <div>
                <label>Student</label>
                <select
                    id='userSelect'
                    value={challengerId}
                    onChange={(e) => setChallengerId(e.target.value)}
                    required
                >
                    {memberList && memberList.filter(member => member.userId !== user.userId).map((member, index) => (
                        <option key={index} value={member.userId}>
                            {`${member.firstName} ${member.lastName}`}
                        </option>
                    ))}
                </select>
            </div>
        </PopupForm>

        <PopupForm
            title={'Challenge a Friend'}
            isOpen={createFriendChallengeEnabled}
            onClose={() => {
                setCreateFriendChallengeEnabled(false)
                setCreateFriendChallengeError()
            }}
            onSubmit={handleCreateChallenge}
            errorText={createFriendChallengeError}
        >
            <div>
                <label>Friend</label>
                <select
                    id='friendSelect'
                    value={challengerId}
                    onChange={(e) => setChallengerId(e.target.value)}
                    required
                >
                    <option value={-1}></option>
                    {courseFriends && courseFriends.filter(member => member.userId !== user.userId).map((member, index) => (
                        <option key={index} value={member.userId}>
                            {`${member.firstName} ${member.lastName}`}
                        </option>
                    ))}
                </select>
            </div>
        </PopupForm>



    </>)
}

export default CourseGames
