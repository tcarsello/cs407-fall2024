import { useState } from 'react';
import { useAuthContext } from '../hooks/UseAuthContext';
import { 
    Container, 
    Paper, 
    Typography, 
    TextField, 
    Button, 
    Box, 
    Stack, 
    Grid, 
    Link, 
    IconButton,
    InputAdornment,
    Alert
} from '@mui/material';
import { 
    Mail, 
    Lock, 
    UserPlus, 
    LogIn, 
    Eye, 
    EyeOff 
} from 'lucide-react';

const Login = () => {
    const { dispatch } = useAuthContext();

    const [loginForm, setLoginForm] = useState({
        email: '',
        password: ''
    });
    const [registerForm, setRegisterForm] = useState({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: ''
    });

    const [loginError, setLoginError] = useState();
    const [registerError, setRegisterError] = useState();

    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/user/login`, {
                method: 'POST',
                body: JSON.stringify(loginForm),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const json = await response.json();
            if (!response.ok) {
                setLoginError(json.error);
                return;
            }

            setLoginError('');
            localStorage.setItem('user', JSON.stringify(json));
            dispatch({ type: 'LOGIN', payload: json });
        } catch (error) {
            setLoginError('An error occurred during login');
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        if (registerForm.password !== registerForm.confirmPassword) {
            setRegisterError('Passwords do not match!');
            return;
        }

        try {
            const response = await fetch(`/api/user/register`, {
                method: 'POST',
                body: JSON.stringify(registerForm),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const json = await response.json();
            if (!response.ok) {
                setRegisterError(json.error);
                return;
            }

            setRegisterError('');
            localStorage.setItem('user', JSON.stringify(json));
            dispatch({ type: 'LOGIN', payload: json });
        } catch (error) {
            setRegisterError('An error occurred during registration');
        }
    };

    return (
        <Container component="main" maxWidth="lg" sx={{ 
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            py: 4
        }}>
            <Grid container spacing={4} justifyContent="center">
                {/* Login Section */}
                <Grid item xs={12} md={5}>
                    <Paper elevation={3} sx={{ p: 4 }}>
                        <Stack spacing={3}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <LogIn size={28} color="#1976d2" />
                                <Typography variant="h4" fontWeight="bold">
                                    Login
                                </Typography>
                            </Stack>

                            <form onSubmit={handleLoginSubmit}>
                                <Stack spacing={3}>
                                <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={loginForm.email}
                                onChange={handleLoginChange}
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
                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type={showLoginPassword ? 'text' : 'password'}
                                value={loginForm.password}
                                onChange={handleLoginChange}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock size={20} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                                                edge="end"
                                            >
                                                {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                                sx={{ '& .MuiInputAdornment-root': { mr: 1 } }}
                            />
                                    <Link 
                                        href="/forgot-password" 
                                        sx={{ alignSelf: 'flex-end' }}
                                    >
                                        Forgot Password?
                                    </Link>
                                    {loginError && (
                                        <Alert severity="error">{loginError}</Alert>
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
                                        Login
                                    </Button>
                                </Stack>
                            </form>
                        </Stack>
                    </Paper>
                </Grid>

                {/* Register Section */}
                <Grid item xs={12} md={5}>
                    <Paper elevation={3} sx={{ p: 4 }}>
                        <Stack spacing={3}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <UserPlus size={28} color="#1976d2" />
                                <Typography variant="h4" fontWeight="bold">
                                    Register
                                </Typography>
                            </Stack>

                            <form onSubmit={handleRegisterSubmit}>
                                <Stack spacing={3}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={registerForm.email}
                                        onChange={handleRegisterChange}
                                        required
                                    />
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        name="firstName"
                                        value={registerForm.firstName}
                                        onChange={handleRegisterChange}
                                        required
                                    />
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        name="lastName"
                                        value={registerForm.lastName}
                                        onChange={handleRegisterChange}
                                        required
                                    />
                                    <TextField
                                        fullWidth
                                        label="Password"
                                        name="password"
                                        type={showRegisterPassword ? 'text' : 'password'}
                                        value={registerForm.password}
                                        onChange={handleRegisterChange}
                                        required
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                                        edge="end"
                                                    >
                                                        {showRegisterPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Confirm Password"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={registerForm.confirmPassword}
                                        onChange={handleRegisterChange}
                                        required
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        edge="end"
                                                    >
                                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                    {registerError && (
                                        <Alert severity="error">{registerError}</Alert>
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
                                        Register
                                    </Button>
                                </Stack>
                            </form>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Login;