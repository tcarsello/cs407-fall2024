import '../css/navbar.css'
import '../css/general.css'

import { Link } from 'react-router-dom'

import { useAuthContext } from '../hooks/UseAuthContext'

const Navbar = () => {

    const { user, dispatch } = useAuthContext()

    const handleLogout = async () => {
        localStorage.removeItem('user')
        dispatch({ type: 'LOGOUT' })
    }

    return (
        <nav className='top-nav'>
            <Link
                className='top-nav-brand'
                to='/'
            >
                Course Clash
            </Link>
            <div className='top-nav-links'>
                {user ?
                    <>
                        <span>{`${user.firstName} ${user.lastName} <${user.email}>`}</span>
                        <button
                            className='standard-button'
                            style={{marginLeft: '15px'}}
                            onClick={handleLogout}
                        >
                            Log Out
                        </button>
                    </>
                    :
                    <>
                        <Link className='standard-button' to='login'>Log In / Register</Link>
                    </>
                }
            </div>
        </nav>
    )
}

export default Navbar