import { useAuthContext } from '../../hooks/UseAuthContext';
import { 
    Paper,
    Typography,
    IconButton,
    Stack,
    Tooltip,
    Avatar
} from '@mui/material';
import { Close as CloseIcon, Email as EmailIcon } from '@mui/icons-material';

const InviteManager = ({ invite, onDelete }) => {
    const { user } = useAuthContext();

    const handleCancel = () => {
        try {
            const bodyContent = {
                courseId: invite.courseId,
                email: invite.email
            };
            fetch(`/api/invite`, {
                method: 'DELETE',
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })
                .then(onDelete);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Paper 
            elevation={1}
            sx={{
                p: 2,
                mb: 1,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2
                }
            }}
        >
            <Stack 
                direction="row" 
                alignItems="center" 
                justifyContent="space-between"
                spacing={2}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar 
                        sx={{ 
                            bgcolor: 'primary.light',
                            width: 35,
                            height: 35
                        }}
                    >
                        <EmailIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Typography>
                        {invite.email}
                    </Typography>
                </Stack>

                <Tooltip title="Cancel invite">
                    <IconButton 
                        onClick={handleCancel}
                        size="small"
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
        </Paper>
    );
};

export default InviteManager;