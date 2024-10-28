const { Sequelize, Op } = require('sequelize')
const Game = require('../models/gameModel')

const getGame = async (req, res) => {
    try {

        const { gameId } = req.params

        const game = await Game.findOne({
            where: {
                gameId
            }
        })

        res.status(200).json({ game })
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
