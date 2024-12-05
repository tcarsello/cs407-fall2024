import { useAuthContext } from '../../hooks/UseAuthContext';
import { 
    Paper,
    Typography,
    IconButton,
    Stack,
    Box,
    Tooltip
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const InviteDetails = ({ invite, onAccept, onDecline }) => {
    const { user } = useAuthContext();

    const handleAcceptInvite = async () => {
        try {
            const response = await fetch(`/api/course/${invite.courseId}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                onAccept();
            }
        } catch (error) {
            console.error('Error accepting invite:', error);
        }
    };

    const handleDeclineInvite = async () => {
        try {
            const response = await fetch(`/api/course/${invite.courseId}/decline`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                onDecline();
            }
        } catch (error) {
            console.error('Error declining invite:', error);
        }
    };

    if (!invite) return null;

    return (
        <Paper 
            elevation={2} 
            sx={{
                p: 3,
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                }
            }}
        >
            <Stack spacing={2}>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between'
                }}>
                    <Typography variant="h5" fontWeight="bold">
                        {invite.courseName}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Tooltip title="Accept Invite">
                            <IconButton 
                                onClick={handleAcceptInvite}
                                sx={{
                                    color: 'success.main',
                                    '&:hover': {
                                        bgcolor: 'success.light',
                                        color: 'white'
                                    }
                                }}
                            >
                                <CheckIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Decline Invite">
                            <IconButton 
                                onClick={handleDeclineInvite}
                                sx={{
                                    color: 'error.main',
                                    '&:hover': {
                                        bgcolor: 'error.light',
                                        color: 'white'
                                    }
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Box>
                
                <Typography 
                    color="text.secondary"
                    sx={{ 
                        lineHeight: 1.6,
                        fontSize: '1rem'
                    }}
                >
                    {invite.courseDescription}
                </Typography>
            </Stack>
        </Paper>
    );
};

export default InviteDetails;