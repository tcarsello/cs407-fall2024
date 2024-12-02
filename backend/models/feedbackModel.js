const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const User = require("./userModel");
const Question = require("./questionModel");

const Feedback = sequelize.define(
	"feedback",
	{
		feedbackId: {
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
		questionId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: Question,
				key: "questionId",
			},
		},
		content: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
	},
	{
		tableName: "feedback",
		timestamps: true,
		indexes: [
			{
				unique: true,
				fields: ["userId", "questionId"],
			},
		],
	}
);

Feedback.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
Feedback.belongsTo(Question, { foreignKey: "questionId", onDelete: "CASCADE" });

module.exports = Feedback;