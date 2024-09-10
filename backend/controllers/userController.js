const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const User = require('../models/userModel')

const { createJWT } = require('../utils')

const createUser = async (req, res) => {
    try {

        res.status(200).json()
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const loginUser = async (req, res) => {
    try {

        res.status(200).json()
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getUser = async (req, res) => {
    try {

        res.status(200).json()
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const deleteUser = async (req, res) => {
    try {

        res.status(200).json()
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const updateUser = async (req, res) => {
    try {

        res.status(200).json()
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const queryUsers = async (req, res) => {
    try {

        res.status(200).json()
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const resetUserPassword = async (req, res) => {
    try {

        res.status(200).json()
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

module.exports = { createUser, loginUser, getUser, deleteUser, updateUser, queryUsers, resetUserPassword }