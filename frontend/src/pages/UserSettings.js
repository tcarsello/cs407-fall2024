import '../css/colors.css'
import '../css/login.css'
import '../css/slider.css'
import '../css/spacers.css'
import '../css/generalAssets.css'

import { useState, useEffect } from 'react'

import { useAuthContext } from '../hooks/UseAuthContext'
import ConfirmDialog from '../components/ConfirmDialog'
import { useDisplayContext } from '../context/DisplayContext'
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Stack,
    Avatar,
    Switch,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    FormControlLabel,
    IconButton,
    Grid,
    InputAdornment
} from '@mui/material';
import {
    Person,
    Lock,
    Image as ImageIcon,
    Palette,
    Notifications,
    DeleteForever,
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';

const UserSettings = () => {

    const { user, dispatch } = useAuthContext()
    const {getClassNames} = useDisplayContext()

    const [classNames, setClassNames] = useState(getClassNames('lightMode'))

    const [accountForm, setAccountForm] = useState({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
    })
    const [accountError, setAccountError] = useState()
    const [accountMsg, setAccountMsg] = useState()

    const [passwordForm, setPasswordForm] = useState({
        password: '',
        confirmPassword: ''
    })
    const [passwordError, setPasswordError] = useState()
    const [passwordMsg, setPasswordMsg] = useState()

    const [profilePictureUrl, setProfilePictureUrl] = useState('')
    const [selectedFile, setSelectedFile] = useState()
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState()
    const [triggerEffect, setTriggerEffect] = useState(false)
    const [fileBase64, setFileBase64] = useState()

    const [deleteDialogEnabled, setDeleteDialogEnabled] = useState(false)

    const [displayMode, setDisplayMode] = useState('light mode')

    const [challengeNotifications, setChallengeNotifications] = useState(user.challengeNotifications)
    const [inviteNotifications, setInviteNotifications] = useState(user.inviteNotifications)
    const [announcementNotifications, setAnnouncementNotifications] = useState(user.announcementNotifications)

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {

        const fetchProfilePicture = async () => {

            try {

                const response = await fetch(`/api/user/${user.userId}/picture`)

                if (!response.ok) {
                    console.error('Failed to fetch profile picture.')
                    return
                }

                const blob = await response.blob()
                const imageUrl = URL.createObjectURL(blob)
                setProfilePictureUrl(imageUrl)
                
                if (!user.lightMode) {
                    setClassNames(getClassNames('darkMode'))
                    setDisplayMode('dark mode')
                }

            } catch (err) {
                console.error('Error fetching profile picture:', err)
            }

        }

        fetchProfilePicture()

    }, [user, triggerEffect])

    const handleAccountChange = (e) => {
        const { name, value } = e.target
        setAccountForm({
            ...accountForm,
            [name]: value
        })
    }

    const handlePasswordFormChange = (e) => {
        const { name, value } = e.target
        setPasswordForm({
            ...passwordForm,
            [name]: value
        })
    }

    const handleUpdateAccount = async (e) => {
        e.preventDefault()

        const response = await fetch(`/api/user/${user.userId}`, {
            method: 'PATCH',
            body: JSON.stringify(accountForm),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })

        const json = await response.json()
        if (!response.ok) {
            setAccountError('Invalid account details')
            setAccountMsg('')
            return
        }

        setAccountError('')
        setAccountMsg('Account details updated!')
        localStorage.setItem('user', JSON.stringify(json))
        dispatch({ type: 'LOGIN', payload: json })

    }

    const handleChangePassword = async (e) => {
        e.preventDefault()

        if (passwordForm.password !== passwordForm.confirmPassword) {
            setPasswordError('Passwords do not match!')
            return
        }

        const response = await fetch(`/api/user/${user.userId}`, {
            method: 'PATCH',
            body: JSON.stringify(passwordForm),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })

        const json = await response.json()
        if (!response.ok) {
            setPasswordError(json.error)
            setPasswordMsg('')
            return
        }

        setPasswordError('')
        setPasswordMsg('Password Changed!')
        localStorage.setItem('user', JSON.stringify(json))
        dispatch({ type: 'LOGIN', payload: json })
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        setSelectedFile(file)

        const reader = new FileReader()
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1]
            setFileBase64(base64)
        }

        if (file) {
            reader.readAsDataURL(file)
        }
    }

    const handleUpload = async (e) => {
        e.preventDefault()

        if (!selectedFile) {
            setUploadError('Please select a file before uploading')
            return
        }

        setUploadError(null)
        setIsUploading(true)

        const bodyContent = {
            mimeType: selectedFile.type,
            imageBase64: fileBase64
        }

        const response = await fetch(`/api/user/${user.userId}/picture`, {
            method: 'POST',
            body: JSON.stringify(bodyContent),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })

        const json = await response.json()

        if (!response.ok) {
            setUploadError(json.error || 'Error uploading profile picture')
        } else {
            setTriggerEffect(prev => !prev)
        }

        setIsUploading(false)

    }

    const handleDeleteAccount = async () => {

        const response = await fetch(`/api/user/${user.userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })

        if (response.ok) {
            localStorage.removeItem(user)
            dispatch({ type: 'LOGOUT' })
        }

    }

    const handleDisplayModeChange = async (e) => {
        if (displayMode == 'light mode') {
            setClassNames(getClassNames('darkMode'))
            setDisplayMode('dark mode')
        } else {
            setClassNames(getClassNames('lightMode'))
            setDisplayMode('light mode')
        }

        const response = await fetch(`/api/user/${user.userId}`, {
            method: 'PATCH',
            body: JSON.stringify({lightMode: !user.lightMode}),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })

        const json = await response.json()

        if (!response.ok) {
            setAccountError('Invalid account details')
            setAccountMsg('')
            return
        }

        user.lightMode = !user.lightMode
        localStorage.setItem('user', JSON.stringify(json))
        dispatch({ type: 'LOGIN', payload: json })

    }

    const handleChallengeNotificationToggle = async () => {
        const newSetting = !challengeNotifications

        try {

            const response = await fetch(`/api/user/${user.userId}`, {
                method: 'PATCH',
                body: JSON.stringify({challengeNotifications: newSetting}),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })

            const json = await response.json()

            if (!response.ok) {
                throw Error('failed to patch challenge notifications')
            }

            user.lightMode = !user.lightMode
            localStorage.setItem('user', JSON.stringify(json))
            dispatch({ type: 'LOGIN', payload: json })

            setChallengeNotifications(newSetting)

        } catch (err) {
            console.error(err)
        }
    }
    
    const handleInviteNotificationsToggle = async () => {
        const newSetting = !inviteNotifications

        try {

            const response = await fetch(`/api/user/${user.userId}`, {
                method: 'PATCH',
                body: JSON.stringify({inviteNotifications: newSetting}),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })

            const json = await response.json()

            if (!response.ok) {
                throw Error('failed to patch challenge notifications')
            }

            user.lightMode = !user.lightMode
            localStorage.setItem('user', JSON.stringify(json))
            dispatch({ type: 'LOGIN', payload: json })

            setChallengeNotifications(newSetting)

        } catch (err) {
            console.error(err)
        }
    }

    const handleAnnouncementNotificationsToggle = async () => {
        const newSetting = !announcementNotifications

        try {

            const response = await fetch(`/api/user/${user.userId}`, {
                method: 'PATCH',
                body: JSON.stringify({announcementNotifications: newSetting}),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })

            const json = await response.json()

            if (!response.ok) {
                throw Error('failed to patch announcement notifications')
            }

            user.lightMode = !user.lightMode
            localStorage.setItem('user', JSON.stringify(json))
            dispatch({ type: 'LOGIN', payload: json })

            setAnnouncementNotifications(newSetting)

        } catch (err) {
            console.error(err)
        }
 
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack spacing={3}>
                {/* Account Details Card */}
                <Paper elevation={2} sx={{ p: 4 }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                        <Person color="primary" />
                        <Typography variant="h5" fontWeight="bold">
                            Account Details
                        </Typography>
                    </Stack>
                    <form onSubmit={handleUpdateAccount}>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="Email Address"
                                name="email"
                                type="email"
                                value={accountForm.email}
                                onChange={handleAccountChange}
                                required
                            />
                            <TextField
                                fullWidth
                                label="First Name"
                                name="firstName"
                                value={accountForm.firstName}
                                onChange={handleAccountChange}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Last Name"
                                name="lastName"
                                value={accountForm.lastName}
                                onChange={handleAccountChange}
                                required
                            />
                            {accountError && <Alert severity="error">{accountError}</Alert>}
                            {accountMsg && <Alert severity="success">{accountMsg}</Alert>}
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{
                                    background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                                    alignSelf: 'flex-start'
                                }}
                            >
                                Update Account
                            </Button>
                        </Stack>
                    </form>
                </Paper>

                {/* Password Change Card */}
                <Paper elevation={2} sx={{ p: 4 }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                        <Lock color="primary" />
                        <Typography variant="h5" fontWeight="bold">
                            Change Password
                        </Typography>
                    </Stack>
                    <form onSubmit={handleChangePassword}>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="New Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={passwordForm.password}
                                onChange={handlePasswordFormChange}
                                required
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Confirm Password"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordFormChange}
                                required
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            {passwordError && <Alert severity="error">{passwordError}</Alert>}
                            {passwordMsg && <Alert severity="success">{passwordMsg}</Alert>}
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{
                                    background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                                    alignSelf: 'flex-start'
                                }}
                            >
                                Change Password
                            </Button>
                        </Stack>
                    </form>
                </Paper>

                {/* Profile Picture Card */}
                <Paper elevation={2} sx={{ p: 4 }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                        <ImageIcon color="primary" />
                        <Typography variant="h5" fontWeight="bold">
                            Profile Picture
                        </Typography>
                    </Stack>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item>
                            <Avatar
                                src={profilePictureUrl}
                                sx={{ width: 100, height: 100 }}
                            />
                        </Grid>
                        <Grid item xs>
                            <Stack spacing={2}>
                                <Button
                                    variant="outlined"
                                    component="label"
                                >
                                    Choose File
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleUpload}
                                    disabled={isUploading || !selectedFile}
                                    sx={{
                                        background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                                    }}
                                >
                                    {isUploading ? 'Uploading...' : 'Upload Profile Picture'}
                                </Button>
                                {uploadError && <Alert severity="error">{uploadError}</Alert>}
                            </Stack>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Display Settings Card */}
                <Paper elevation={2} sx={{ p: 4 }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                        <Palette color="primary" />
                        <Typography variant="h5" fontWeight="bold">
                            Display Settings
                        </Typography>
                    </Stack>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={!user.lightMode}
                                onChange={handleDisplayModeChange}
                            />
                        }
                        label={displayMode}
                    />
                </Paper>

                {/* Notification Settings Card */}
                <Paper elevation={2} sx={{ p: 4 }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                        <Notifications color="primary" />
                        <Typography variant="h5" fontWeight="bold">
                            Email Notification Settings
                        </Typography>
                    </Stack>
                    <Stack spacing={2}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={!user.challengeNotifications}
                                    onChange={handleChallengeNotificationToggle}
                                />
                            }
                            label="Notify Incoming Challenge"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={!user.inviteNotifications}
                                    onChange={handleInviteNotificationsToggle}
                                />
                            }
                            label="Notify Course Invites"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={!user.announcementNotifications}
                                    onChange={handleAnnouncementNotificationsToggle}
                                />
                            }
                            label="Notify Course Announcements"
                        />
                    </Stack>
                </Paper>

                {/* Delete Account Card */}
                <Paper elevation={2} sx={{ p: 4 }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                        <DeleteForever color="error" />
                        <Typography variant="h5" fontWeight="bold" color="error">
                            Delete Account
                        </Typography>
                    </Stack>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                        If you would like to delete your account, you may. Once deleted, you will not be able to access any of your data.
                    </Typography>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => setDeleteDialogEnabled(true)}
                    >
                        Delete Account
                    </Button>
                </Paper>

                {/* Confirmation Dialog */}
                <Dialog
                    open={deleteDialogEnabled}
                    onClose={() => setDeleteDialogEnabled(false)}
                >
                    <DialogTitle>Confirm Account Deletion</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete your account? This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogEnabled(false)}>Cancel</Button>
                        <Button
                            onClick={() => {
                                setDeleteDialogEnabled(false);
                                handleDeleteAccount();
                            }}
                            color="error"
                            variant="contained"
                        >
                            Delete Account
                        </Button>
                    </DialogActions>
                </Dialog>
            </Stack>
        </Container>
    );
};

export default UserSettings;