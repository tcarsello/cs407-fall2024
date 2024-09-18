import { GrFormCheckmark, GrFormClose } from 'react-icons/gr'
import { useAuthContext } from '../../hooks/UseAuthContext'

const InviteDetails = ({ invite, onAccept, onDecline }) => {

    const { user } = useAuthContext()

    const handleAcceptInvite = async () => {

        const response = await fetch(`/api/course/${invite.courseId}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })

        if (response.ok) {
            onAccept()
        }

    }

    const handleDeclineInvite = async () => {

        const response = await fetch(`/api/course/${invite.courseId}/decline`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })

        if (response.ok) {
            onDecline()
        }

    }

    return (
        <div className='invite-details'>
            <div className='invite-details-header'>
                <h2>{invite && invite.courseName}</h2>
                <GrFormCheckmark size='35' onClick={handleAcceptInvite}/>
                <GrFormClose size='35' onClick={handleDeclineInvite}/>
            </div>
            {invite && <span>{invite.courseDescription}</span>}
        </div>
    )
}

export default InviteDetails