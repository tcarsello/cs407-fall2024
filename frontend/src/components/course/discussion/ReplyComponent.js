
const ReplyComponent = ({ reply }) => {

    return (
        <div style={{ marginLeft: '25px', paddingBottom: '15px',borderBottom: '1px solid lightgrey' }}>
            <strong>{reply.firstName} {reply.lastName}</strong>
            <p style={{ margin: 0 }}>{reply.body}</p>
        </div>
    )

}

export default ReplyComponent
