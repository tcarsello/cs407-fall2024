import { useState } from 'react'
import { useAuthContext } from '../hooks/UseAuthContext'

const Home = () => {

    const { user } = useAuthContext()

    return (
        <div className='page-container'>
            <span>Hi, {user.firstName}</span>
        </div>
    )

}

export default Home