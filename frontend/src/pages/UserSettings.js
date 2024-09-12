import '../css/settings.css'
import '../css/general.css'
import '../css/login.css'

import { useState } from 'react'

import { useAuthContext } from '../hooks/UseAuthContext'

const UserSettings = () => {

    const { user, dispatch } = useAuthContext()

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
        dispatch({type: 'LOGIN', payload: json})

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
        dispatch({type: 'LOGIN', payload: json})
    }

    return (
        <div className='settings-page-container'>

            <div className='settings-card'>
                <h2>Account Details</h2>
                <form onSubmit={handleUpdateAccount}>
                    <div>
                        <label>Email Address</label>
                        <input
                            className='standard-form-input'
                            type='email'
                            name='email'
                            placeholder='Email'
                            value={accountForm.email}
                            onChange={handleAccountChange}
                            required
                        />
                    </div>
                    <div>
                    <label>First Name</label>
                        <input
                            className='standard-form-input'
                            type='text'
                            name='firstName'
                            placeholder='First Name'
                            value={accountForm.firstName}
                            onChange={handleAccountChange}
                            required
                        />
                    </div>
                    <div>
                    <label>Last Name</label>
                        <input
                            className='standard-form-input'
                            type='text'
                            name='lastName'
                            placeholder='Last Name'
                            value={accountForm.lastName}
                            onChange={handleAccountChange}
                            required
                        />
                    </div>
                    <button className='standard-button'>Update Account</button>
                    {accountError ? <p className='form-error'>{accountError}</p> : null}
                    {accountMsg ? <p className='form-msg'>{accountMsg}</p> : null}
                </form>
            </div>

            <div className='settings-card'>
                <h2>Change Password</h2>
                <form onSubmit={handleChangePassword}>
                    <div>
                        <label>New Password</label>
                        <input
                            className='standard-form-input'
                            type='password'
                            name='password'
                            placeholder='New Password'
                            value={passwordForm.password}
                            onChange={handlePasswordFormChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Confirm Password</label>
                        <input
                            className='standard-form-input'
                            type='password'
                            name='confirmPassword'
                            placeholder='Confirm New Password'
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordFormChange}
                            required
                        />
                    </div>
                    <button className='standard-button'>Change Password</button>
                    {passwordError ? <p className='form-error'>{passwordError}</p> : null}
                    {passwordMsg ? <p className='form-msg'>{passwordMsg}</p> : null}
                </form>
            </div>

        </div>
    )
}

export default UserSettings