import { useState } from 'react'

import '@fortawesome/fontawesome-free/css/all.min.css';

import Collapsible from '../Collapsible';

const DiscussionPost = ({ post }) => {
    const date = new Date(post.createdAt);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);

    return (
        <div className='content-card'>
            <h2 style={{ margin: 0 }}>{post.title}</h2> 
            <span>Author: {post.firstName} {post.lastName}</span>
            <br />
            <span>Date: {formattedDate}</span>
        </div>
    )
}

export default DiscussionPost
