const { Sequelize, Op } = require('sequelize')
const Game = require('../models/gameModel')
const Round = require('../models/roundModel')
const Topic = require('../models/topicModel')
const Question = require('../models/questionModel')
const RoundQuestion = require('../models/roundQuestionModel')
const Challenge = require('../models/challengeModel')
const Course = require('../models/courseModel')

const sequelize = require('../database')

const getGame = async (req, res) => {
    try {

        const { gameId } = req.params

        const queryString = `
            SELECT
                g.*,
                CONCAT(p1."firstName", ' ', p1."lastName") AS "playerOneName",
                CONCAT(p2."firstName", ' ', p2."lastName") AS "playerTwoName"
            FROM
                game g
                INNER JOIN "user" p1 ON p1."userId"=g."playerOneId"
                INNER JOIN "user" p2 ON p2."userId"=g."playerTwoId"
            WHERE
                g."gameId"=:gameId
            ;
        `

		const game = await sequelize.query(queryString, {
			replacements: {
				gameId,
			},
			type: Sequelize.QueryTypes.SELECT,
		});

        if (game.length < 1) throw 'Game not found'

        res.status(200).json({ game: game[0] })
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

const updateGame = async (req, res) => {
    try {

        res.status(200).json()
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

const deleteGame = async (req, res) => {
    try {

        res.status(200).json()
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

const resignGame = async (req, res) => {
	try {
		const { gameId } = req.params;
		const { userId } = req.body;

		if (userId != req.user.userId) throw "Wrong user";

		const game = await Game.findOne({
			where: {
				gameId,
				[Op.or]: {
					playerOneId: userId,
					playerTwoId: userId,
				},
			},
		});

		if (!game) {
			throw "Game not found";
		}

		if (game.status !== "New" && game.status !== "In Progress") {
			throw "Game already ended";
		}

		const new_status = game.playerOneId === userId ? "Player Two Win" : "Player One Win";

		await game.update({
			status: new_status,
		});
		res.status(200).json(game);
	} catch (err) {
		console.error(err);
		res.status(400).json({ error: err });
	}
};

const getGameRounds = async (req, res) => {
    try {

        const { gameId } = req.params
        const queryString = `
            SELECT 
                r."roundId" AS "roundId",
                ROW_NUMBER() OVER (ORDER BY r."createdAt") AS "roundNumber",
                t."topicName" AS "topicName",
                COUNT(rq."questionId") AS "roundQuestions",
                SUM(CASE WHEN rq."playerOneStatus" = 'Correct' THEN 1 ELSE 0 END) AS "playerOneScore",
                SUM(CASE WHEN rq."playerTwoStatus" = 'Correct' THEN 1 ELSE 0 END) AS "playerTwoScore",
                -- Determine if Player One is done
                CASE 
                    WHEN COUNT(rq."questionId") = 0 
                         OR COUNT(CASE WHEN rq."playerOneStatus" = 'Unanswered' THEN 1 ELSE NULL END) = 0 
                    THEN TRUE 
                    ELSE FALSE 
                END AS "playerOneDone",
                -- Determine if Player Two is done
                CASE 
                    WHEN COUNT(rq."questionId") = 0 
                         OR COUNT(CASE WHEN rq."playerTwoStatus" = 'Unanswered' THEN 1 ELSE NULL END) = 0 
                    THEN TRUE 
                    ELSE FALSE 
                END AS "playerTwoDone",
                -- Determine the Round Winner
                CASE 
                    WHEN COUNT(rq."questionId") = 0 THEN 'Tie'
                    WHEN COUNT(CASE WHEN rq."playerOneStatus" = 'Unanswered' THEN 1 ELSE NULL END) = 0 
                         AND COUNT(CASE WHEN rq."playerTwoStatus" = 'Unanswered' THEN 1 ELSE NULL END) = 0 THEN
                        CASE 
                            WHEN SUM(CASE WHEN rq."playerOneStatus" = 'Correct' THEN 1 ELSE 0 END) > 
                                 SUM(CASE WHEN rq."playerTwoStatus" = 'Correct' THEN 1 ELSE 0 END)
                            THEN CONCAT(u1."firstName", ' ', u1."lastName")
                            WHEN SUM(CASE WHEN rq."playerOneStatus" = 'Correct' THEN 1 ELSE 0 END) <
                                 SUM(CASE WHEN rq."playerTwoStatus" = 'Correct' THEN 1 ELSE 0 END)
                            THEN CONCAT(u2."firstName", ' ', u2."lastName")
                            ELSE 'Tie'
                        END
                    ELSE 'Unfinished'
                END AS "roundWinner"
            FROM 
                round r
            LEFT JOIN topic t ON r."topicId" = t."topicId"
            LEFT JOIN round_question rq ON r."roundId" = rq."roundId"
            JOIN game g ON r."gameId" = g."gameId"
            JOIN "user" u1 ON g."playerOneId" = u1."userId"
            JOIN "user" u2 ON g."playerTwoId" = u2."userId"
            WHERE
                g."gameId"=:gameId
            GROUP BY 
                r."roundId", t."topicName", u1."firstName", u1."lastName", u2."firstName", u2."lastName"
            ORDER BY 
                r."createdAt";

        `

		const rounds = await sequelize.query(queryString, {
			replacements: {
				gameId,
			},
			type: Sequelize.QueryTypes.SELECT,
		});


        res.status(200).json({ rounds })
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

const startRound = async (req, res) => {
    try {

        const { gameId } = req.params
        const { topicId } = req.body

        if (!topicId) throw 'Topic ID must be provided'

        const game = await Game.findOne({
            where: { gameId }
        })

        const topic = await Topic.findOne({
            where: { topicId }
        })

        if (!topic) throw 'Topic not found'

        if (!game) throw 'Game not found'

        const round = await Round.create({
            gameId,
            topicId,
        })

        const createQuestionQueryString = `
            INSERT
                INTO round_question ("roundId", "questionId", "createdAt", "updatedAt")
            SELECT
                :roundId,
                q."questionId",
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            FROM
                question q 
            WHERE q."topicId"=:topicId;
        `

		const newQuestions = await sequelize.query(createQuestionQueryString, {
			replacements: {
                roundId: round.roundId,
                topicId: topicId,
			},
			type: Sequelize.QueryTypes.INSERT,
		});

        const queryString = `
            SELECT 
                r."roundId" AS "roundId",
                ROW_NUMBER() OVER (ORDER BY r."createdAt") AS "roundNumber",
                t."topicName" AS "topicName",
                COUNT(rq."questionId") AS "roundQuestions",
                SUM(CASE WHEN rq."playerOneStatus" = 'Correct' THEN 1 ELSE 0 END) AS "playerOneScore",
                SUM(CASE WHEN rq."playerTwoStatus" = 'Correct' THEN 1 ELSE 0 END) AS "playerTwoScore",
                CASE 
                    WHEN COUNT(rq."questionId") = 0 
                         OR COUNT(CASE WHEN rq."playerOneStatus" = 'Unanswered' THEN 1 ELSE NULL END) = 0 
                    THEN TRUE 
                    ELSE FALSE 
                END AS "playerOneDone",
                CASE 
                    WHEN COUNT(rq."questionId") = 0 
                         OR COUNT(CASE WHEN rq."playerTwoStatus" = 'Unanswered' THEN 1 ELSE NULL END) = 0 
                    THEN TRUE 
                    ELSE FALSE 
                END AS "playerTwoDone",
                CASE 
                    WHEN COUNT(rq."questionId") = 0 THEN 'Tie'
                    WHEN COUNT(CASE WHEN rq."playerOneStatus" = 'Unanswered' THEN 1 ELSE NULL END) = 0 
                         AND COUNT(CASE WHEN rq."playerTwoStatus" = 'Unanswered' THEN 1 ELSE NULL END) = 0 THEN
                        CASE 
                            WHEN SUM(CASE WHEN rq."playerOneStatus" = 'Correct' THEN 1 ELSE 0 END) > 
                                 SUM(CASE WHEN rq."playerTwoStatus" = 'Correct' THEN 1 ELSE 0 END)
                            THEN CONCAT(u1."firstName", ' ', u1."lastName")
                            WHEN SUM(CASE WHEN rq."playerOneStatus" = 'Correct' THEN 1 ELSE 0 END) <
                                 SUM(CASE WHEN rq."playerTwoStatus" = 'Correct' THEN 1 ELSE 0 END)
                            THEN CONCAT(u2."firstName", ' ', u2."lastName")
                            ELSE 'Tie'
                        END
                    ELSE 'Unfinished'
                END AS "roundWinner"
            FROM 
                round r
            LEFT JOIN topic t ON r."topicId" = t."topicId"
            LEFT JOIN round_question rq ON r."roundId" = rq."roundId"
            JOIN game g ON r."gameId" = g."gameId"
            JOIN "user" u1 ON g."playerOneId" = u1."userId"
            JOIN "user" u2 ON g."playerTwoId" = u2."userId"
            WHERE
                r."roundId"=:roundId
            GROUP BY 
                r."roundId", t."topicName", u1."firstName", u1."lastName", u2."firstName", u2."lastName"
            ORDER BY 
                r."createdAt";
        `

		const rounds = await sequelize.query(queryString, {
			replacements: {
                roundId: round.roundId,
			},
			type: Sequelize.QueryTypes.SELECT,
		});

        await Game.update(
            {
                status: 'In Progress'
            },
            {
                where: { gameId }
            }
        )

        res.status(200).json({ round: rounds[0] })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const declareScore = async (req, res) => {
    try {
        const { gameId } = req.params
        const { playerOneScore, playerTwoScore } = req.body

        let status = 'In Progress'
        if (playerOneScore > playerTwoScore) status = 'Player One Win'
        if (playerOneScore < playerTwoScore) status = 'Player Two Win'
        if (playerOneScore === playerTwoScore) status = 'Tie'

        const game = await Game.findOne(
            {
                where: { gameId }
            }
        );

        if (game.status === "In Progress" || game.status === "New") {
            await game.update({ status: status });
        }

        res.status(200).json({ message: 'Status updated' })

    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

const sendRematch = async (req, res) => {
    try {

        const { gameId } = req.params

        const game = await Game.findOne({
            where: { gameId }
        })
        if (!game) throw 'Game not found'

        const sendingUserId = req.user.userId
        
        let receivingUserId;
        if (game.playerOneId === sendingUserId) {
            receivingUserId = game.playerTwoId
        } else if (game.playerTwoId === sendingUserId) {
            receivingUserId = game.playerOneId
        }
        
        if (!receivingUserId) throw 'Could not determine sender and receiver' 

        // Check outgoing challenge
        let challenge = await Challenge.findOne({
            where: {
                courseId: game.courseId,
                contenderId: sendingUserId,
                challengerId: receivingUserId,
            }
        }) 
        if (challenge) throw 'Outgoing challenge already exists'

        // Check incoming challenge
        challenge = await Challenge.findOne({
            where: {
                courseId: game.courseId,
                contenderId: receivingUserId,
                challengerId: sendingUserId,
            }
        }) 

        let message;
        if (!challenge) {

            const newChallenge = await Challenge.create({
                courseId: game.courseId,
                contenderId: sendingUserId,
                challengerId: receivingUserId,
            })
            message = 'Challenge sent'
        } else {

            const course = await Course.findOne({
                where: { courseId: game.courseId }
            })

            const newGame = await Game.create({
                courseId: course.courseId,
                playerOneId: receivingUserId,
                playerTwoId: sendingUserId,
                maxRounds: course.gameRoundLimit,
            })

            await challenge.destroy()
            message = 'Game created'

        }

        res.status(200).json({message})
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

module.exports = {
    getGame,
    updateGame,
    deleteGame,
    resignGame,
    getGameRounds,
    startRound,
    declareScore,
    sendRematch,
}
