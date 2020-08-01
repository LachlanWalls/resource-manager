const express = require('express')

const path = require('path')
const rootdir = path.join(__dirname, '../')

module.exports = {
    path: '/auth',
    generate: (config, db) => {

        const router = express.Router()

        router.get('/login', (req, res) => res.send('Login page'))

        return router

    }
}