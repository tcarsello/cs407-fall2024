import { useState, useEffect } from 'react'

import { useCourseContext } from "../../context/CourseContext"
import { useAuthContext } from "../../hooks/UseAuthContext"

const CourseSettings = () => {
    
    const { user } = useAuthContext()
    const { course } = useCourseContext()
    
    const [accessTypeSelection, setAccessTypeSelection] = useState('invite')
    const [accessCode, setAccessCode] = useState()

    const handleAccessChange = (e) => {
        setAccessTypeSelection(e.target.value)
    }

    const handleAccessSelectionSubmit = async () => {

        const bodyContent = {
            accessType: accessTypeSelection
        }


        const response = await fetch(`/api/course/${course.courseId}/settings`, {
            method: 'PUT',
            body: JSON.stringify(bodyContent),
            headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
        })

        const json = await response.json()

        setAccessCode(json.joinCode)

    }

    useEffect(() => {

        const fetchSettings = async () => {
            
            try {
                const response = await fetch(`/api/course/${course.courseId}/settings`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                })
                const json = await response.json()
                setAccessCode(json.joinCode)
            } catch (err) {
                console.error(err)
            }

        }

        if (user && course) {
            fetchSettings()
        }

    }, [user, course])

    return (
        <>
            <div className='content-card'>
                <h2 style={{ marginTop: 0 }}>Course Access Type</h2>
                <p>This course is currently in <strong>{accessCode ? 'Join Code' : "Invite Only"}</strong> mode.</p>
                {accessCode && <p>The join code is: <strong>{accessCode}</strong></p>}
                <label>
                    <input
                        type='radio'
                        name='access'
                        value='invite'
                        checked={accessTypeSelection === 'invite'}
                        onChange={handleAccessChange}
                    />
                    Invite Only
                </label>
                <br />
                <label>
                    <input
                        type='radio'
                        name='access'
                        value='code'
                        checked={accessTypeSelection === 'code'}
                        onChange={handleAccessChange}
                    />
                    Generate Join Code
                </label>
                <br />
                <button
                    className='standard-button'
                    onClick={handleAccessSelectionSubmit}
                >Submit</button>
            </div>
        </>
    )
}

export default CourseSettings