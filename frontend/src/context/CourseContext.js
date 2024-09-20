import { useState, useEffect, createContext, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthContext } from '../hooks/UseAuthContext'

export const CourseContext = createContext()

export const useCourseContext = () => {
    return useContext(CourseContext)
}

export const CourseProvider = ({ children }) => {

    const { user } = useAuthContext()

    const { courseId } = useParams()
    const [course, setCourse] = useState()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState()

    useEffect(() => {

        const fetchCourse = async () => {
            try {

                const response = await fetch(`/api/course/${courseId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                })
                if (!response.ok) throw 'Failed to load course'

                const json = await response.json()
                setCourse(json)

            } catch (err) {I
                setError(err)
            } finally {
                setLoading(false)
            }
        }

        fetchCourse()

    }, [courseId])

    return (
        <CourseContext.Provider value={{ course, loading, error }}>
            {children}
        </CourseContext.Provider>
    )

}