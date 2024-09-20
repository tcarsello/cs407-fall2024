import { GrFormClose } from 'react-icons/gr'
import { useCourseContext } from '../../context/CourseContext'
import { useAuthContext } from '../../hooks/UseAuthContext'

const MemberDetails = ({ member, onDelete }) => {

    const { user } = useAuthContext()
    const { course } = useCourseContext()

    const handleKick = () => {

        try {

            const bodyContent = {
                userId: member.userId
            }
            fetch(`/api/course/${course.courseId}/remove`, {
                method: 'POST',
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })
                .then(onDelete)

        } catch (err) {
            console.error(err)
        }

    }

    return (
        <div className='member-manager'>
            <p style={{ display: 'inline-block' }}>
                {`${member.firstName} ${member.lastName}`}
            </p>
            {user.userId === course.coordinatorId && member.userId !== course.coordinatorId &&
                <GrFormClose size='25' style={{ marginLeft: '10px' }} onClick={handleKick} />
            }
        </div>
    )

}

export default MemberDetails