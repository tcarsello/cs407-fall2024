import { useState } from 'react'

const PopupForm = ({ title, isOpen, onClose, onSubmit, errorText, children }) => {

    if (!isOpen) return null

    return (
        <div className='dialog'>
            <div className='dialog-content'>
                <h3>{title}</h3>
                <form onSubmit={onSubmit} className='standard-form'>
                    { children }
                    <div>
                        <button type="submit" className='standard-button'>Confirm</button>
                        <button className='standard-button' onClick={onClose} style={{marginLeft: '5px'}}>Cancel</button>
                    </div>
                    {errorText ? <p className='form-error'>{errorText}</p> : null}
                </form>
            </div>
        </div>
    )

}

export default PopupForm