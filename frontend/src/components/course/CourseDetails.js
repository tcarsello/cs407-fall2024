import { useState } from 'react'
import { useAuthContext } from '../../hooks/UseAuthContext'

import { Link } from 'react-router-dom'

import ConfirmDialog from '../ConfirmDialog'

import { GrTrash, GrClose } from 'react-icons/gr'

const CourseDetails = ({ course, onDelete }) => {

    const { user } = useAuthContext()

    const [deleteCoursePopupEnabled, setDeleteCoursePopupEnabled] = useState(false)
    const [leaveCoursePopupEnabled, setLeaveCoursePopupEnabled] = useState(false)

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

    const handleLeaveCourse = async () => {
        const response = await fetch(`/api/course/${course.courseId}/leave`, {
            method: 'POST',
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
                <Link to={`/course/${course.courseId}`} style={{all: 'unset', flex: 1}}>
                    <h2>{course.courseName}</h2>
                </Link>
                {course.coordinatorId == user.userId ?
                    <GrTrash style={{width: '50px'}} onClick={() => {setDeleteCoursePopupEnabled(true)}} />
                    : <GrClose style={{width: '50px'}} onClick={() => {setLeaveCoursePopupEnabled(true)}} />
                }
            </div>
            <span>{course.courseDescription}</span>

            <ConfirmDialog
                text='Are you sure you want to delete this course?'
                isOpen={deleteCoursePopupEnabled}
                onClose={() => setDeleteCoursePopupEnabled(false)}
                onConfirm={() => {
                    setDeleteCoursePopupEnabled(false)
                    handleDeleteCourse()
                }}
            />

            <ConfirmDialog
                text='Are you sure you want to leave this course?'
                isOpen={leaveCoursePopupEnabled}
                onClose={() => setLeaveCoursePopupEnabled(false)}
                onConfirm={() => {
                    setLeaveCoursePopupEnabled(false)
                    handleLeaveCourse()
                }}
            />

        </div>
    )
    
}

export default CourseDetails