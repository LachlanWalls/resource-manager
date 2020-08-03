const express = require('express')
const fs = require('fs')
const bcrypt = require('bcrypt')

const path = require('path')
const rootdir = path.join(__dirname, '../')

const jwt = require('jsonwebtoken')
const WEB_TOKEN_SECRET = fs.readFileSync(rootdir + 'jwtsecret.key', 'utf-8')

module.exports = {
    path: '/api/token',
    generate: (config, db) => {

        const router = express.Router()

        router.post('/verify', (req, res) => {
            if (!req.body.token) return res.send({"err": "missing-token"})
            jwt.verify(req.body.token, WEB_TOKEN_SECRET, async(err, decoded) => {
                if (err) return res.send({"err": "invalid-token"})

                if (decoded.sub === 'admin') {
                    let payload = { id: decoded.sub, username: 'admin', reference: 'admin' }
                    if (decoded.exp - (60*60*24*7) < Date.now() / 1000) payload.refresh = true
                    return res.send(payload)
                }

                const users = await db.query('SELECT * FROM users WHERE id = ?', [decoded.sub])
                if (users.length === 0) return res.send({"err": "invalid-token"})

                let payload = { id: decoded.sub, username: users[0].username, reference: users[0].reference }
                if (decoded.exp - (60*60*24*7) < Date.now() / 1000) payload.refresh = true
                return res.send(payload)
            })
        })

        router.post('/refresh', (req, res) => {
            if (!req.body.token) return res.send({"err": "missing-token"})
            jwt.verify(req.body.token, WEB_TOKEN_SECRET, async(err, decoded) => {
                if (err) return res.send({"err": "invalid-token"})

                const users = await db.query('SELECT * FROM users WHERE id = ?', [decoded.sub])
                if (users.length === 0 && decoded.sub !== 'admin') return res.send({"err": "invalid-token"})

                const newtoken = jwt.sign({}, WEB_TOKEN_SECRET, { expiresIn: 60 * 60 * 24 * 14, subject: decoded.sub })
                return res.send({"token": newtoken})
            })
        })

        return router

    }
}