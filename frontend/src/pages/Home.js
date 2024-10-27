import { useState, useEffect } from 'react'
import { useAuthContext } from '../hooks/UseAuthContext'

//import '../css/home.css'
import '../css/generalAssets.css'
import Collapsible from '../components/Collapsible'
import PopupForm from '../components/PopupForm'
import CourseDetails from '../components/course/CourseDetails'
import InviteDetails from '../components/course/InviteDetails'

import { useDisplayContext } from '../context/DisplayContext'
import { useFriendContext } from '../context/FriendContext'

import { GrFormClose } from 'react-icons/gr'
import GameList from '../components/games/GameList'

const Home = () => {

    const { user } = useAuthContext()
    const { getClassNames } = useDisplayContext()
    const { friendsList, removeFriend } = useFriendContext()

    const [myCourseList, setMyCourseList] = useState([])
    const [joinedCourseList, setJoinedCourseList] = useState([])
    const [inviteList, setInviteList] = useState([])

    const [createCourseEnabled, setCreateCourseEnabled] = useState(false)
    const [createCourseForm, setCreateCourseForm] = useState({
        courseName: '',
        courseDescription: ''
    })
    const [createCourseFormError, setCreateCourseFormError] = useState()

    const [joinCourseEnabled, setJoinCourseEnabled] = useState(false)
    const [joinCourseForm, setJoinCourseForm] = useState({
        joinCode: ''
    })
    const [joinCourseFormError, setJoinCourseFormError] = useState()

    const [classNames, setClassNames] = useState(getClassNames('lightMode'))

    const [referFriendEnabled, setReferFriendEnabled] = useState(false)
    const [referFriendEmail, setReferFriendEmail] = useState('')
    const [referFriendError, setReferFriendError] = useState('')

    useEffect(() => {
        if (user && !user.lightMode) {
            setClassNames(getClassNames('darkMode'))
        } else if (user && user.lightMode) {
            setClassNames(getClassNames('lightMode'))
        }
    }, [user, getClassNames])

    const handleJoinCourseFormChange = (e) => {
        const { name, value } = e.target
        setJoinCourseForm({
            ...joinCourseForm,
            [name]: value
        })
    }

    const handleJoinCourseFormSubmit = async (e) => {
        e.preventDefault()

        const response = await fetch(`/api/course/join`, {
            method: 'POST',
            body: JSON.stringify(joinCourseForm),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })

        const json = await response.json()
        console.log(json)

        if (response.ok) {
            setJoinCourseFormError()
            setJoinCourseEnabled(false)
            setJoinedCourseList(prev => [...prev, json])
        } else {
            setJoinCourseFormError(json.error)
        }
    }

    const handleCreateCourseFormChange = (e) => {
        const { name, value } = e.target
        setCreateCourseForm({
            ...createCourseForm,
            [name]: value
        })
    }
    const handleCreateCourseFormSubmit = async (e) => {
        e.preventDefault()

        const response = await fetch(`/api/course`, {
            method: 'POST',
            body: JSON.stringify(createCourseForm),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })

        const json = await response.json()

        if (response.ok) {
            setCreateCourseEnabled(false)
            setMyCourseList(prev => [...prev, json])
        } else {
            setCreateCourseFormError(json.error)
        }

    }

    useEffect(() => {

        if (!user.userId) return

        fetch(`/api/user/${user.userId}/courses/coordinating`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })
            .then(resp => resp.json())
            .then(json => {
                setMyCourseList(json.courses)
            })

        fetch(`/api/user/${user.userId}/courses/joined`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })
            .then(resp => resp.json())
            .then(json => {
                setJoinedCourseList(json.courses)
            })

        fetch(`/api/user/${user.userId}/invites`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })
            .then(resp => resp.json())
            .then(json => {
                setInviteList(json.invites)
            })

    }, [user])

    const handleReferFriendSubmit = async (e) => {
        e.preventDefault()

        try {

            const response = await fetch(`/api/user/refer`, {
                method: 'POST',
                body: JSON.stringify({ email: referFriendEmail }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })

            if (!response.ok) {
                throw Error('Failed to send reference email')
            }

            setReferFriendEnabled(false)
            alert('Reference email sent')
        } catch (err) {
            console.log(err)
            setReferFriendError('Failed to send email')
        }

    }

    return (
        <div className={classNames.pageContainer}>
            <div className='home-lnav flex-col'>
                <button
                    className={classNames.button}
                    onClick={() => {
                        setCreateCourseEnabled(true)
                    }}
                >
                    Create a Course
                </button>
                <button
                    className={classNames.button}
                    onClick={() => {
                        setJoinCourseEnabled(true)
                    }}
                >
                    Join a Course
                </button>

                <div style={{ marginTop: '25px', paddingLeft: '15px', paddingRight: '15px' }}>
                    <div className='content-card'>
                        <h3>Friends ({friendsList ? friendsList.length : 0})</h3>
                        {friendsList && friendsList.map((friend, index) => (
                            <div key={index} className='flex'>
                                <span style={{ flex: 1 }}>{`${friend.firstName} ${friend.lastName}`}</span> 
                                <GrFormClose size='25' onClick={() => removeFriend(friend.userId)}/>
                            </div>
                        ))}
                        <br />
                        <span style={{ color: 'grey', textDecoration: 'underline', fontStyle: 'italic'}} onClick={() => setReferFriendEnabled(true)}>Refer a friend</span>
                    </div>
                </div>
            </div>

            <div className='home-content'>
                <div className='content-card'>
                    {myCourseList &&
                        <Collapsible title={`My Courses (${myCourseList.length})`} defaultState={true}>
                            {myCourseList.map(course =>
                                <CourseDetails
                                    key={course.courseId}
                                    course={course}
                                    onDelete={() => setMyCourseList(myCourseList.filter(item => item.courseId !== course.courseId))}
                                />
                            )}
                        </Collapsible>
                    }
                </div>
                <div className='content-card'>
                    {joinedCourseList &&
                        <Collapsible title={`Joined Courses (${joinedCourseList.length})`} defaultState={true}>
                            {joinedCourseList.map(course =>
                                <CourseDetails
                                    key={course.courseId}
                                    course={course}
                                    onDelete={() => setJoinedCourseList(joinedCourseList.filter(item => item.courseId !== course.courseId))}
                                />
                            )}
                        </Collapsible>
                    }
                </div>

                <div className='content-card'>
                    {inviteList &&
                        <Collapsible title={`Course Invites (${inviteList.length})`} defaultState={true}>
                            {inviteList.map((invite, idx) =>
                                <InviteDetails
                                    key={idx}
                                    invite={invite}
                                    onAccept={() => {
                                        setInviteList(inviteList.filter(item => item.courseId !== invite.courseId))
                                        setJoinedCourseList(prev => [...prev, invite])
                                    }}
                                    onDecline={() => {
                                        setInviteList(inviteList.filter(item => item.courseId !== invite.courseId))
                                    }}
                                />
                            )}
                        </Collapsible>
                    }
                </div>
                <GameList />
            </div>

            <PopupForm
                title='Create a New Course'
                isOpen={createCourseEnabled}
                onClose={() => {
                    setCreateCourseEnabled(false)
                    setCreateCourseFormError()
                }}
                onSubmit={handleCreateCourseFormSubmit}
                errorText={createCourseFormError}
            >
                <div>
                    <label>Course Name</label>
                    <input
                        type='text'
                        name='courseName'
                        placeholder='Course Name'
                        value={createCourseForm.courseName}
                        onChange={handleCreateCourseFormChange}
                        required
                    />
                </div>
                <div>
                    <label>Description</label>
                    <input
                        type='text'
                        name='courseDescription'
                        placeholder='Course Description'
                        value={createCourseForm.courseDescription}
                        onChange={handleCreateCourseFormChange}
                    />
                </div>
            </PopupForm>

            <PopupForm
                title='Join a Course'
                isOpen={joinCourseEnabled}
                onClose={() => {
                    setJoinCourseEnabled(false)
                    setJoinCourseFormError()
                }}
                onSubmit={handleJoinCourseFormSubmit}
                errorText={joinCourseFormError}
            >
                <div>
                    <label>Join Code</label>
                    <input
                        type='text'
                        name='joinCode'
                        placeholder='Course join code'
                        value={joinCourseForm.joinCode}
                        onChange={handleJoinCourseFormChange}
                    />
                </div>
            </PopupForm>

            <PopupForm
                title='Refer a Friend'
                isOpen={referFriendEnabled}
                onClose={() => {
                    setReferFriendEnabled(false)
                    setReferFriendEmail('')
                    setReferFriendError()
                }}
                onSubmit={handleReferFriendSubmit}
                errorText={referFriendError} 
            >
                <div>
                    <label>Email</label>
                    <input
                        type='email'
                        name='referFriendEmail'
                        placeholder='example@email.com'
                        value={referFriendEmail}
                        onChange={(e) => setReferFriendEmail(e.target.value)}
                    />
                </div>
            </PopupForm>

        </div>
    )

}

export default Home
