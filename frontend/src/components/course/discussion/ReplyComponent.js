import React from 'react';
import { 
    Box, 
    Stack, 
    Typography, 
    Avatar 
} from '@mui/material';

const ReplyComponent = ({ reply }) => {
    return (
        <Box 
            sx={{ 
                pl: 2, 
                borderLeft: '2px solid', 
                borderColor: 'primary.main',
                py: 1
            }}
        >
            <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar 
                        sx={{ 
                            width: 24, 
                            height: 24,
                            bgcolor: 'primary.main',
                            fontSize: '0.875rem'
                        }}
                    >
                        {reply.firstName[0]}
                    </Avatar>
                    <Typography variant="subtitle2">
                        {reply.firstName} {reply.lastName}
                    </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {reply.body}
                </Typography>
            </Stack>
        </Box>
    );
};

export default ReplyComponent;