import { useState, useEffect, createContext, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthContext } from '../hooks/UseAuthContext'
import { useFriendContext } from './FriendContext'

export const CourseContext = createContext()

export const useCourseContext = () => {
    return useContext(CourseContext)
}

export const CourseProvider = ({ children }) => {

    const { user } = useAuthContext()
    const { friendsList, removeFriend, addFriend } = useFriendContext()

    const { courseId } = useParams()
    const [course, setCourse] = useState()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState()

    const [courseMembers, setCourseMembers] = useState()
    const [courseFriends, setCourseFriends] = useState([])

    useEffect(() => {

        const fetchCourse = async () => {
            try {

                let response = await fetch(`/api/course/${courseId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                })
                if (!response.ok) throw Error('Failed to load course')

                let json = await response.json()
                setCourse(json)

                // Fetch course members
                response = await fetch(`/api/course/${courseId}/members`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                })
                if (!response.ok) throw Error('Failed to get course members')
                json = await response.json()

                setCourseMembers(json.members)

            } catch (err) {
                setError(err)
            } finally {
                setLoading(false)
            }
        }

        fetchCourse()

    }, [courseId, user.token])

    useEffect(() => {

        if (courseMembers) {
            setCourseFriends(friendsList.filter(friend => courseMembers.some(member => member.userId === friend.userId)))
        }

    }, [courseMembers, friendsList])

    const removeCourseFriend = (friendId) => {
        removeFriend(friendId)
    }

    const addCourseFriend = (friendId) => {
        addFriend(friendId)
    }

    return (
        <CourseContext.Provider value={{ course, loading, error, courseFriends, removeCourseFriend, addCourseFriend }}>
            {children}
        </CourseContext.Provider>
    )

}
