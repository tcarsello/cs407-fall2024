import { useState } from 'react'

import '../css/login.css'

const Login = () => {

    const [loginForm, setLoginForm] = useState({
        email: '',
        password: ''
    })

    const [registerForm, setRegisterForm] = useState({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: ''
    })

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

    const handleLoginSubmit = (e) => {
        e.preventDefault()
        console.log(loginForm)
    }

    const handleRegisterSubmit = (e) => {
        e.preventDefault()
        console.log(registerForm)
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
                        <button type='submit'>Log In</button>
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
                        <button type='submit'>Register</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login