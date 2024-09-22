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

const userRoutes = require('./routes/userRoutes')
const courseRoutes = require('./routes/courseRoutes')
const inviteRoutes = require('./routes/inviteRoutes')
const topicRoutes = require('./routes/topicRoutes')

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
