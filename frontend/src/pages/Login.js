import { useState } from 'react'
import { useAuthContext } from '../hooks/UseAuthContext'

import '../css/login.css'
import '../css/general.css'

const Login = () => {

    const { dispatch } = useAuthContext()

    const [loginForm, setLoginForm] = useState({
        email: '',
        password: ''
    })
    const [loginError, setLoginError] = useState()

    const [registerForm, setRegisterForm] = useState({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: ''
    })
    const [registerError, setRegisterError] = useState()

    const handleLoginChange = (e) => {
        const { name, value } = e.target
        setLoginForm({
            ...loginForm,
            [name]: value
        })
    }

    const handleRegisterChange = (e) => {
        const { name, value } = e.target
        setRegisterForm({
            ...registerForm,
            [name]: value
        })
    }

    const handleLoginSubmit = async (e) => {
        e.preventDefault()

        const response = await fetch(`/api/user/login`, {
            method: 'POST',
            body: JSON.stringify(loginForm),
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const json = await response.json()
        if (!response.ok) {
            setLoginError(json.error)
            return
        }

        setLoginError('')

        localStorage.setItem('user', JSON.stringify(json))
        dispatch({type: 'LOGIN', payload: json})

    }

    const handleRegisterSubmit = async (e) => {
        e.preventDefault()

        if (registerForm.password !== registerForm.confirmPassword) {
            setRegisterError('Passwords do not match!')
            return
        }

        const response = await fetch(`/api/user/register`, {
            method: 'POST',
            body: JSON.stringify(registerForm),
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const json = await response.json()
        if (!response.ok) {
            setRegisterError(json.error)
            return
        }

        setRegisterError('')
        
        localStorage.setItem('user', JSON.stringify(json))
        dispatch({type: 'LOGIN', payload: json})
        
    }

    return (
        <div className='login-page-container'>
            <div className='login-container'>
                <div className='login-form-container'>
                    <h2>Log In</h2>
                    <form className='login-form' onSubmit={handleLoginSubmit}>
                        <input
                            type='email'
                            name='email'
                            placeholder='Email'
                            value={loginForm.email}
                            onChange={handleLoginChange}
                            required
                        />
                        <input
                            type='password'
                            name='password'
                            placeholder='Password'
                            value={loginForm.password}
                            onChange={handleLoginChange}
                            required
                        />
                        <button type='submit' className='standard-button'>Log In</button>
                        {loginError ? <p className='form-error'>{loginError}</p> : null}
                    </form>
                </div>

                <div className='login-form-container'>
                    <h2>Register</h2>
                    <form className='login-form' onSubmit={handleRegisterSubmit}>
                        <input
                            type='email'
                            name='email'
                            placeholder='Email'
                            value={registerForm.email}
                            onChange={handleRegisterChange}
                            required
                        />
                        <input
                            type='text'
                            name='firstName'
                            placeholder='First Name'
                            value={registerForm.firstName}
                            onChange={handleRegisterChange}
                            required
                        />
                        <input
                            type='text'
                            name='lastName'
                            placeholder='Last Name'
                            value={registerForm.lastName}
                            onChange={handleRegisterChange}
                            required
                        />
                        <input
                            type='password'
                            name='password'
                            placeholder='Password'
                            value={registerForm.password}
                            onChange={handleRegisterChange}
                            required
                        />
                        <input
                            type='password'
                            name='confirmPassword'
                            placeholder='Confirm Password'
                            value={registerForm.confirmPassword}
                            onChange={handleRegisterChange}
                            required
                        />
                        <button type='submit' className='standard-button'>Register</button>
                        {registerError ? <p className='form-error'>{registerError}</p> : null}
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login