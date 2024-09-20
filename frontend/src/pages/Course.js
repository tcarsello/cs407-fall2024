import { useState, useEffect } from 'react'

import { CourseProvider, useCourseContext } from "../context/CourseContext"

import { GrChat, GrHomeRounded, GrList, GrSettingsOption, GrContactInfo } from 'react-icons/gr'
import { FaGamepad } from 'react-icons/fa6'

import '../css/course.css'
import { useAuthContext } from '../hooks/UseAuthContext'
import CourseHome from '../components/course/CourseHome'
import CourseStudy from '../components/course/CourseStudy'
import CourseGames from '../components/course/CourseGames'
import CourseDiscussion from '../components/course/CourseDiscussion'
import CourseMembers from '../components/course/CourseMembers'
import CourseSettings from '../components/course/CourseSettings'

const Course = () => {

    return (
        <CourseProvider>
            <CourseHomeContent />
        </CourseProvider>
    )

}

const CourseHomeContent = () => {

    const { user } = useAuthContext()
    const { course, loading, error } = useCourseContext()

    const [mainComponent, setMainComponent] = useState('home')

    const [coordinator, setCoordinator] = useState()

    useEffect(() => {

        if (course) {
            try {
                fetch(`/api/user/${course.coordinatorId}/public`, {
                    method: 'GET'
                })
                    .then(response => response.json())
                    .then(json => setCoordinator(json))
            } catch (err) {
                console.log(err)
            }
        }

    }, [course])


    if (loading) return <p>Loading</p>
    if (error) return <p>{error}</p>
    if (!course) return <p>No course data available</p>

    const renderMainComponent = () => {
        switch (mainComponent) {
            case 'Study': return <CourseStudy />
            case 'Games': return <CourseGames />
            case 'Discussion': return <CourseDiscussion />
            case 'Course Members': return <CourseMembers />
            case 'Settings': return <CourseSettings />
            case 'Home':
            default: return <CourseHome />
        }
    }

    return (
        <div className='page-container flex'>
            <div className='course-nav'>
                <button className='course-nav-link' onClick={() => setMainComponent('Home')}>
                    <GrHomeRounded color='white' size='35' />
                </button>
                <button className='course-nav-link' onClick={() => setMainComponent('Study')}>
                    <GrList color='white' size='35' />
                </button>
                <button className='course-nav-link' onClick={() => setMainComponent('Games')}><
                    FaGamepad color='white' size='35' />
                </button>
                <button className='course-nav-link' onClick={() => setMainComponent('Discussion')}>
                    <GrChat color='white' size='35' />
                </button>
                <button className='course-nav-link' onClick={() => setMainComponent('Course Members')}>
                    <GrContactInfo color='white' size='35' />
                </button>
                {user.userId === course.coordinatorId && <button className='course-nav-link' onClick={() => setMainComponent('Settings')}>
                    <GrSettingsOption color='white' size='35' />
                </button>
                }
            </div>
            <div style={{ flex: '1' }}>
                <div className='page-container flex-col'>
                    <div className='flex' style={{ padding: '15px', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ margin: 0 }}>{`${course.courseName} | ${mainComponent}`}</h1>
                            <span>{course.courseDescription}</span>
                        </div>
                        <div className='bg-accent color-light' style={{ padding: '10px', borderRadius: '10px' }}>
                            <h3 style={{ margin: 0 }}>Course Coordinator</h3>
                            {coordinator && <span>{`${coordinator.firstName} ${coordinator.lastName}`}</span>}
                        </div>
                    </div>
                    <div style={{ flex: 1, padding: '15px', paddingTop: 0 }}>
                        {renderMainComponent()}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Course