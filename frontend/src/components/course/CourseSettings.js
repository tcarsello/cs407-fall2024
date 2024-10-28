import { useState, useEffect } from 'react'

import { useCourseContext } from "../../context/CourseContext"
import { useAuthContext } from "../../hooks/UseAuthContext"

const CourseSettings = () => {

    const { user } = useAuthContext()
    const { course } = useCourseContext()

    const [accessTypeSelection, setAccessTypeSelection] = useState('invite')
    const [accessCode, setAccessCode] = useState()

    const [gameSettingsForm, setGameSettingsForm] = useState({
        gameLimit: course.gameLimit,
        gameRoundLimit: course.gameRoundLimit,
    })
    const [gameSettingsFormError, setGameSettingsFormError] = useState()
    const [gameSettingsFormMsg, setGameSettingsFormMsg] = useState()

    const [coursePictureUrl, setCoursePictureUrl] = useState()
    const [selectedFile, setSelectedFile] = useState()
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState()
    const [triggerEffect, setTriggerEffect] = useState(false)
    const [fileBase64, setFileBase64] = useState()

    const putSettings = async () => {
        const bodyContent = {
            accessType: accessTypeSelection,
            gameLimit: gameSettingsForm.gameLimit,
            gameRoundLimit: gameSettingsForm.gameRoundLimit,
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

    const handleFileChange = async (e) => {
        const file = e.target.files[0]
        setSelectedFile(file)

        const reader = new FileReader()
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1]
            setFileBase64(base64)
        }

        if (file) {
            reader.readAsDataURL(file)
        }
    }

    const handleUpload = async (e) => {
        e.preventDefault()

        if (!selectedFile) {
            setUploadError('Please select a file before uploading')
            return
        }

        setUploadError(null)
        setIsUploading(true)

        const bodyContent = {
            mimeType: selectedFile.type,
            imageBase64: fileBase64
        }

        const response = await fetch(`/api/course/${course.courseId}/picture`, {
            method: 'POST',
            body: JSON.stringify(bodyContent),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })

        try {
            const json = await response.json()
            if (!response.ok) {
                setUploadError(json.error || 'Error uploading profile picture')
            } else {
                setTriggerEffect(prev => !prev)
            }
    
            setIsUploading(false)
        } catch (err) {
            console.log(err)
            setUploadError('Upload error')
            setIsUploading(false)
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
                if (json.joinCode) setAccessTypeSelection('code')
                setGameSettingsForm({ ...gameSettingsForm, gameLimit: json.gameLimit, gameRoundLimit: json.gameRoundLimit })
            } catch (err) {
                console.error(err)
            }

        }

        const fetchCoursePicture = async () => {

            try {

                const response = await fetch(`/api/course/${course.courseId}/picture`)

                if (!response.ok) {
                    console.error('Failed to fetch profile picture.')
                    return
                }

                const blob = await response.blob()
                const imageUrl = URL.createObjectURL(blob)
                setCoursePictureUrl(imageUrl)

            } catch (err) {
                console.error('Error fetching profile picture:', err)
            }

        }

        if (user && course) {
            fetchSettings()
            fetchCoursePicture()
        }

    }, [user, course, triggerEffect])

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
                <h2 style={{ marginTop: 0 }}>Game Settings</h2>
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
                    <div>
                        <label>Round Limit</label>
                        <input
                            type='text'
                            name='gameRoundLimit'
                            value={gameSettingsForm.gameRoundLimit}
                            placeholder='Limit'
                            onChange={handleGameSettingsFormChange}
                        />
                    </div>

                    <button type='submit' className='standard-button'>Submit</button>
                    {gameSettingsFormError && <p className='form-error'>{gameSettingsFormError}</p>}
                    {gameSettingsFormMsg && <p className='form-msg'>{gameSettingsFormMsg}</p>}
                </form>
            </div>

            <div className='content-card'>
                <h2>Course Picture</h2>
                <div className='flex' style={{ alignItems: 'center' }}>
                    <div className='settings-pfp-container'>
                        {coursePictureUrl && <img src={coursePictureUrl} alt='Profile Picture' />}
                    </div>
                    <div style={{ paddingLeft: '15px' }}>
                        <input
                            className='standard-form-input'
                            type='file'
                            accept='image/*'
                            onChange={handleFileChange}
                        />
                        <button className='standard-button' onClick={handleUpload}>{isUploading ? 'Uploading ...' : 'Upload Course Picture'}</button>
                        {uploadError && <p className='form-error'>{uploadError}</p>}
                    </div>
                </div>
            </div>

        </>
    )
}

export default CourseSettings
