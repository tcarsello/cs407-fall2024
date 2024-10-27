require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const Buffer = require('buffer').Buffer
const path = require('path')

const sequelize = require('../database')
const s3 = require('../objectstore')
const { Sequelize, Op } = require('sequelize')

const User = require('../models/userModel')
const Course = require('../models/courseModel')
const CourseInvite = require('../models/courseInviteModel')
const Challenge = require('../models/challengeModel')
const Game = require('../models/gameModel')

const { createJWT } = require('../utils')

const genSalt = async () => {
    const salt = await bcrypt.genSalt(5)
    return salt
}

const createUser = async (req, res) => {
    try {

        const { email, firstName, lastName, password } = req.body

        if (!email) throw "Email must be provided"
        if (!firstName) throw "First Name must be provided"
        if (!lastName) throw "Last Name must be provided"
        if (!password) throw "Password must be provided"

        if (password.length < 6) throw "Password must be at least 6 characers"

        const queryUser = await User.findOne({
            where: {
                email
            }
        })
        if (queryUser) throw "A user already exists with that email address"

        const salt = await genSalt()
        const passwordHash = await bcrypt.hash(password, salt)

        const user = await User.create({
            email,
            firstName,
            lastName,
            passwordHash,
        })
        const token = createJWT(user.dataValues.userId)

        res.status(200).json({
            ...user.dataValues,
            token,
        })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;

		if (!email) throw "Email must be provided";
		const user = await User.findOne({
			where: {
				email,
			},
		});
		if (!user) throw "Email not found";

		const token = jwt.sign({ _id: user.dataValues.userId }, process.env.JWT_SECRET, { expiresIn: "15m" });

		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.EMAIL,
				pass: process.env.PASSWORD_APP_EMAIL,
			},
			sendingRate: 1,
		});

		// TODO: Make link correct if hosted anywhere other than localhost
		const link = `http://localhost:3000/one-time-code/`;
		const mailOptions = {
			from: process.env.EMAIL,
			to: email,
			subject: "Course Clash - Account Recovery",
			html: `<h1>Course Clash Account Recovery</h1>
            <p>Hello ${user.firstName}. Your one time code is:</p>
            <h3>${token}</h3>
            <p>Please enter your one time code on the following page to recover your account:</p>
            <a href="${link}">${link}</a>
            <p>The code will expire in 15 minutes.</p>`,
		};

		transporter.sendMail(mailOptions, (err, info) => {
			if (err) {
				console.error(err);
				return res.status(500).json({ error: "Internal Server Error" });
			}

			res.status(200).send({ message: "Email sent successfully" });
		});
	} catch (err) {
		console.error(err);
		res.status(400).json({ error: err });
	}
};

const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body

        if (!email) throw "Email must be provided"
        if (!password) throw "Password must be provided"

        const user = await User.findOne({
            where: {
                email
            }
        })
        if (!user) throw "Invalid credentials"

        const match = await bcrypt.compare(password, user.dataValues.passwordHash)
        if (!match) throw "Invalid credentials"

        const token = createJWT(user.dataValues.userId)

        res.status(200).json({
            ...user.dataValues,
            token,
        })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getUser = async (req, res) => {
    try {

        const { userId } = req.params

        if (userId != req.user.userId) throw "Wrong user"

        const user = await User.findOne({
            where: {
                userId
            }
        })

        res.status(200).json(user.dataValues)

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const deleteUser = async (req, res) => {
    try {

        const { userId } = req.params

        if (userId != req.user.userId) throw "Wrong user"

        await User.destroy({
            where: {
                userId
            }
        })

        res.status(200).json({
            message: "User deleted"
        })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const updateUser = async (req, res) => {
    try {

        const { userId } = req.params
        const { email, firstName, lastName, password, lightMode, challengeNotifications} = req.body

        if (userId != req.user.userId) throw "Wrong user"

        let passwordHash = undefined
        if (password) {
            if (password.length < 6) throw 'Password must be at least 6 characters!'
            const salt = await genSalt()
            passwordHash = await bcrypt.hash(password, salt)
        }

        await User.update(
            {
                email,
                firstName,
                lastName,
                passwordHash,
                lightMode,
                challengeNotifications,
            },
            {
                where: {
                    userId
                }
            }
        )

        const user = await User.findOne({
            where: {
                userId
            }
        })
        if (!user) throw "User not found"

        const token = createJWT(user.dataValues.userId)

        res.status(200).json({ ...user.dataValues, token })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const verifyToken = async (req, res) => {
	try {
		const { token } = req.body;

        if (!token) throw "Invalid One Time Code";

		const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

		if (!decodedToken) throw "Invalid One Time Code";

		const userId = decodedToken._id;

		const user = await User.findOne({
			where: {
				userId,
			},
		});
		if (!user) throw "User not found";

		res.status(200).json({ message: "Token verified" });
	} catch (err) {
		console.error(err);
		if (err.message) {
			res.status(400).json({ error: "Invalid One Time Code" });
		} else {
			res.status(400).json({ error: err });
		}
	}
};

const resetUserPassword = async (req, res) => {
	try {
		const { token, password } = req.body;

        if (!token) throw "Invalid One Time Code";

		const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

		if (!decodedToken) throw "Invalid One Time Code";

		const userId = decodedToken._id;

		if (!password) throw "Password must be provided";
		if (password.length < 6) throw "Password must be at least 6 characters!";
		let user = await User.findOne({
			where: {
				userId,
			},
		});
		if (!user) throw "User not found";
        console.log(user);

		const salt = await genSalt();
		const passwordHash = await bcrypt.hash(password, salt);

        // Does not seem to work
		if (passwordHash === user.dataValues.passwordHash) throw "Password must be different";

		await User.update(
			{
				passwordHash,
			},
			{
				where: {
					userId,
				},
			}
		);
		user = await User.findOne({
			where: {
				userId,
			},
		});
		if (!user) throw "User not found";

		const new_token = createJWT(user.dataValues.userId);

		res.status(200).json({ ...user.dataValues, token: new_token });
	} catch (err) {
		console.error(err);
        if (err.message) {
            res.status(400).json({ error: "Invalid One Time Code" });
        } else {
            res.status(400).json({ error: err });
        }
	}
};

const getCoordinatingCourses = async (req, res) => {
    try {

        const { userId } = req.params

        if (userId != req.user.userId) throw "Wrong user"

        const courses = await Course.findAll({
            where: {
                coordinatorId: req.user.userId
            },
            order: [['createdAt', 'DESC']]
        })

        res.status(200).json({ courses })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getInvites = async (req, res) => {
    try {

        const { userId } = req.params

        if (userId != req.user.userId) throw "Wrong user"

        const user = await User.findOne({
            where: {
                userId
            }
        })
        if (!user) throw "User does not exist"

        const queryString = `
            SELECT
                c.*,
                ci.*
            FROM
                course c
                INNER JOIN course_invite ci
                    ON c."courseId"=ci."courseId"
                INNER JOIN "user" u
                    ON u.email=ci.email
            WHERE
                u.email=:email
            ;
        `

        const invites = await sequelize.query(queryString, {
            replacements: {
                email: user.email
            },
            type: Sequelize.QueryTypes.SELECT
        })

        res.status(200).json({ invites })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getJoinedCourses = async (req, res) => {
    try {

        const { userId } = req.params

        const user = await User.findOne({ where: { userId } })
        if (!user) throw "User does not exist"

        const courses = await user.getCourses()

        res.status(200).json({ courses })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const uploadProfilePicture = async (req, res) => {
    try {

        const { userId } = req.params
        const { mimeType, imageBase64 } = req.body

        if (!mimeType) throw "Mime type must be provided"
        if (!imageBase64) throw 'Image base64 must be provided'

        let fileExt = mimeType.split('/')[1].toLowerCase()

        if (fileExt === 'jpg') fileExt = 'jpeg'
        if (!['jpeg', 'png'].includes(fileExt)) throw "File extension must be jpeg or png"

        const buffer = Buffer.from(imageBase64, 'base64')

        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `profile_pictures/${userId}_pfp.${fileExt}`,
            Body: buffer,
            ContentType: mimeType
        }
        const data = await s3.upload(params).promise()

        await User.update(
            {
                pfpFileType: fileExt
            },
            {
                where: {
                    userId
                }
            }
        )

        res.status(200).json({
            message: 'Profile picture uploaded successfully',
            imageUrl: data.Location
        })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getProfilePicture = async (req, res) => {
    try {

        const { userId } = req.params

        const user = await User.findOne({
            where: {
                userId
            }
        })
        if (!user) throw "User not found"

        if (!user.pfpFileType) {

            const defaultImagePath = path.join(__dirname, '../static/default-pfp.jpeg')
            res.sendFile(defaultImagePath)
            return

        }

        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `profile_pictures/${userId}_pfp.${user.pfpFileType}`
        }

        const data = await s3.getObject(params).promise()

        res.setHeader('Content-Type', data.ContentType || `image/${user.pfpFileType}`)
        res.send(data.Body)

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getUserPublicInfo = async (req, res) => {
    try {

        const { userId } = req.params

        const user = await User.findOne({
            where: { userId }
        })

        if (!user) throw "User not found"

        res.status(200).json({
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName
        })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getOutgoingChallengesByCourse = async (req, res) => {

    try {

        const { userId, courseId } = req.params

        if (!userId || !courseId) throw 'Must provide userId and courseId'

        const challenges = await Challenge.findAll({
            where: {
                courseId,
                contenderId: userId
            }
        })

        res.status(200).json({ challenges })
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }

}

const getIncomingChallengesByCourse = async (req, res) => {

    try {

        const { userId, courseId } = req.params

        if (!userId || !courseId) throw 'Must provide userId and courseId'

        const challenges = await Challenge.findAll({
            where: {
                courseId,
                challengerId: userId
            }
        })

        res.status(200).json({ challenges })
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }

}

const getGamesByCourse = async (req, res) => {
    try {

        const { userId, courseId } = req.params

        if (!userId || !courseId) throw 'Must provide userId and courseId'

        const queryString = `
            SELECT
                g.*
            FROM game g
            WHERE
                g."courseId" = :courseId
                AND (g."playerOneId" = :userId OR g."playerTwoId" = :userId)
            ORDER BY "updatedAt" DESC
        `;
        const games = await sequelize.query(queryString, {
            replacements: {
                userId,
                courseId
            },
            type: Sequelize.QueryTypes.SELECT
        })

        res.status(200).json({games})
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

const getGames = async (req, res) => {
	try {
		const { userId } = req.params;
        
        if (userId != req.user.userId) throw "Wrong user";

		if (!userId) throw "Must provide userId";

		const queryString = `
            SELECT
                g.*
            FROM game g
            WHERE
                g."playerOneId" = :userId OR g."playerTwoId" = :userId
            ORDER BY "updatedAt" DESC
        `;
		const games = await sequelize.query(queryString, {
			replacements: {
				userId,
			},
			type: Sequelize.QueryTypes.SELECT,
		});

		res.status(200).json({ games });
	} catch (err) {
		console.error(err);
		res.status(400).json({ error: err });
	}
};

const getGamesByCourseWithNames = async (req, res) => {
	try {
		const { userId, courseId } = req.params;

		if (!userId || !courseId) throw "Must provide userId and courseId";

		const queryString = `
            SELECT
                g.*,
                "playerOne"."firstName" AS "playerOneFirstName",
                "playerOne"."lastName" AS "playerOneLastName",
                "playerTwo"."firstName" AS "playerTwoFirstName",
                "playerTwo"."lastName" AS "playerTwoLastName"
            FROM game g
            LEFT JOIN "user" AS "playerOne"
                ON "playerOne"."userId" = g."playerOneId"
            LEFT JOIN "user" AS "playerTwo"
                ON "playerTwo"."userId" = g."playerTwoId"
            WHERE
                g."courseId" = :courseId
                AND (g."playerOneId" = :userId OR g."playerTwoId" = :userId)
            ORDER BY "updatedAt" DESC
        `;
		const games = await sequelize.query(queryString, {
			replacements: {
                courseId,
				userId,
			},
			type: Sequelize.QueryTypes.SELECT,
		});

		res.status(200).json({ games });
	} catch (err) {
		console.error(err);
		res.status(400).json({ error: err });
	}
};

const getGamesWithNames = async (req, res) => {
	try {
		const { userId } = req.params;

		if (userId != req.user.userId) throw "Wrong user";

		if (!userId) throw "Must provide userId";

		const queryString = `
            SELECT
                g.*,
                "playerOne"."firstName" AS "playerOneFirstName",
                "playerOne"."lastName" AS "playerOneLastName",
                "playerTwo"."firstName" AS "playerTwoFirstName",
                "playerTwo"."lastName" AS "playerTwoLastName"
            FROM game g
            LEFT JOIN "user" AS "playerOne"
                ON "playerOne"."userId" = g."playerOneId"
            LEFT JOIN "user" AS "playerTwo"
                ON "playerTwo"."userId" = g."playerTwoId"
            WHERE
                g."playerOneId" = :userId OR g."playerTwoId" = :userId
            ORDER BY "updatedAt" DESC
            `;

		const games = await sequelize.query(queryString, {
			replacements: {
				userId,
			},
			type: Sequelize.QueryTypes.SELECT,
		});

		res.status(200).json({ games });
	} catch (err) {
		console.error(err);
		res.status(400).json({ error: err });
	}
};

const referFriend = async (req, res) => {
    try {

        const { email } = req.body

        if (!email) throw 'email must be provided'

        const user = await User.findOne({
            where: { email }
        })
        if (!user) {
            
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD_APP_EMAIL,
                },
                sendingRate: 1,
            });

            // TODO: Make link correct if hosted anywhere other than localhost
            const link = `http://localhost:3000/`;
            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: "Course Clash - You're Invited!",
                html: `<h1>A friend has invited you to join Course Clash!</h1>
                <p>${req.user.firstName} ${req.user.lastName} invites you to sign up with the link below:</p>
                <a href="${link}">${link}</a>
                `,
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }

                res.status(200).send({ message: "Email sent successfully" });
            });

        }

        res.status(200).json({message: 'invite sent'})

    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

module.exports = {
    createUser,
    forgotPassword,
    loginUser,
    getUser,
    deleteUser,
    updateUser,
    verifyToken,
    resetUserPassword,
    getCoordinatingCourses,
    getInvites,
    getJoinedCourses,
    uploadProfilePicture,
    getProfilePicture,
    getUserPublicInfo,
    getOutgoingChallengesByCourse,
    getIncomingChallengesByCourse,
    getGamesByCourse,
    getGames,
    getGamesByCourseWithNames,
    getGamesWithNames,
    referFriend,
}
