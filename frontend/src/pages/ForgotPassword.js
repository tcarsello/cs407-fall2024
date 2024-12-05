import { useState } from 'react';
import { 
    Container, 
    Paper, 
    Typography, 
    TextField, 
    Button, 
    Stack, 
    Alert,
    InputAdornment,
    Link
} from '@mui/material';
import { Mail, KeySquare } from 'lucide-react';

const ForgotPassword = () => {
    const [forgotForm, setForgotForm] = useState({
        email: '',
    });
    const [forgotError, setForgotError] = useState();
    const [successMessage, setSuccessMessage] = useState();

    const handleForgotChange = (e) => {
        const { name, value } = e.target;
        setForgotForm({
            ...forgotForm,
            [name]: value,
        });
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/user/forgot-password`, {
                method: 'POST',
                body: JSON.stringify(forgotForm),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const json = await response.json();
            if (!response.ok) {
                setSuccessMessage('');
                setForgotError(json.error);
                return;
            }

            setForgotError('');
            setSuccessMessage(json.message);
        } catch (error) {
            setForgotError('An error occurred while processing your request');
        }
    };

    return (
        <Container component="main" maxWidth="sm" sx={{ 
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            py: 4
        }}>
            <Paper elevation={3} sx={{ 
                p: 4, 
                width: '100%',
            }}>
                <Stack spacing={3}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <KeySquare size={28} color="#1976d2" />
                        <Typography variant="h4" component="h1" fontWeight="bold">
                            Recover Account
                        </Typography>
                    </Stack>

                    <Typography color="text.secondary">
                        Enter your email address below and we'll send you instructions to reset your password.
                    </Typography>

                    <form onSubmit={handleForgotSubmit}>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={forgotForm.email}
                                onChange={handleForgotChange}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Mail size={20} />
                                        </InputAdornment>
                                    )
                                }}
                                sx={{ '& .MuiInputAdornment-root': { mr: 1 } }}
                            />

                            {forgotError && (
                                <Alert severity="error">
                                    {forgotError}
                                </Alert>
                            )}

                            {successMessage && (
                                <Alert severity="success">
                                    {successMessage}
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                sx={{
                                    background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                                    color: 'white',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #1976D2 30%, #5E35B1 90%)'
                                    }
                                }}
                            >
                                Send Recovery Email
                            </Button>

                            <Link 
                                href="/login" 
                                sx={{ 
                                    textAlign: 'center',
                                    textDecoration: 'none',
                                    '&:hover': {
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                Back to Login
                            </Link>
                        </Stack>
                    </form>
                </Stack>
            </Paper>
        </Container>
    );
};

export default ForgotPassword;