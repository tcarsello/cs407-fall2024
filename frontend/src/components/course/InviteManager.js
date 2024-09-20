import { GrFormClose } from 'react-icons/gr'
import { useAuthContext } from '../../hooks/UseAuthContext'

const InviteManager = ({ invite, onDelete }) => {

    const { user } = useAuthContext()

    const handleCancel = () => {

        try {

            const bodyContent = {
                courseId: invite.courseId,
                email: invite.email
            }
            fetch(`/api/invite`, {
                method: 'DELETE',
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })
                .then(onDelete)

        } catch (err) {
            console.err(err)
        }

    }

    return (
        <div className='invite-manager'>
            <p style={{ display: 'inline-block' }}>
                {invite.email}
            </p>
            <GrFormClose size='25' style={{ marginLeft: '10px' }} onClick={handleCancel} />
        </div>
    )
}

export default InviteManager