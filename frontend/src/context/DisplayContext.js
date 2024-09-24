import { useState, useEffect, createContext, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthContext } from '../hooks/UseAuthContext'

export const DisplayContext = createContext()

export const useDisplayContext = () => {
    return useContext(DisplayContext)
}

export const DisplayContextProvider = ({ children }) => {

    const { user } = useAuthContext()
    const [classNames, setClassNames] = useState()

    useEffect(() => {

        const getClassNames = () => {
            if (user) {
                return {
                    settingsCard : 'settings-card',
                    settingsPageContainer: 'settings-page-container',
                    standardFormInput: 'standard-form-input',
                    text: 'light-text',
                    button: 'standard-button light-button-scheme'
                }
            }
    
            return {
                settingsCard : 'settings-card foreground-dark',
                settingsPageContainer: 'settings-page-container background-dark',
                standardFormInput: 'standard-form-input emphasis-dark',
                text: 'dark-text',
                button: 'standard-button dark-button-scheme'
            }
        }

        setClassNames(getClassNames())

    }, [])

    return (
        <DisplayContext.Provider value={{classNames}}>
            {children}
        </DisplayContext.Provider>
    )

}