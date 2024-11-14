const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const Course = require('./courseModel')

const Announcement = sequelize.define('announcement', {
    announcementId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
    public: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    }
}, {
    tableName: 'annoucement',
    timestamps: true
})

Announcement.belongsTo(Course, { foreignKey: 'courseId', onDelete: 'CASCADE' })

module.exports = Announcement
