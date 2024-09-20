const { Sequelize } = require('sequelize')
const fs = require('fs')
const path = require('path')

const sslCert = path.resolve(__dirname, process.env.DB_SSL_CERT_PATH);

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: true,
                ca: fs.readFileSync(sslCert).toString()
            }
        }
    }
)

module.exports = sequelize