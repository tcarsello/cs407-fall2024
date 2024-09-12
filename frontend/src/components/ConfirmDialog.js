import { useState } from 'react'

import '../css/general.css'

const ConfirmDialog = ({ text, isOpen, onClose, onConfirm }) => {
    
    if (!isOpen) return null

    return (
        <div className='dialog'>
            <div className='dialog-content'>
                <p>{text}</p>
                <button className='standard-button' onClick={onConfirm} style={{marginRight: '5px'}}>Confirm</button>
                <button className='standard-button' onClick={onClose}>Cancel</button>
            </div>
        </div>
    )

}

export default ConfirmDialog