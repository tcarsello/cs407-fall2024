import '../../css/generalAssets.css'
import { useState, useEffect, useCallback } from 'react'
import { useDisplayContext } from '../../context/DisplayContext'
import { useAuthContext } from '../../hooks/UseAuthContext'
import PopupForm from  '../../components/PopupForm'
import { useCourseContext } from '../../context/CourseContext'

import DiscussionPost from './discussion/DiscussionPost'
import { 
    Container,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    Box,
    Fade,
    Stack
} from '@mui/material';
import { Plus, MessageSquare } from 'lucide-react';

const CourseDiscussion = () => {
    const {getClassNames} = useDisplayContext()
    const [classNames, setClassNames] = useState(getClassNames('lightMode'))
    const { user } = useAuthContext()
    const { course } = useCourseContext()

    const [ createPostEnabled, setCreatePostEnabled ] = useState(false)
    const [ createPostFormError, setCreatePostFormError ] = useState()
    const [ createPostForm, setCreatePostForm ] = useState({
        postTitle: '',
        postBody: '',
        postTag: 'General',
    })

    const [ postList, setPostList ] = useState([])

    const resetForm = useCallback(() => {
        setCreatePostEnabled(false);
        setCreatePostFormError(undefined);
        setCreatePostForm({
            postTitle: '',
            postBody: '',
            postTag: 'General',
        });
    }, []);

    useEffect(() => {
        if (user && !user.lightMode) {
            setClassNames(getClassNames('darkMode'))
        } else if (user && user.lightMode) {
            setClassNames(getClassNames('lightMode'))
        }
    }, [user])

    useEffect(() => {

        const fetchPosts = async () => {

            try {

                const response = await fetch(`/api/course/${course.courseId}/posts`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`,
                    }

                })

                const json = await response.json()
                if (response.ok) {
                    setPostList(json.posts)
                }

            } catch (err) {
                console.error(err)
            }

        }

        fetchPosts()

    }, [user, course])

    const handleCreatePostFormChange = (e) => {
        const { name, value } = e.target
        setCreatePostForm({
            ...createPostForm,
            [name]: value
        })
    }

    const handleCreatePostFormSubmit = async (e) => {
        e.preventDefault()

        const bodyContent = {
            userId: user.userId,
            courseId: course.courseId,
            title: createPostForm.postTitle,
            body: createPostForm.postBody,
            tag: createPostForm.postTag
        }

        try {

            const response = await fetch(`/api/post`, {
                method: 'POST',
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                }
            })

            const json = await response.json()
            if (!response.ok) {
                setCreatePostFormError(json.error || 'Failed to create post')
                return
            }

            setCreatePostEnabled(false)
            setCreatePostFormError()
            setPostList(prev => [{...json.post, ...user, upvotes: 0 }, ...prev])
            setCreatePostForm({
                postTitle: '',
                postBody: '',
                postTag: 'General',
            })

        } catch (err) {
            console.error(err)
        }

    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header Section */}
            <Box sx={{ mb: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <MessageSquare size={32} color="#1976d2" />
                        <Typography variant="h4" component="h1" fontWeight="bold">
                            Discussion Board
                        </Typography>
                    </Stack>
                    <Button
                        variant="contained"
                        startIcon={<Plus />}
                        onClick={() => setCreatePostEnabled(true)}
                        sx={{
                            background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                            color: 'white',
                            boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #1976D2 30%, #5E35B1 90%)'
                            }
                        }}
                    >
                        New Discussion Post
                    </Button>
                </Stack>
            </Box>

            {/* Posts List */}
            <Stack spacing={3}>
                {postList && postList.map((post) => (
                    <Fade in={true} key={post.postId}>
                        <div>
                            <DiscussionPost
                                post={post}
                                onDelete={() => setPostList(postList.filter(p => (p.postId !== post.postId)))}
                            />
                        </div>
                    </Fade>
                ))}
            </Stack>

            {/* Create Post Dialog */}
            <Dialog 
                open={createPostEnabled} 
                onClose={resetForm}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle 
                    sx={{ 
                        background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                        color: 'white'
                    }}
                >
                    Create a Discussion Post
                </DialogTitle>
                <form onSubmit={handleCreatePostFormSubmit}>
                    <DialogContent sx={{ pt: 3 }}>
                        <Stack spacing={3}>
                            {createPostFormError && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {createPostFormError}
                                </Alert>
                            )}
                            
                            <TextField
                                fullWidth
                                label="Post Title"
                                name="postTitle"
                                value={createPostForm.postTitle}
                                onChange={handleCreatePostFormChange}
                                required
                                variant="outlined"
                            />
                            
                            <TextField
                                fullWidth
                                label="Post Body"
                                name="postBody"
                                value={createPostForm.postBody}
                                onChange={handleCreatePostFormChange}
                                multiline
                                rows={4}
                                variant="outlined"
                            />
                            
                            <FormControl fullWidth>
                                <InputLabel>Tag</InputLabel>
                                <Select
                                    name="postTag"
                                    value={createPostForm.postTag}
                                    onChange={handleCreatePostFormChange}
                                    label="Tag"
                                >
                                    <MenuItem value="General">General</MenuItem>
                                    <MenuItem value="Question">Question</MenuItem>
                                    <MenuItem value="PSA">PSA</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={resetForm}>Cancel</Button>
                        <Button 
                            type="submit" 
                            variant="contained"
                            sx={{
                                background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #1976D2 30%, #5E35B1 90%)'
                                }
                            }}
                        >
                            Create Post
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default CourseDiscussion;