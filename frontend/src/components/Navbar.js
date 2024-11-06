import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/UseAuthContext';
import { useDisplayContext } from '../context/DisplayContext';
import { 
    AppBar,
    Toolbar,
    Typography,
    Button,
    Avatar,
    Box,
    Menu,
    MenuItem,
    Divider,
    Container,
    Stack
} from '@mui/material';
import { 
    Settings, 
    LogOut, 
    ChevronDown,
    Swords
} from 'lucide-react';

const Navbar = () => {
    const { user, dispatch } = useAuthContext();
    const { getClassNames } = useDisplayContext();
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
        handleClose();
    };

    const handleSettingsClick = () => {
        navigate('/settings');
        handleClose();
    };

    return (
        <AppBar 
            position="fixed" 
            elevation={0}
            sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
            }}
        >
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    {/* Brand/Logo */}
                    <Link 
                        to="/" 
                        style={{ 
                            textDecoration: 'none', 
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <Swords size={32} style={{ marginRight: '12px' }} />
                        <Typography
                            variant="h5"
                            noWrap
                            sx={{
                                fontWeight: 700,
                                letterSpacing: '.1rem',
                                color: 'inherit'
                            }}
                        >
                            COURSE CLASH
                        </Typography>
                    </Link>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* User Section */}
                    {user ? (
                        <Stack direction="row" spacing={2} alignItems="center">
                            {/* User Info & Menu Trigger */}
                            <Button
                                onClick={handleClick}
                                endIcon={<ChevronDown />}
                                sx={{ 
                                    color: 'white',
                                    textTransform: 'none'
                                }}
                            >
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar 
                                        sx={{ 
                                            width: 32, 
                                            height: 32,
                                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        {user.firstName[0]}
                                    </Avatar>
                                    <Box sx={{ textAlign: 'left' }}>
                                        <Typography variant="subtitle2">
                                            {user.firstName} {user.lastName}
                                        </Typography>
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                opacity: 0.8,
                                                display: 'block'
                                            }}
                                        >
                                            {user.email}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Button>

                            {/* Dropdown Menu */}
                            <Menu
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                                onClick={handleClose}
                                PaperProps={{
                                    elevation: 3,
                                    sx: {
                                        minWidth: 200,
                                        mt: 1.5,
                                        '& .MuiMenuItem-root': {
                                            px: 2,
                                            py: 1,
                                            gap: 1.5
                                        }
                                    }
                                }}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            >
                                <MenuItem onClick={handleSettingsClick}>
                                    <Settings size={18} />
                                    Settings
                                </MenuItem>
                                <Divider />
                                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                                    <LogOut size={18} />
                                    Logout
                                </MenuItem>
                            </Menu>
                        </Stack>
                    ) : (
                        <Button 
                            component={Link} 
                            to="/login"
                            variant="contained"
                            sx={{
                                bgcolor: 'rgba(255, 255, 255, 0.15)',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.25)'
                                }
                            }}
                        >
                            Log In / Register
                        </Button>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;