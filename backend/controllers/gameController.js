const { Sequelize, Op } = require('sequelize')
const Game = require('../models/gameModel')

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

module.exports = {
    getGame,
    updateGame,
    deleteGame,
    resignGame
}
