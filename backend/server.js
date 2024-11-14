require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const sequelize = require('./database')
const s3 = require('./objectstore')

require('./models/userModel')
require('./models/courseModel')
require('./models/courseInviteModel')
require('./models/topicModel')
require('./models/termModel')
require('./models/questionModel')
require('./models/answerModel')
require('./models/postModel')
require('./models/replyModel')
require('./models/postUpvoteModel')
require('./models/replyUpvoteModel')
require('./models/challengeModel')
require('./models/gameModel')
require('./models/roundModel')
require('./models/friendshipModel')
require('./models/roundQuestionModel')
require('./models/announcementModel')
require('./models/assistantModel')

const userRoutes = require('./routes/userRoutes')
const courseRoutes = require('./routes/courseRoutes')
const inviteRoutes = require('./routes/inviteRoutes')
const topicRoutes = require('./routes/topicRoutes')
const termRoutes = require('./routes/termRoutes')
const questionRoutes = require('./routes/questionRoutes')
const answerRoutes = require('./routes/answerRoutes')
const postRoutes = require('./routes/postRoutes')
const replyRoutes = require('./routes/replyRoutes')
const postUpvoteRoutes = require('./routes/postUpvoteRoutes')
const replyUpvoteRoutes = require('./routes/replyUpvoteRoutes')
const challengeRoutes = require('./routes/challengeRoutes')
const gameRoutes = require('./routes/gameRoutes')
const roundRoutes = require('./routes/roundRoutes')
const friendshipRoutes = require('./routes/friendshipRoutes')
const announcementRoutes = require('./routes/announcementRoutes')
const assistantRoutes = require('./routes/assistantRoutes')

const app = express()

// Middleware
app.use(express.json({ limit: '3mb' }))
app.use(express.urlencoded({ limit: '3mb', extended: true }))
app.use(bodyParser.json())
app.use(cors())
app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

// API Routes
app.use('/api/user', userRoutes)
app.use('/api/course', courseRoutes)
app.use('/api/invite', inviteRoutes)
app.use('/api/topic', topicRoutes)
app.use('/api/term', termRoutes)
app.use('/api/question', questionRoutes)
app.use('/api/answer', answerRoutes)
app.use('/api/post', postRoutes)
app.use('/api/reply', replyRoutes)
app.use('/api/postUpvote', postUpvoteRoutes)
app.use('/api/replyUpvote', replyUpvoteRoutes)
app.use('/api/challenge', challengeRoutes)
app.use('/api/game', gameRoutes)
app.use('/api/round', roundRoutes)
app.use('/api/friendship', friendshipRoutes)
app.use('/api/annoucement', announcementRoutes)
app.use('/api/assistant', assistantRoutes)

sequelize.authenticate()
    .then(() => {
        console.log('Database connection established')

        sequelize.sync({ force: false })
            .then(() => {
                console.log('Database synchronization complete')

                app.listen(process.env.API_PORT, () => {
                    console.log(`Server running on port: ${process.env.API_PORT}`)
                })

            })
            .catch(err => {
                console.error('Failed to synchronize database:', err)
            })

    })
    .catch(err => {
        console.error('Unable to connect to database:', err)
    })
