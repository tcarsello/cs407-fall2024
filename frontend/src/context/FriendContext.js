import { useState, useEffect, createContext, useContext } from 'react'
import { useAuthContext } from '../hooks/UseAuthContext'

export const FriendContext = createContext()

export const useFriendContext = () => {
    return useContext(FriendContext)
}

export const FriendContextProvider = ({ children }) => {

    const { user } = useAuthContext()

    const [friendsList, setFriendList] = useState([])

    useEffect(() => {

        const fetchFriends = async () => {
            try {

                const response = await fetch(`/api/friendship/all`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                })

                if (!response.ok) throw Error('Failed to load course')

                const json = await response.json()
                setFriendList(json.friends)

            } catch (err) {
                console.error(err)
            }
        }

        if (user) {
            fetchFriends()
        }

    }, [user])

    const addFriend = async (friendId) => {
        try {

            const response = await fetch(`/api/friendship/${friendId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })

            if (response.ok) {
                const json = await response.json()
                setFriendList(prev => [...prev, json.friend])
            }

        } catch (err) {
            console.log(err)
        }
    }

    const removeFriend = async (friendId) => {
        
        setFriendList(prev => prev.filter(friend => friend.userId !== friendId))
        
        try {

            fetch(`/api/friendship/${friendId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })

        } catch (err) {
            console.error(err)
        }
    }

    return (
        <FriendContext.Provider value={{ friendsList, addFriend, removeFriend }}>
            {children}
        </FriendContext.Provider>
    )

}
