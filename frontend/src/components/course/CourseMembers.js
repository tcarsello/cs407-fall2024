import { useCourseContext } from "../../context/CourseContext"
import { useAuthContext } from "../../hooks/UseAuthContext"
import Collapsible from "../Collapsible"

const CourseMembers = () => {
    
    const { user } = useAuthContext()
    const { course } = useCourseContext()

    return (
        <>
            {user.userId === course.coordinatorId &&
                <div className='content-card'>
                    <h2 style={{ margin: 0 }}>User Invites</h2>
                    <button className='standard-button' style={{marginBottom: '15px'}}>Invite Users</button>
                    <Collapsible
                        title='Pending Invites'
                    >

                    </Collapsible>
                </div>
            }
        </>
    )
}

export default CourseMembers