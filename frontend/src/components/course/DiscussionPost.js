import { useState } from 'react'

import '@fortawesome/fontawesome-free/css/all.min.css';
import '../css/collapsible.css'

const DicussionPost = ({ Post }) => {

    return (
        <Collapsible title={`Joined Courses (${joinedCourseList.length})`} defaultState={true}>
        {joinedCourseList.map(course =>
            <CourseDetails
                key={course.courseId}
                course={course}
                onDelete={() => setJoinedCourseList(joinedCourseList.filter(item => item.courseId !== course.courseId))}
            />
        )}
        </Collapsible>
    )
}

export default Collapsible
