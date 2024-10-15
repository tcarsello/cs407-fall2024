const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const User = require('./userModel')
const Course = require('./courseModel')

const Post = sequelize.define('post', {
    postId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'userId'
        }
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Course,
            key: 'courseId'
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: false
    },
}, {
    tableName: 'post',
    timestamps: true
})

Post.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' })
Post.belongsTo(Course, { foreignKey: 'courseId', onDelete: 'CASCADE' })

module.exports = Post