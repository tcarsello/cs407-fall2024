import { useCourseContext } from '../../context/CourseContext';
import { useAuthContext } from '../../hooks/UseAuthContext';
import { 
    Paper,
    Typography,
    IconButton,
    Stack,
    Avatar,
    Tooltip
} from '@mui/material';
import { Close as CloseIcon, Person as PersonIcon } from '@mui/icons-material';

const MemberDetails = ({ member, onDelete, canKick = true }) => {
    const { user } = useAuthContext();
    const { course } = useCourseContext();

    const handleKick = () => {
        if (!canKick) {
            onDelete();
            return;
        }

        try {
            const bodyContent = {
                userId: member.userId
            };
            fetch(`/api/course/${course.courseId}/remove`, {
                method: 'POST',
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
                            bgcolor: 'primary.main',
                            width: 35,
                            height: 35
                        }}
                    >
                        {member.firstName[0]}
                    </Avatar>
                    <Typography>
                        {`${member.firstName} ${member.lastName}`}
                    </Typography>
                </Stack>

                {user.userId === course.coordinatorId && member.userId !== course.coordinatorId && (
                    <Tooltip title="Remove member">
                        <IconButton 
                            onClick={handleKick}
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
                )}
            </Stack>
        </Paper>
    );
};

export default MemberDetails;