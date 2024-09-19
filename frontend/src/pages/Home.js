import { useState, useEffect } from 'react'
import { useAuthContext } from '../hooks/UseAuthContext'

import '../css/home.css'
import Collapsible from '../components/Collapsible'
import PopupForm from '../components/PopupForm'
import CourseDetails from '../components/course/CourseDetails'
import InviteDetails from '../components/course/InviteDetails'

const Home = () => {

    const { user } = useAuthContext()

    const [myCourseList, setMyCourseList] = useState([])
    const [joinedCourseList, setJoinedCourseList] = useState([])
    const [inviteList, setInviteList] = useState([])

    const [createCourseEnabled, setCreateCourseEnabled] = useState(false)
    const [createCourseForm, setCreateCourseForm] = useState({
        courseName: '',
        courseDescription: ''
    })
    const [createCourseFormError, setCreateCourseFormError] = useState()
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

    return (
        <div className='page-container flex'>
            <div className='home-lnav flex-col'>
                <button
                    className='standard-button'
                    onClick={() => {
                        setCreateCourseEnabled(true)
                    }}
                >
                    Create a Course
                </button>
                <button className='standard-button'>Join a Course</button>
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
        </div>
    )

}

export default Home
