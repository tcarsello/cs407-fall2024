import { useState, useEffect } from 'react'

import { useCourseContext } from "../../context/CourseContext"
import { useAuthContext } from "../../hooks/UseAuthContext"

import Collapsible from "../Collapsible"
import PopupForm from "../PopupForm"

import InviteManager from './InviteManager'
import MemberDetails from './MemberDetails'

const CourseMembers = () => {
    
    const { user } = useAuthContext()
    const { course } = useCourseContext()

    const [inviteList, setInviteList] = useState([])
    const [memberList, setMemberList] = useState([])

    const [inviteUserEnabled, setInviteUserEnabled] = useState(false)
    const [inviteUserError, setInviteUserError] = useState()
    const [inviteUserForm, setInviteUserForm] = useState({
        email: ''
    })

    useEffect(() => {

        const fetchInvites = async () => {
            try {

                const response = await fetch(`/api/course/${course.courseId}/invites`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                })
                const json = await response.json()
                setInviteList(json.invites)

            } catch (err) {
                console.error(err)
            }
        }

        const fetchMembers = async () => {
            try {

                const response = await fetch(`/api/course/${course.courseId}/members`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                })
                const json = await response.json()
                setMemberList(json.members)

            } catch (err) {
                console.error(err)
            }
        }

        if (user && course) {
            fetchInvites()
            fetchMembers()
        }

    }, [user, course])

    const handleInviteUserFormChange = (e) => {
        const { name, value } = e.target
        setInviteUserForm({...inviteUserForm, [name]: value})
    }

    const handleInviteUserFormSubmit = async (e) => {
        e.preventDefault()
        setInviteUserError()

        const response = await fetch(`/api/course/${course.courseId}/invite`, {
            method: 'POST',
            body: JSON.stringify(inviteUserForm),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })

        const json = await response.json()

        if (!response.ok) {
            setInviteUserError(json.error || "Failed to invite user")
            return
        }

        setInviteUserEnabled(false)
        setInviteList(prev => [...prev, json.invite])
    }

    return (
        <>
            {user.userId === course.coordinatorId &&
                <div className='content-card'>
                    <h2 style={{ margin: 0 }}>User Invites</h2>
                    <button className='standard-button' style={{marginBottom: '15px'}} onClick={() => setInviteUserEnabled(true)}>Invite Users</button>
                    <Collapsible
                        title={`Pending Invites (${inviteList ? inviteList.length : 0})`}
                    >
                    
                        {inviteList &&
                            inviteList.map((invite, index) =>
                            <InviteManager
                                key={invite.email}
                                invite={invite}
                                onDelete={() => { setInviteList(inviteList.filter(item => item.email !== invite.email)) }}
                            />)
                        }
                    </Collapsible>
                </div>
            }

            <div className='content-card'>
                <Collapsible
                    title={`Course Members (${memberList ? memberList.length : 0})`}
                    defaultState={true}
                >
                    {memberList &&
                        memberList.map((member, index) =>
                        <MemberDetails
                            key={member.userId}
                            member={member}
                            onDelete={() => { setMemberList(memberList.filter(item => item.userId !== member.userId)) }}
                        />)
                    }
                </Collapsible>
            </div>

            <PopupForm
                title='Invite a user'
                isOpen={inviteUserEnabled}
                onClose={() => {
                    setInviteUserEnabled(false)
                    setInviteUserError()
                }}
                onSubmit={handleInviteUserFormSubmit}
                errorText={inviteUserError}
            >
                <div>
                    <label>Email Address</label>
                    <input
                        type='email'
                        name='email'
                        placeholder='Student email address'
                        value={inviteUserForm.email}
                        onChange={handleInviteUserFormChange}
                        required
                    />
                </div>
            </PopupForm>
        </>
    )
}

export default CourseMembers
