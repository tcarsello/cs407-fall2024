//import '../css/navbar.css'
//import '../css/general.css'
import '../css/colors.css'
import '../css/generalAssets.css'

import { Link } from 'react-router-dom'

import { useState, useEffect } from 'react'

import { useAuthContext } from '../hooks/UseAuthContext'

import { useDisplayContext } from '../context/DisplayContext'

import { GrSettingsOption } from 'react-icons/gr'


const Navbar = () => {

    const { user, dispatch } = useAuthContext()
    const {getClassNames} = useDisplayContext()

    const [classNames, setClassNames] = useState(getClassNames('lightMode'))

    useEffect(() => {
        if (user && !user.lightMode) {
            setClassNames(getClassNames('darkMode'))
        } else if (user && user.lightMode) {
            setClassNames(getClassNames('lightMode'))
        }
    }, [user])


    const handleLogout = async () => {
        localStorage.removeItem('user')
        dispatch({ type: 'LOGOUT' })
    }

    return (
        <nav className={classNames.topNav}>
            <Link
                className={classNames.topNavBrand}
                to='/'
            >
                Course Clash
            </Link>
            <div className={classNames.topNavLinks}>
                {user ?
                    <>
                        <span>{`${user.firstName} ${user.lastName} <${user.email}>`}</span>
                        <Link
                            to='/settings'
                            className='unset-all'
                            style={{ marginLeft: '15px' }}
                        >
                            <GrSettingsOption size={24} />
                        </Link>
                        <button
                            className={classNames.button}
                            style={{ marginLeft: '15px', marginTop: '0' }}
                            onClick={handleLogout}
                        >
                            Log Out
                        </button>
                    </>
                    :
                    <>
                        <Link className={classNames.button} to='login'>Log In / Register</Link>
                    </>
                }
            </div>
        </nav>
    )
}

export default Navbar