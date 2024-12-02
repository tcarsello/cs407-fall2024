const Announcement = require("../models/announcementModel")

const createAnnouncement = async (req, res) => {
    try {

        const { courseId, title, body, public } = req.body

        if (!courseId) throw 'Course ID must be provided'
        if (!title) throw 'Title must be provided'
        if (!body) throw 'Body must be provided'

        const announcement = await Announcement.create({
            courseId,
            title,
            body,
            public
        })

        res.status(200).json({announcement})
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

const getAnnouncement = async (req, res) => {
    try {
        const { announcementId } = req.params

        const announcement = await Announcement.findOne({
            where: {
                announcementId
            }
        })

        if (!announcement) throw 'Not found'

        res.status(200).json({announcement})
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

const updateAnnouncement = async (req, res) => {
    try {
        const { annoucementId } = req.params
        const { title, body, public } = req.body

        const announcement = await Announcement.findOne({ where: { annoucementId } })
        if (!announcement) throw 'Announcement not found'

        await Announcement.update(
            { title, body, public },
            {
                where: {
                    annoucementId
                }
            }
        )

        res.status(200).json({ message: 'Announcement updated' })
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

const deleteAnnouncement = async (req, res) => {
    try {
        const { announcementId } = req.params

        await Announcement.destroy({
            where: {
                announcementId
            }
        })

        res.status(200).json({ message: 'Announcement deleted' })
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

module.exports = {
    createAnnouncement,
    getAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
}
