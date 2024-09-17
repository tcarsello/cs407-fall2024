require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const sequelize = require('./database')
const s3 = require('./objectstore')

const User = require('./models/userModel')
const Course = require('./models/courseModel')
const CourseInvite = require('./models/courseInviteModel')

const userRoutes = require('./routes/userRoutes')
const courseRoutes = require('./routes/courseRoutes')

const app = express()

// Middleware
app.use(express.json())
app.use(bodyParser.json())
app.use(cors())
app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

// API Routes
app.use('/api/user', userRoutes)
app.use('/api/course', courseRoutes)

sequelize.authenticate()
    .then(() => {
        console.log('Database connection established')

        sequelize.sync({force: false})
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
