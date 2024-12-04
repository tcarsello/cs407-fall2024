const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Course = require("./courseModel");
const User = require("./userModel");
const GameStats = require("./gameStatsModel");

const Game = sequelize.define(
	"game",
	{
		gameId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		courseId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: Course,
				key: "courseId",
			},
		},
		playerOneId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: User,
				key: "userId",
			},
		},
		playerTwoId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: User,
				key: "userId",
			},
		},
		status: {
			type: DataTypes.ENUM("New", "In Progress", "Player One Win", "Player Two Win", "Tie"),
			allowNull: false,
			defaultValue: "New",
		},
		maxRounds: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	},
	{
		tableName: "game",
		timestamps: true,
	}
);

Game.belongsTo(Course, { foreignKey: "courseId", onDelete: "CASCADE" });
Game.belongsTo(User, { foreignKey: "playerOneId", onDelete: "CASCADE" });
Game.belongsTo(User, { foreignKey: "playerTwoId", onDelete: "CASCADE" });

let debounceTimers = {};

Game.afterUpdate(async (game, options) => {
	const gameId = game.gameId;
	if (game.status === game.previous("status")) {
		return;
	}

	if (!["Player One Win", "Player Two Win", "Tie"].includes(game.status)) {
		return;
	}

	// Clear previous timer for this game
	if (debounceTimers[gameId]) {
		clearTimeout(debounceTimers[gameId]);
	}

	// Set a new timer
	debounceTimers[gameId] = setTimeout(async () => {
		const { courseId, playerOneId, playerTwoId, status } = game;

		// Ensure GameStats exists for both players
		await Promise.all([
			GameStats.findOrCreate({
				where: { userId: playerOneId, courseId },
			}),
			GameStats.findOrCreate({
				where: { userId: playerTwoId, courseId },
			}),
		]);

		// Update stats based on the new game result
		if (status === "Player One Win") {
			await GameStats.increment("gamesWon", { where: { userId: playerOneId, courseId } });
			await GameStats.increment("gamesLost", { where: { userId: playerTwoId, courseId } });
		} else if (status === "Player Two Win") {
			await GameStats.increment("gamesWon", { where: { userId: playerTwoId, courseId } });
			await GameStats.increment("gamesLost", { where: { userId: playerOneId, courseId } });
		} else if (status === "Tie") {
			await GameStats.increment("gamesTied", { where: { userId: playerOneId, courseId } });
			await GameStats.increment("gamesTied", { where: { userId: playerTwoId, courseId } });
		}

		// Clear the timer
		delete debounceTimers[gameId];
	}, 100); // Delay in milliseconds
});

module.exports = Game;
