import { useState } from 'react'

const CourseDetails = ({ course }) => {

    return (
        <div className='course-details'>
            <h2>{course.courseName}</h2>
            <p>{course.courseDescription}</p>
        </div>
    )
    
}

export default CourseDetails