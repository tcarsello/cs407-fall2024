import { useState } from 'react'
import { useAuthContext } from '../hooks/UseAuthContext'

const Home = () => {

    const { user } = useAuthContext()

    return (
        <div className='page-container'>
            <h1>Hi, {user.firstName}</h1>
        </div>
    )

}

export default Home