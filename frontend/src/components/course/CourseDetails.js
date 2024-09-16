import { useState } from 'react'
import { useAuthContext } from '../../hooks/UseAuthContext'

import ConfirmDialog from '../ConfirmDialog'

import { GrTrash } from 'react-icons/gr'

const CourseDetails = ({ course, onDelete }) => {

    const { user } = useAuthContext()

    const [deleteCoursePopupEnabled, setDeleteCoursePopupEnabled] = useState(false)

    const handleDeleteCourse = async () => {
        const response = await fetch(`/api/course/${course.courseId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })
        if (response.ok) {
            onDelete()
        }
    }

    return (
        <div className='course-details'>
            <div className='flex' style={{alignItems: 'center'}}>
                <h2>{course.courseName}</h2>
                {course.coordinatorId == user.userId && <GrTrash style={{width: '50px'}} onClick={() => {setDeleteCoursePopupEnabled(true)}}/>}
            </div>
            <span>{course.courseDescription}</span>

            {deleteCoursePopupEnabled &&
                <ConfirmDialog
                    text='Are you sure you want to delete this course??'
                    isOpen={deleteCoursePopupEnabled}
                    onClose={() => setDeleteCoursePopupEnabled(false) }
                    onConfirm={() => {
                        setDeleteCoursePopupEnabled(false)
                        handleDeleteCourse()
                    }}
                />
            }

        </div>
    )
    
}

export default CourseDetails