import { CourseProvider, useCourseContext } from "../context/CourseContext"

const CourseHome = () => {

    return (
        <CourseProvider>
            <CourseHomeContent />
        </CourseProvider>
    )
    
}

const CourseHomeContent = () => {

    const { course, loading, error } = useCourseContext()

    if (loading) return <p>Loading</p>
    if (error) return <p>{error}</p>
    if (!course) return <p>No course data available</p>

    return (<h1>{course.courseName}</h1>)
}

export default CourseHome