require('dotenv').config()

const User = require('../models/userModel')
const Course = require('../models/courseModel')
const Topic = require('../models/topicModel')
const Question = require('../models/questionModel')
const Answer = require('../models/answerModel')

const sequelize = require('../database')
const { Sequelize } = require('sequelize')
const s3 = require('../objectstore')
const Feedback = require('../models/feedbackModel')

const Buffer = require('buffer').Buffer

const validateCoordinator = async (userId, topicId) => {

    const queryString = `
        SELECT
            *
        FROM
            topic t
            INNER JOIN course c ON c."courseId"=t."courseId"
            INNER JOIN "user" u ON u."userId"=c."coordinatorId"
        WHERE
            u."userId"=:userId
            AND t."topicId"=:topicId
        ;
    `
    const results = await sequelize.query(queryString, {
        replacements: {
            userId,
            topicId
        },
        type: Sequelize.QueryTypes.SELECT
    })

    return results.length > 0

}

const uploadQuestionImage = async (questionId, imageBase64, imageMimeType) => {

    let fileExt = imageMimeType.split('/')[1]
    if (fileExt === 'jpg') fileExt = 'jpeg'
    if (!['png', 'jpeg'].includes(fileExt)) throw 'Invalid image type (png or jpeg accepted)'

    const buffer = Buffer.from(imageBase64, 'base64')

    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `question_pictures/${questionId}.${fileExt}`,
        Body: buffer,
        ContentType: imageMimeType
    }
    const data = await s3.upload(params).promise()

    await Question.update(
        {
            imageURI: data.Location
        },
        {
            where: {
                questionId
            }
        }
    )

}

const createQuestion = async (req, res) => {
    try {

        const { topicId, text, difficulty, imageBase64, imageMimeType, answerList } = req.body

        if (!(text || (imageBase64 && imageMimeType))) throw 'Question text and/or image must be provided'
        if (!answerList || answerList.length < 1) throw 'Answer choices must be provided'

        if (!answerList.find(answer => answer.isCorrect)) throw 'Answer list must have a correct answer'

        const valid = await validateCoordinator(req.user.userId, topicId)
        if (!valid) throw 'No access to this topic'

        const question = await Question.create({
            text,
            topicId,
            difficulty
        })

        if (!question) throw 'Failed to create question'

        // Upload image if exists
        if (imageBase64 && imageMimeType) {

            uploadQuestionImage(question.questionId, imageBase64, imageMimeType).catch(err => {
                console.error('Question image upload failed: ', err)
            })

        }

        // Make answers
        await Promise.all(answerList.map(answer => Answer.create({ ...answer, questionId: question.questionId })))

        res.status(200).json({question})
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getQuestion = async (req, res) => {
    try {

        const { questionId } = req.params

        const question = await Question.findOne({
            where: { questionId }
        })

        if (!question) throw 'Question not found'

        res.status(200).json({
            question: {
                questionId: question.questionId,
                topicId: question.topicId,
                text: question.text,
                difficulty: question.difficulty,
            },
            hasImage: question.imageURI ? true : false
        })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const updateQuestion = async (req, res) => {
    try {

        const { questionId } = req.params
        const { topicId, text, difficulty, answerList } = req.body

        if (!text) throw 'Question text and/or image must be provided'
        if (!answerList || answerList.length < 1) throw 'Answer choices must be provided'

        if (!answerList.find(answer => answer.isCorrect)) throw 'Answer list must have a correct answer'

        const valid = await validateCoordinator(req.user.userId, topicId)
        if (!valid) throw 'No access to this topic'

        await Question.update(
            {
                topicId,
                text,
                difficulty
            },
            {
                where: {
                    questionId
                }
            }
        )

        // Make answers
        await sequelize.query('DELETE FROM answer WHERE "questionId"=:questionId', {
            replacements: {
                questionId
            },
            type: Sequelize.QueryTypes.DELETE
        })
        await Promise.all(answerList.map(answer => Answer.create({ ...answer, questionId })))

        res.status(200).json({ messsage: 'Question updated' })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const deleteQuestion = async (req, res) => {

    try {

        const { questionId } = req.params

        const question = await Question.findOne({ where: { questionId} })
        if (!question) throw 'Question not found'

        const valid = await validateCoordinator(req.user.userId, question.topicId)
        if (!valid) throw 'No access to this topic'

        await Question.destroy({
            where: {
                questionId
            }
        })

        res.status(200).json({ message: 'Question removed' })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getQuestionAnswers = async (req, res) => {
    try {

        const { questionId } = req.params

        const answers = await Answer.findAll({
            where: {
                questionId
            }
        })

        res.status(200).json({answers})

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getQuestionPicture = async (req, res) => {

    try {

        const { questionId } = req.params

        const question = await Question.findOne({
            where: { questionId }
        })

        if (!question) throw 'Question not found'
        if (!question.imageURI) {
            res.status(404).json()
            return
        }

        const bucketName = question.imageURI.split('.s3.amazonaws.com')[0].split('https://')[1];
        const key = question.imageURI.split('.s3.amazonaws.com/')[1];

        // Parameters for getObject
        const params = {
            Bucket: bucketName,
            Key: key
        };

        const data = await s3.getObject(params).promise();

        res.setHeader('Content-Type', data.ContentType)
        res.send(data.Body)
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const submitFeedback = async (req, res) => {
	try {
		const { questionId } = req.params;
		const { userId, feedback } = req.body;

		if (!questionId) {
			throw Error("Question Id Required");
		}

		if (!userId) {
			throw Error("User Id Required");
		}

		if (!feedback) {
			throw Error("Feedback Required");
		}

		await Feedback.create({
			userId,
			questionId,
			content: feedback,
		});

		return res.status(201).json({
			message: "Feedback created successfully",
		});
	} catch (err) {
		if (err.name && err.name === "SequelizeUniqueConstraintError") {
			return res.status(400).json({
				error: "Feedback already submitted for this question!",
			});
		} else {
            console.error(err);
        }
		res.status(400).json({ error: err });
	}
};

const getFeedback = async (req, res) => {
    try {
        const { questionId } = req.params;

        if (!questionId) {
            throw Error("Question Id Required")
        }

        const feedback = await Feedback.findAll({
			where: { questionId: questionId },
			order: [["createdAt", "DESC"]],
		});

        res.status(200).json({feedback})

    } catch (err) {
        console.error(err);
        res.status(400).json({error: err})
    }
}

module.exports = {
    createQuestion,
    getQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionAnswers,
    getQuestionPicture,
    submitFeedback,
    getFeedback,
}
