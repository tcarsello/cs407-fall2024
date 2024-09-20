import { useState, useEffect } from 'react'

import { useCourseContext } from "../../context/CourseContext"
import { useAuthContext } from "../../hooks/UseAuthContext"

const CourseSettings = () => {
    
    const { user } = useAuthContext()
    const { course } = useCourseContext()
    
    const [accessTypeSelection, setAccessTypeSelection] = useState('invite')
    const [accessCode, setAccessCode] = useState()

    const [gameSettingsForm, setGameSettingsForm] = useState({
        gameLimit: '10'
    })
    const [gameSettingsFormError, setGameSettingsFormError] = useState()
    const [gameSettingsFormMsg, setGameSettingsFormMsg] = useState()

    const putSettings = async () => {
        const bodyContent = {
            accessType: accessTypeSelection,
            gameLimit: gameSettingsForm.gameLimit,
        }

        const response = await fetch(`/api/course/${course.courseId}/settings`, {
            method: 'PUT',
            body: JSON.stringify(bodyContent),
            headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
        })
        return response
    }

    const handleAccessChange = (e) => {
        setAccessTypeSelection(e.target.value)
    }

    const handleAccessSelectionSubmit = async () => {

        const response = await putSettings()
        const json = await response.json()

        setAccessCode(json.joinCode)

    }

    const handleGameSettingsFormChange = (e) => {
        const { name, value } = e.target
        setGameSettingsForm({
            ...gameSettingsForm,
            [name]: value
        })
    }

    const handleGameSettingsFormSubmit = async (e) => {
        e.preventDefault()

        const response = await putSettings()
        const json = await response.json()

        if (response.ok) {
            setGameSettingsFormError()
            setGameSettingsFormMsg('Updated!')
        } else {
            setGameSettingsFormError(json.error)
        }
        
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
                setGameSettingsForm({...gameSettingsForm, gameLimit: json.gameLimit})
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
            
            <div className='content-card'>
                <h2 style={{marginTop: 0}}>Game Settings</h2>
                <form className='standard-form' onSubmit={handleGameSettingsFormSubmit}>
                    <div>
                        <label>Student Game Limit</label>
                        <input
                            type='text'
                            name='gameLimit'
                            value={gameSettingsForm.gameLimit}
                            placeholder='Limit'
                            onChange={handleGameSettingsFormChange}
                        />
                    </div>
                    <button type='submit' className='standard-button'>Submit</button>
                    {gameSettingsFormError && <p className='form-error'>{gameSettingsFormError}</p>}
                    {gameSettingsFormMsg && <p className='form-msg'>{gameSettingsFormMsg}</p>}
                </form>
            </div>
            
        </>
    )
}

export default CourseSettings