import '../../css/generalAssets.css'
import { useState, useEffect } from 'react'
import { useDisplayContext } from '../../context/DisplayContext'
import { useAuthContext } from '../../hooks/UseAuthContext'
import PopupForm from  '../../components/PopupForm'

const CourseDiscussion = () => {
    const {getClassNames} = useDisplayContext()
    const [classNames, setClassNames] = useState(getClassNames('lightMode'))
    const { user } = useAuthContext()

    const [ createPostEnabled, setCreatePostEnabled ] = useState(false)
    const [ createPostFormError, setCreatePostFormError ] = useState()
    const [ createPostForm, setCreatePostForm ] = useState({
        postTitle: '',
        postBody: ''
    })

    useEffect(() => {
        if (user && !user.lightMode) {
            setClassNames(getClassNames('darkMode'))
        } else if (user && user.lightMode) {
            setClassNames(getClassNames('lightMode'))
        }
    }, [user])


    const handleCreatePostFormChange = (e) => {
        const { name, value } = e.target
        setCreatePostForm({
            ...createPostForm,
            [name]: value
        })
    }

    const handleCreatePostFormSubmit = async (e) => {
    }

    return (
    <div>
        <h1>Discuss</h1>
        <button
            className={classNames.button}
            onClick={() => {
                setCreatePostEnabled(true)
            }}
        >
        + New Dicussion Post
        </button>

        <PopupForm
                title='Create a discussion post'
                isOpen={createPostEnabled}
                onClose={() => {
                    setCreatePostEnabled(false)
                    setCreatePostFormError()
                }}
                onSubmit={handleCreatePostFormSubmit}
                errorText={createPostFormError}
            >
                <div>
                    <label>Post Title</label>
                    <input
                        type='text'
                        name='courseName'
                        placeholder='Title'
                        value={createPostForm.title}
                        onChange={handleCreatePostFormChange}
                        required
                    />
                </div>
                <div>
                    <label>Post Body</label>
                    <input
                        type='text'
                        name='courseDescription'
                        placeholder='body'
                        value={createPostForm.body}
                        onChange={handleCreatePostFormChange}
                    />
                </div>
            </PopupForm>
    </div>
    )
}

export default CourseDiscussion