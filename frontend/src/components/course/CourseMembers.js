import { useState, useEffect } from 'react'

import { useCourseContext } from "../../context/CourseContext"
import { useAuthContext } from "../../hooks/UseAuthContext"

import Collapsible from "../Collapsible"
import PopupForm from "../PopupForm"

import InviteManager from './InviteManager'
import MemberDetails from './MemberDetails'

import { GrFormClose } from 'react-icons/gr'

const CourseMembers = () => {

    const { user } = useAuthContext()
    const { course, courseFriends, addCourseFriend, removeCourseFriend } = useCourseContext()

    const [inviteList, setInviteList] = useState([])
    const [memberList, setMemberList] = useState([])

    const [inviteUserEnabled, setInviteUserEnabled] = useState(false)
    const [inviteUserError, setInviteUserError] = useState()
    const [inviteUserForm, setInviteUserForm] = useState({
        email: ''
    })

    const [addFriendEnabled, setAddFriendEnabled] = useState(false)
    const [addFriendId, setAddFriendId] = useState(-1)

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
        setInviteUserForm({ ...inviteUserForm, [name]: value })
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

    const handleAddFriendSubmit = async (e) => {
        e.preventDefault()

        try {
            if (parseInt(addFriendId) >= 0) addCourseFriend(addFriendId)
        } catch (err) { console.error(err) }

        setAddFriendEnabled(false)
        setAddFriendId(-1)
    }

    return (
        <div className='flex'>
            <div style={{ flex: 1 }}>
                {user.userId === course.coordinatorId &&
                    <div className='content-card'>
                        <h2 style={{ margin: 0 }}>User Invites</h2>
                        <button className='standard-button' style={{ marginBottom: '15px' }} onClick={() => setInviteUserEnabled(true)}>Invite Users</button>
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
            </div>

            <div style={{ width: '15%', minWidth: '250px', marginLeft: '15px'}}>
                <div className='content-card'>
                    <h3 style={{ margin: 0, textAlign: 'center' }}>Friends</h3>     
                    <button className='standard-button' style={{ width: '100%' }} onClick={() => {setAddFriendEnabled(true)}}>Add Friend</button>
                    <br />
                    <br />
                    {courseFriends.map((friend, index) => (
                        <div key={index} className='flex'>
                            <span style={{ flex: 1 }}>{`${friend.firstName} ${friend.lastName}`}</span> 
                            <GrFormClose size='25' onClick={() => {removeCourseFriend(friend.userId)}}/>
                        </div>
                    ))}
                </div>
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

            <PopupForm
                title='Add a Friend'
                isOpen={addFriendEnabled}
                onClose={() => {
                    setAddFriendEnabled(false)
                }}
                onSubmit={handleAddFriendSubmit}
            >
                <div>
                    <label>Student</label>
                    <select
                        id='userSelect'
                        value={addFriendId}
                        onChange={(e) => setAddFriendId(e.target.value)}
                        required
                    >
                        <option value={-1}></option>
                        {memberList && memberList.filter(member => member.userId !== user.userId && !courseFriends.some(friend => friend.userId === member.userId)).map((member, index) => (
                            <option key={index} value={member.userId}>
                                {`${member.firstName} ${member.lastName}`}
                            </option>
                        ))}
                    </select>
                </div>
            </PopupForm>
            
        </div>
    )
}

export default CourseMembers
