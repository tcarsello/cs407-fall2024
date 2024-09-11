import '../css/navbar.css'

import { Link } from 'react-router-dom'

const Navbar = () => {
    return (
        <nav className='top-nav'>
            <Link
                className='top-nav-brand'
                to='/'
            >
                Course Clash
            </Link>
        </nav>
    )
}

export default Navbar