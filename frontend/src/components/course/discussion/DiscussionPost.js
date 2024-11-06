import { useState, useEffect } from 'react'

import '@fortawesome/fontawesome-free/css/all.min.css';

import { useAuthContext } from '../../../hooks/UseAuthContext';
import { useCourseContext } from '../../../context/CourseContext'
import { ChevronUp, Trash2, MessageCircle, ChevronDown } from 'lucide-react';
import ReplyComponent from './ReplyComponent';
import { 
    Paper,
    Typography,
    Box,
    Stack,
    IconButton,
    TextField,
    Button,
    Chip,
    Collapse,
    Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[4]
    }
}));

const UpvoteButton = styled(IconButton)(({ theme, hasupvoted }) => ({
    color: hasupvoted === 'true' ? theme.palette.primary.main : theme.palette.text.secondary,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        color: theme.palette.primary.main,
        transform: 'translateY(-2px)'
    }
}));

const DiscussionPost = ({ post, onDelete }) => {

    const { user } = useAuthContext()
    const { course } = useCourseContext()

    const [replyText, setReplyText] = useState('')
    const [replyList, setReplyList] = useState([])

    const [upvotes, setUpvotes] = useState(post?.upvotes ? parseInt(post.upvotes) : 0);
    const [hasUpvoted, setHasUpvoted] = useState(post?.hasUpvoted || false);
    const [isRepliesOpen, setIsRepliesOpen] = useState(false);

    const date = new Date(post.createdAt);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);

    const canDelete = user.userId === course.coordinatorId || user.userId === post.userId

    useEffect(() => {

        const fetchReplies = async () => {

            try {

                const response = await fetch(`/api/post/${post.postId}/replies`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`,
                    }
                })

                const json = await response.json()
                if (response.ok) setReplyList(json.replies)

            } catch (err) {
                console.error(err)
            }

        }

        fetchReplies()

    }, [user, course])

    const handleDelete = async () => {

        try {
            await fetch(`/api/post/${post.postId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                }
            })
            
            onDelete()

        } catch (err) {
            console.error(err)
        }
    }

    const handleReply = async (e) => {

        e.preventDefault()
        
        if (!replyText || replyText === '') return

        try {

            const bodyContent = {
                postId: post.postId,
                userId: user.userId,
                body: replyText,
            }

            const response = await fetch(`/api/reply`, {
                method: 'POST',
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                }
            })

            const json = await response.json()
            if (response.ok) {
                setReplyText('')
                setReplyList(prev => [{...json.reply, ...user}, ...prev])
            }

        } catch (err) {
            console.error(err)
        }

    }

    const handleUpvote = () => {

        try {

            if (hasUpvoted) {

                fetch(`/api/post/${post.postId}/unupvote`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`,
                    }
                })

                setHasUpvoted(prev => (!prev))
                setUpvotes(prev => (prev-1))

            } else {

                fetch(`/api/post/${post.postId}/upvote`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`,
                    }
                })

                setHasUpvoted(prev => (!prev))
                setUpvotes(prev => (prev+1))
                
            }
        } catch (err) {
            console.error(err)
        }

    }

    return (
        <StyledPaper elevation={2}>
            <Stack direction="row" spacing={2}>
                {/* Upvote Column */}
                <Stack alignItems="center" spacing={1}>
                    <UpvoteButton
                        hasupvoted={hasUpvoted.toString()}
                        onClick={handleUpvote}
                        size="small"
                    >
                        <ChevronUp size={20} />
                    </UpvoteButton>
                    <Typography variant="h6" color={hasUpvoted ? 'primary' : 'text.secondary'}>
                        {upvotes}
                    </Typography>
                </Stack>

                {/* Main Content */}
                <Box sx={{ flex: 1 }}>
                    {/* Header */}
                    <Stack 
                        direction="row" 
                        justifyContent="space-between" 
                        alignItems="flex-start"
                        sx={{ mb: 2 }}
                    >
                        <Box>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                <Typography variant="h5" fontWeight="medium">
                                    {post.title}
                                </Typography>
                                <Chip 
                                    label={post.tag}
                                    size="small"
                                    color="primary"
                                    sx={{ 
                                        bgcolor: 'primary.main',
                                        color: 'white'
                                    }}
                                />
                            </Stack>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar 
                                    sx={{ 
                                        width: 24, 
                                        height: 24,
                                        bgcolor: 'primary.main',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {post.firstName[0]}
                                </Avatar>
                                <Typography variant="body2" color="text.secondary">
                                    {post.firstName} {post.lastName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {formattedDate}
                                </Typography>
                            </Stack>
                        </Box>
                        {canDelete && (
                            <IconButton onClick={handleDelete} size="small" color="error">
                                <Trash2 size={20} />
                            </IconButton>
                        )}
                    </Stack>

                    {/* Post Body */}
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {post.body}
                    </Typography>

                    {/* Replies Section */}
                    <Box>
                        <Button
                            startIcon={isRepliesOpen ? <ChevronDown size={20} /> : <MessageCircle size={20} />}
                            onClick={() => setIsRepliesOpen(!isRepliesOpen)}
                            sx={{ mb: 1 }}
                        >
                            {replyList.length} Replies
                        </Button>
                        <Collapse in={isRepliesOpen}>
                            <Stack spacing={2}>
                                {/* Reply Input */}
                                <Box component="form" onSubmit={handleReply}>
                                    <Stack direction="row" spacing={2}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="Write a reply to this post"
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                        />
                                        <Button 
                                            type="submit" 
                                            variant="contained"
                                            disabled={!replyText}
                                        >
                                            Reply
                                        </Button>
                                    </Stack>
                                </Box>

                                {/* Replies List */}
                                <Stack spacing={2}>
                                    {replyList.map(reply => (
                                        <ReplyComponent key={reply.replyId} reply={reply} />
                                    ))}
                                </Stack>
                            </Stack>
                        </Collapse>
                    </Box>
                </Box>
            </Stack>
        </StyledPaper>
    );
};

export default DiscussionPost;