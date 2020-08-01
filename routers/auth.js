const express = require('express')
const fs = require('fs')
const bcrypt = require('bcrypt')

const path = require('path')
const rootdir = path.join(__dirname, '../')
const render = require('../scripts/render')

const jwt = require('jsonwebtoken')
const WEB_TOKEN_SECRET = fs.readFileSync(rootdir + 'jwtsecret.key', 'utf-8')

module.exports = {
    path: '/auth',
    generate: (config, db) => {

        const router = express.Router()

        router.get('/login', (req, res) => res.send(render(rootdir + 'html/login.html')))

        router.post('/login', async(req, res) => {
            if (!req.body.username) return res.send({"err": "missing-username"})
            if (!req.body.password) return res.send({"err": "missing-password"})

            if (req.body.username === config.admin.username) {
                if (!config.admin.hashed && req.body.password !== config.admin.password) return res.send({"err": "incorrect-credentials"})
                else if (config.admin.hashed && !bcrypt.compareSync(req.body.password, config.admin.password)) return res.send({"err": "incorrect-credentials"})

                const token = jwt.sign({}, WEB_TOKEN_SECRET, { expiresIn: 60 * 60 * 24 * 14, subject: 'admin' })
                return res.send({"token": token})
            }

            const users = await db.query('SELECT * FROM users WHERE username = ?', [req.body.username])
            if (users.length === 0) return res.send({"err": "incorrect-credentials"})

            const user = users[0]
            if (!bcrypt.compareSync(req.body.password, user.password)) return res.send({"err": "incorrect-credentials"})
            
            const token = jwt.sign({}, WEB_TOKEN_SECRET, { expiresIn: 60 * 60 * 24 * 14, subject: user.id })
            return res.send({"token": token})
        })

        return router

    }
}