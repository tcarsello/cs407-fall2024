import { useState, useEffect, createContext, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthContext } from '../hooks/UseAuthContext'

export const DisplayContext = createContext()

export const useDisplayContext = () => {
    return useContext(DisplayContext)
}

export const DisplayContextProvider = ({ children }) => {

    const getClassNames = (mode) => {

        if (mode != null) {
            if (mode == 'lightMode') {
                return {
                    settingsCard : 'settings-card',
                    settingsPageContainer: 'settings-page-container',
                    standardFormInput: 'standard-form-input',
                    text: 'light-text',
                    button: 'standard-button light-button-scheme',
                    topNavBrand: 'top-nav-brand light-text',
                    topNav: 'top-nav overlay-light',
                    topNavLinks: 'top-nav-links light-text',
                    pageContainer: 'page-container flex background-light',
                    contentCard : 'content-card overlay-light'
                }
            }
    
            return {
                settingsCard : 'settings-card foreground-dark',
                settingsPageContainer: 'settings-page-container background-dark',
                standardFormInput: 'standard-form-input emphasis-dark',
                text: 'dark-text',
                button: 'standard-button dark-button-scheme',
                topNavBrand: 'top-nav-brand dark-text',
                topNav: 'top-nav overlay-dark',
                topNavLinks: 'top-nav-links dark-text',
                pageContainer: 'page-container flex background-dark',
                contentCard : 'content-card foreground-dark'
            }
        }

        return {
            settingsCard : 'settings-card',
            settingsPageContainer: 'settings-page-container',
            standardFormInput: 'standard-form-input',
            text: 'light-text',
            button: 'standard-button light-button-scheme',
            topNavBrand: 'top-nav-brand light-text',
            topNav: 'top-nav overlay-light',
            topNavLinks: 'top-nav-links light-text',
            pageContainer: 'page-container flex background-light',
            contentCard : 'content-card overlay-light'
        }
    }

    return (
        <DisplayContext.Provider value={{getClassNames}}>
            {children}
        </DisplayContext.Provider>
    )

}