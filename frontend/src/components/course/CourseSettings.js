import { useState, useEffect } from 'react'

import { useCourseContext } from "../../context/CourseContext"
import { useAuthContext } from "../../hooks/UseAuthContext"

import { 
    Container,
    Paper,
    Typography,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    TextField,
    Button,
    Box,
    Stack,
    Alert,
    CircularProgress,
    Avatar
} from '@mui/material';
import { 
    Lock, 
    Gamepad, 
    Image as ImageIcon,
    Copy
} from 'lucide-react';

const CourseSettings = () => {

    const { user } = useAuthContext()
    const { course } = useCourseContext()

    const [accessTypeSelection, setAccessTypeSelection] = useState('invite')
    const [accessCode, setAccessCode] = useState()

    const [gameSettingsForm, setGameSettingsForm] = useState({
        gameLimit: course.gameLimit,
        gameRoundLimit: course.gameRoundLimit,
    })
    const [gameSettingsFormError, setGameSettingsFormError] = useState()
    const [gameSettingsFormMsg, setGameSettingsFormMsg] = useState()

    const [coursePictureUrl, setCoursePictureUrl] = useState()
    const [selectedFile, setSelectedFile] = useState()
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState()
    const [triggerEffect, setTriggerEffect] = useState(false)
    const [fileBase64, setFileBase64] = useState()

    const putSettings = async () => {
        const bodyContent = {
            accessType: accessTypeSelection,
            gameLimit: gameSettingsForm.gameLimit,
            gameRoundLimit: gameSettingsForm.gameRoundLimit,
        }

        const response = await fetch(`/api/course/${course.courseId}/settings`, {
            method: 'PUT',
            body: JSON.stringify(bodyContent),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })

        return response
    }

    const handleAccessChange = (e) => {
        setAccessTypeSelection(e.target.value)
    }

    const handleAccessSelectionSubmit = async () => {

        const response = await putSettings()
        const json = await response.json()

        setAccessCode(json.joinCode)

    }

    const handleGameSettingsFormChange = (e) => {
        const { name, value } = e.target
        setGameSettingsForm({
            ...gameSettingsForm,
            [name]: value
        })
    }

    const handleGameSettingsFormSubmit = async (e) => {
        e.preventDefault()

        const response = await putSettings()
        const json = await response.json()

        if (response.ok) {
            setGameSettingsFormError()
            setGameSettingsFormMsg('Updated!')
        } else {
            setGameSettingsFormError(json.error)
        }

    }

    const handleFileChange = async (e) => {
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

        const response = await fetch(`/api/course/${course.courseId}/picture`, {
            method: 'POST',
            body: JSON.stringify(bodyContent),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })

        try {
            const json = await response.json()
            if (!response.ok) {
                setUploadError(json.error || 'Error uploading profile picture')
            } else {
                setTriggerEffect(prev => !prev)
            }
    
            setIsUploading(false)
        } catch (err) {
            console.log(err)
            setUploadError('Upload error')
            setIsUploading(false)
        }
    }

    useEffect(() => {

        const fetchSettings = async () => {

            try {
                const response = await fetch(`/api/course/${course.courseId}/settings`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                })
                const json = await response.json()
                setAccessCode(json.joinCode)
                if (json.joinCode) setAccessTypeSelection('code')
                setGameSettingsForm({ ...gameSettingsForm, gameLimit: json.gameLimit, gameRoundLimit: json.gameRoundLimit })
            } catch (err) {
                console.error(err)
            }

        }

        const fetchCoursePicture = async () => {

            try {

                const response = await fetch(`/api/course/${course.courseId}/picture`)

                if (!response.ok) {
                    console.error('Failed to fetch profile picture.')
                    return
                }

                const blob = await response.blob()
                const imageUrl = URL.createObjectURL(blob)
                setCoursePictureUrl(imageUrl)

            } catch (err) {
                console.error('Error fetching profile picture:', err)
            }

        }

        if (user && course) {
            fetchSettings()
            fetchCoursePicture()
        }

    }, [user, course, triggerEffect])

    const copyCodeToClipboard = () => {
        navigator.clipboard.writeText(accessCode);
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Access Type Section */}
            <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Lock size={24} />
                    <Typography variant="h5" fontWeight="bold">
                        Course Access Type
                    </Typography>
                </Stack>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    This course is currently in <strong>{accessCode ? 'Join Code' : "Invite Only"}</strong> mode.
                </Typography>
                {accessCode && (
    <Box 
        sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 3,
            p: 2,
            bgcolor: 'primary.light',
            borderRadius: 1
        }}
    >
        <Typography variant="body1" color="white">
            Join Code: <strong>{accessCode}</strong>
        </Typography>
        <Button 
            variant="contained" 
            size="small"
            onClick={copyCodeToClipboard}
            startIcon={<Copy size={16} />}
            sx={{ bgcolor: 'primary.dark' }}
        >
            Copy
        </Button>
    </Box>
)}
                <FormControl>
                    <RadioGroup
                        value={accessTypeSelection}
                        onChange={handleAccessChange}
                    >
                        <FormControlLabel 
                            value="invite" 
                            control={<Radio />} 
                            label="Invite Only"
                        />
                        <FormControlLabel 
                            value="code" 
                            control={<Radio />} 
                            label="Generate Join Code"
                        />
                    </RadioGroup>
                    <Button 
                        variant="contained"
                        onClick={handleAccessSelectionSubmit}
                        sx={{ mt: 2, alignSelf: 'flex-start' }}
                    >
                        Update Access Type
                    </Button>
                </FormControl>
            </Paper>

            {/* Game Settings Section */}
            <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Gamepad size={24} />
        <Typography variant="h5" fontWeight="bold">
            Game Settings
        </Typography>
    </Stack>
                <Box component="form" onSubmit={handleGameSettingsFormSubmit}>
                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            label="Student Game Limit"
                            name="gameLimit"
                            value={gameSettingsForm.gameLimit}
                            onChange={handleGameSettingsFormChange}
                            type="number"
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="Round Limit"
                            name="gameRoundLimit"
                            value={gameSettingsForm.gameRoundLimit}
                            onChange={handleGameSettingsFormChange}
                            type="number"
                            variant="outlined"
                        />
                        <Box>
                            <Button 
                                type="submit" 
                                variant="contained"
                                disabled={isUploading}
                            >
                                Update Game Settings
                            </Button>
                        </Box>
                        {gameSettingsFormError && (
                            <Alert severity="error">{gameSettingsFormError}</Alert>
                        )}
                        {gameSettingsFormMsg && (
                            <Alert severity="success">{gameSettingsFormMsg}</Alert>
                        )}
                    </Stack>
                </Box>
            </Paper>

            {/* Course Picture Section */}
            <Paper elevation={2} sx={{ p: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                    <ImageIcon size={24} />
                    <Typography variant="h5" fontWeight="bold">
                        Course Picture
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={3} alignItems="center">
                    <Avatar 
                        src={coursePictureUrl} 
                        alt="Course Picture"
                        sx={{ 
                            width: 100, 
                            height: 100,
                            bgcolor: 'primary.main'
                        }}
                    >
                        {course?.name?.[0] || 'C'}
                    </Avatar>
                    <Stack spacing={2}>
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<ImageIcon size={20} />}
                        >
                            Choose File
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </Button>
                        {selectedFile && (
                            <Typography variant="body2" color="text.secondary">
                                Selected: {selectedFile.name}
                            </Typography>
                        )}
                        <Button 
                            variant="contained" 
                            onClick={handleUpload}
                            disabled={!selectedFile || isUploading}
                            startIcon={isUploading ? <CircularProgress size={20} /> : null}
                        >
                            {isUploading ? 'Uploading...' : 'Upload Picture'}
                        </Button>
                        {uploadError && (
                            <Alert severity="error">{uploadError}</Alert>
                        )}
                    </Stack>
                </Stack>
            </Paper>
        </Container>
    );
};

export default CourseSettings;