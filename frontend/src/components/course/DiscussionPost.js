import { useState } from 'react'

import '@fortawesome/fontawesome-free/css/all.min.css';
import { GrTrash } from 'react-icons/gr'

import { useAuthContext } from '../../hooks/UseAuthContext';
import { useCourseContext } from '../../context/CourseContext'

const DiscussionPost = ({ post, onDelete }) => {

    const { user } = useAuthContext()
    const { course } = useCourseContext()

    const date = new Date(post.createdAt);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);

    const canDelete = user.userId === course.coordinatorId || user.userId === post.userId

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

    return (
        <div className='content-card flex'>
            <div style={{ display: 'inline-block', flex: 1}}>
                <h2 style={{ margin: 0 }}>{post.title}</h2> 
                <span>Author: {post.firstName} {post.lastName}</span>
                <br />
                <span>Date: {formattedDate}</span>
            </div>
            {canDelete && <GrTrash size='25' onClick={handleDelete} />}
            
        </div>
    )
}

export default DiscussionPost
