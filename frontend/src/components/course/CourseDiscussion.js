import '../../css/generalAssets.css'
import { useState, useEffect } from 'react'
import { useDisplayContext } from '../../context/DisplayContext'
import { useAuthContext } from '../../hooks/UseAuthContext'
import PopupForm from  '../../components/PopupForm'
import { useCourseContext } from '../../context/CourseContext'

import DiscussionPost from './DiscussionPost'

const CourseDiscussion = () => {
    const {getClassNames} = useDisplayContext()
    const [classNames, setClassNames] = useState(getClassNames('lightMode'))
    const { user } = useAuthContext()
    const { course } = useCourseContext()

    const [ createPostEnabled, setCreatePostEnabled ] = useState(false)
    const [ createPostFormError, setCreatePostFormError ] = useState()
    const [ createPostForm, setCreatePostForm ] = useState({
        postTitle: '',
        postBody: ''
    })

    const [ postList, setPostList ] = useState([])

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
            body: createPostForm.postBody
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
            setPostList(prev => [{...json.post, ...user }, ...prev])
            setCreatePostForm({
                postTitle: '',
                postBody: ''
            })


        } catch (err) {
            console.error(err)
        }

    }

    return (
    <div>
        <h1>Discuss</h1>
        <button
            className={classNames.button}
            style={{ marginBottom: '15px' }}
            onClick={() => {
                setCreatePostEnabled(true)
            }}
        >
        + New Dicussion Post
        </button>

        {postList && postList.map((post) =>
            <DiscussionPost
                key={post.postId}
                post={post}
                onDelete={() => setPostList(postList.filter(p => (p.postId != post.postId)))}
            />
        )}

        <PopupForm
                title='Create a discussion post'
                isOpen={createPostEnabled}
                onClose={() => {
                    setCreatePostEnabled(false)
                    setCreatePostFormError()
                    setCreatePostForm({
                        postTitle: '',
                        postBody: ''
                    })
                }}
                onSubmit={handleCreatePostFormSubmit}
                errorText={createPostFormError}
            >
                <div>
                    <label>Post Title</label>
                    <input
                        type='text'
                        name='postTitle'
                        placeholder='Title'
                        value={createPostForm.postTitle}
                        onChange={handleCreatePostFormChange}
                        required
                    />
                </div>
                <div>
                    <label>Post Body</label>
                    <input
                        type='text'
                        name='postBody'
                        placeholder='body'
                        value={createPostForm.postBody}
                        onChange={handleCreatePostFormChange}
                    />
                </div>
            </PopupForm>
    </div>
    )
}

export default CourseDiscussion
