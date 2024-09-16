import { CourseContext } from '../context/CourseContext'
import { useContext } from 'react'

export const useCourseContext = () => {
    return useContext(CourseContext)
}