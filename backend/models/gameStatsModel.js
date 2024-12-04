const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const User = require("./userModel");
const Course = require("./courseModel");
const { FORCE } = require("sequelize/lib/index-hints");

const GameStats = sequelize.define(
	"game_stats",
	{
		gameStatsId: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: User,
				key: "userId",
			},
		},
		courseId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: Course,
				key: "courseId",
			},
		},
		gamesWon: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
			validate: {
				min: 0,
			},
		},
		gamesTied: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
			validate: {
				min: 0,
			},
		},
		gamesLost: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
			validate: {
				min: 0,
			},
		},
		questionsCorrect: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
			validate: {
				min: 0,
			},
		},
		questionsAnswered: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
			validate: {
				min: 0,
			},
		},
		gamesPlayed: {
			type: DataTypes.VIRTUAL,
			get() {
				return this.gamesWon + this.gamesTied + this.gamesLost;
			},
		},
		topicStats: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "0"
		}
	},
	{
		tableName: "game_stats",
		timestamps: true,
		indexes: [
			{
				unique: true,
				fields: ["userId", "courseId"],
			},
			{ fields: ["userId"] },
			{ fields: ["courseId"] },
		],
	}
);

GameStats.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
GameStats.belongsTo(Course, { foreignKey: "courseId", onDelete: "CASCADE" });

module.exports = GameStats;
