import '../css/colors.css'
import '../css/login.css'
import '../css/slider.css'
import '../css/spacers.css'
import '../css/generalAssets.css'

import { useState, useEffect } from 'react'

import { useAuthContext } from '../hooks/UseAuthContext'
import ConfirmDialog from '../components/ConfirmDialog'
import { useDisplayContext } from '../context/DisplayContext'

const UserSettings = () => {

    const { user, dispatch } = useAuthContext()
    const {getClassNames} = useDisplayContext()

    const [classNames, setClassNames] = useState(getClassNames('lightMode'))

    const [accountForm, setAccountForm] = useState({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
    })
    const [accountError, setAccountError] = useState()
    const [accountMsg, setAccountMsg] = useState()

    const [passwordForm, setPasswordForm] = useState({
        password: '',
        confirmPassword: ''
    })
    const [passwordError, setPasswordError] = useState()
    const [passwordMsg, setPasswordMsg] = useState()

    const [profilePictureUrl, setProfilePictureUrl] = useState('')
    const [selectedFile, setSelectedFile] = useState()
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState()
    const [triggerEffect, setTriggerEffect] = useState(false)
    const [fileBase64, setFileBase64] = useState()

    const [deleteDialogEnabled, setDeleteDialogEnabled] = useState(false)

    const [displayMode, setDisplayMode] = useState('light mode')

    useEffect(() => {

        const fetchProfilePicture = async () => {

            try {

                const response = await fetch(`/api/user/${user.userId}/picture`)

                if (!response.ok) {
                    console.error('Failed to fetch profile picture.')
                    return
                }

                const blob = await response.blob()
                const imageUrl = URL.createObjectURL(blob)
                setProfilePictureUrl(imageUrl)
                
                if (!user.lightMode) {
                    setClassNames(getClassNames('darkMode'))
                    setDisplayMode('dark mode')
                }

            } catch (err) {
                console.error('Error fetching profile picture:', err)
            }

        }

        fetchProfilePicture()

    }, [user, triggerEffect])

    const handleAccountChange = (e) => {
        const { name, value } = e.target
        setAccountForm({
            ...accountForm,
            [name]: value
        })
    }

    const handlePasswordFormChange = (e) => {
        const { name, value } = e.target
        setPasswordForm({
            ...passwordForm,
            [name]: value
        })
    }

    const handleUpdateAccount = async (e) => {
        e.preventDefault()

        const response = await fetch(`/api/user/${user.userId}`, {
            method: 'PATCH',
            body: JSON.stringify(accountForm),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })

        const json = await response.json()
        if (!response.ok) {
            setAccountError('Invalid account details')
            setAccountMsg('')
            return
        }

        setAccountError('')
        setAccountMsg('Account details updated!')
        localStorage.setItem('user', JSON.stringify(json))
        dispatch({ type: 'LOGIN', payload: json })

    }

    const handleChangePassword = async (e) => {
        e.preventDefault()

        if (passwordForm.password !== passwordForm.confirmPassword) {
            setPasswordError('Passwords do not match!')
            return
        }

        const response = await fetch(`/api/user/${user.userId}`, {
            method: 'PATCH',
            body: JSON.stringify(passwordForm),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })

        const json = await response.json()
        if (!response.ok) {
            setPasswordError(json.error)
            setPasswordMsg('')
            return
        }

        setPasswordError('')
        setPasswordMsg('Password Changed!')
        localStorage.setItem('user', JSON.stringify(json))
        dispatch({ type: 'LOGIN', payload: json })
    }

    const handleFileChange = (e) => {
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

        const response = await fetch(`/api/user/${user.userId}/picture`, {
            method: 'POST',
            body: JSON.stringify(bodyContent),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })

        const json = await response.json()

        if (!response.ok) {
            setUploadError(json.error || 'Error uploading profile picture')
        } else {
            setTriggerEffect(prev => !prev)
        }

        setIsUploading(false)

    }

    const handleDeleteAccount = async () => {

        const response = await fetch(`/api/user/${user.userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })

        if (response.ok) {
            localStorage.removeItem(user)
            dispatch({ type: 'LOGOUT' })
        }

    }

    const handleDisplayModeChange = async (e) => {
        if (displayMode == 'light mode') {
            setClassNames(getClassNames('darkMode'))
            setDisplayMode('dark mode')
        } else {
            setClassNames(getClassNames('lightMode'))
            setDisplayMode('light mode')
        }

        const response = await fetch(`/api/user/${user.userId}`, {
            method: 'PATCH',
            body: JSON.stringify({lightMode: !user.lightMode}),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })

        user.lightMode = !user.lightMode

    }

    return (
        <div className={classNames.settingsPageContainer}>
            <div className={classNames.settingsCard}>
                <h2 className={classNames.text}>Account Details</h2>
                <form onSubmit={handleUpdateAccount}>
                    <div>
                        <label className={classNames.text}>Email Address</label>
                        <input
                            className={classNames.standardFormInput}
                            type='email'
                            name='email'
                            placeholder='Email'
                            value={accountForm.email}
                            onChange={handleAccountChange}
                            required
                        />
                    </div>
                    <div>
                        <label className={classNames.text}>First Name</label>
                        <input
                            className={classNames.standardFormInput}
                            type='text'
                            name='firstName'
                            placeholder='First Name'
                            value={accountForm.firstName}
                            onChange={handleAccountChange}
                            required
                        />
                    </div>
                    <div>
                        <label className={classNames.text}>Last Name</label>
                        <input
                            className={classNames.standardFormInput}
                            type='text'
                            name='lastName'
                            placeholder='Last Name'
                            value={accountForm.lastName}
                            onChange={handleAccountChange}
                            required
                        />
                    </div>
                    <button className={classNames.button}>Update Account</button>
                    {accountError ? <p className='form-error'>{accountError}</p> : null}
                    {accountMsg ? <p className='form-msg'>{accountMsg}</p> : null}
                </form>
            </div>

            <div className={classNames.settingsCard}>
                <h2 className={classNames.text}>Change Password</h2>
                <form onSubmit={handleChangePassword}>
                    <div>
                        <label className={classNames.text}>New Password</label>
                        <input
                            className={classNames.standardFormInput}
                            type='password'
                            name='password'
                            placeholder='New Password'
                            value={passwordForm.password}
                            onChange={handlePasswordFormChange}
                            required
                        />
                    </div>
                    <div>
                        <label className={classNames.text}>Confirm Password</label>
                        <input
                            className={classNames.standardFormInput}
                            type='password'
                            name='confirmPassword'
                            placeholder='Confirm New Password'
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordFormChange}
                            required
                        />
                    </div>
                    <button className={classNames.button}>Change Password</button>
                    {passwordError ? <p className='form-error'>{passwordError}</p> : null}
                    {passwordMsg ? <p className='form-msg'>{passwordMsg}</p> : null}
                </form>
            </div>

            <div className={classNames.settingsCard}>
                <h2 className={classNames.text}>Profile Picture</h2>
                <div className='flex' style={{ alignItems: 'center' }}>
                    <div className='settings-pfp-container'>
                        {profilePictureUrl && <img src={profilePictureUrl} alt='Profile Picture' />}
                    </div>
                    <div style={{ paddingLeft: '15px' }}>
                        <input
                            className={classNames.standardFormInput}
                            type='file'
                            accept='image/*'
                            onChange={handleFileChange}
                        />
                        <button className={classNames.button} onClick={handleUpload}>{isUploading ? 'Uploading ...' : 'Upload Pofile Picture'}</button>
                        {uploadError && <p className='form-error'>{uploadError}</p>}
                    </div>
                </div>
            </div>

            <div className={classNames.settingsCard}>
                <h2 className={classNames.text}>Display Settings</h2>
                <p className={classNames.text} style={{ margin: '0' }}>Modify your display.</p>
                <div className='vspacer-med'></div>
                <label class="switch">
                    <input type="checkbox" defaultChecked={!user.lightMode} onChange={(e) => handleDisplayModeChange(e)}/>
                    <span class="slider round"></span>
                </label>
                <p className={classNames.text}>{displayMode}</p>
            </div>

            <div className={classNames.settingsCard}>
                <h2 className={classNames.text}>Delete Account</h2>
                <div></div>
                <p className={classNames.text} style={{ margin: '0' }}>If you would like to delete your account, you may. Once deleted, you will not be able to access any of your data.</p>
                <button onClick={() => setDeleteDialogEnabled(true)} className={classNames.button} style={{ backgroundColor: 'crimson' }}>Delete Account </button>
            </div>

            <ConfirmDialog
                text='Are you sure you want to delete your account?'
                isOpen={deleteDialogEnabled}
                onClose={() => setDeleteDialogEnabled(false)}
                onConfirm={() => {
                    setDeleteDialogEnabled(false)
                    handleDeleteAccount()
                }}
            />

        </div>
    )
}

export default UserSettings