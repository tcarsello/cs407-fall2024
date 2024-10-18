import { useState, useEffect } from 'react'

import '@fortawesome/fontawesome-free/css/all.min.css';
import { GrTrash } from 'react-icons/gr'

import { useAuthContext } from '../../../hooks/UseAuthContext';
import { useCourseContext } from '../../../context/CourseContext'
import Collapsible from '../../Collapsible';
import ReplyComponent from './ReplyComponent';

const DiscussionPost = ({ post, onDelete }) => {

    const { user } = useAuthContext()
    const { course } = useCourseContext()

    const [replyText, setReplyText] = useState('')
    const [replyList, setReplyList] = useState([])

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

    return (
        <div className='content-card'>
            <div className='flex' style={{ paddingBottom: '15px', borderBottom: '1px solid lightgrey' }}>
                <div style={{ display: 'inline-block', flex: 1}}>
                    <h2 style={{ margin: 0 }}>[{post.tag}] {post.title}</h2> 
                    <span>Author: {post.firstName} {post.lastName}</span>
                    <br />
                    <span>Date: {formattedDate}</span>
                </div>
                {canDelete && <GrTrash size='25' onClick={handleDelete} />}
            </div>

            <p style={{ marginBottom: 0 }}>{post.body}</p>

            <Collapsible title={`Replies (${replyList ? replyList.length : 0})`} defaultState={false}>
                <form onSubmit={handleReply} style={{ display: 'flex' }} >
                    <input
                        style={{ flex: 1, marginRight: '15px' }}
                        type='text'
                        name='replyText'
                        placeholder='Write a reply to this post.'
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                    />
                    <button type='submit' className='standard-button'>Reply</button>
                </form>
                <br />

                {replyList && replyList.map(reply =>
                    <ReplyComponent
                        key={reply.replyId}
                        reply={reply}
                    />
                )}
            </Collapsible>
            
        </div>
    )
}

export default DiscussionPost
