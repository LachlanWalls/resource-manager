const express = require('express')
const utils = require('../scripts/utils')
const bcrypt = require('bcrypt')
const constants = require('../scripts/constants')
const permissions = require('../scripts/permissions')

module.exports = {
    path: '/api/users',
    generate: (config, db) => {

        const router = express.Router()

        router.get('/', async(req, res) => {
            await new Promise((resolve, reject) => setTimeout(resolve, 200))

            const permres = await utils.userFromHeaderHasPerm(db, req.headers.authorization, 'MANAGE_USERS')
            if (permres.err) return res.send(permres)

            let users = await utils.allUsers(db)
            return res.send(users)
        })

        router.get('/:user', async(req, res) => {
            await new Promise((resolve, reject) => setTimeout(resolve, 100))

            const requser = await utils.userFromHeader(db, req.headers.authorization)
            if (requser.err) return res.send(requser)

            const user = await utils.userFromID(db, req.params.user)
            if (!user) return res.status(404).send({"err": "unknown-user"})
            
            const canSeePermissions = Boolean(requser.id === user.id || permissions.checkPerm(requser.permissions, 'MANAGE_USERS'))
            if (!canSeePermissions) delete user.permissions

            return res.send(user)
        })

        router.post('/', async(req, res) => {
            await new Promise((resolve, reject) => setTimeout(resolve, 300))

            const permres = await utils.userFromHeaderHasPerm(db, req.headers.authorization, 'MANAGE_USERS')
            if (permres.err) return res.send(permres)

            if (!req.body.username) return res.send({"err": "missing-username"})
            if (!req.body.password) return res.send({"err": "missing-password"})

            const gr = () => Math.floor(Math.random() * 10)
            const id = `U-${gr()}${gr()}${gr()}${gr()}-${gr()}${gr()}${gr()}${gr()}-${gr()}${gr()}${gr()}${gr()}`

            const username = req.body.username
            const reference = username.replace(/[^0-9A-Za-z-]/g, '-').toLowerCase()
            const hash = bcrypt.hashSync(req.body.password, 10)

            await db.query('INSERT INTO users (`id`, `username`, `reference`, `password`) VALUES (?, ?, ?, ?)', [id, username, reference, hash])

            return res.send({
                "id": id,
                "username": username,
                "reference": reference,
                "permissions": 0,
            })
        })

        router.put('/:user', async(req, res) => {
            await new Promise((resolve, reject) => setTimeout(resolve, 200))

            const requser = await utils.userFromHeader(db, req.headers.authorization)
            if (requser.err) return res.send(requser)

            const targetuser = await utils.userFromID(db, req.params.user)
            if (!targetuser) return res.status(404).send({"err": "unknown-user"})

            let canChangeUsername = Boolean(requser.id === targetuser.id || permissions.checkPerm(requser.permissions, 'MANAGE_USERS'))
            let canChangePassword = Boolean(requser.id === targetuser.id || permissions.checkPerm(requser.permissions, 'ADMIN'))
            let canChangePermissions = Boolean(permissions.checkPerm(requser.permissions, 'ADMIN'))

            if (req.body.username && !canChangeUsername) return res.send({"err": "insufficient-permissions"})
            if (req.body.password && !canChangePassword) return res.send({"err": "insufficient-permissions"})
            if ((req.body.permissions || req.body.permissions === 0) && !canChangePermissions) return res.send({"err": "insufficient-permissions"})

            if (req.body.username) {
                const newusername = req.body.username
                const newreference = newusername.replace(/[^0-9A-Za-z-]/g, '-').toLowerCase()
                const testuser = await utils.userFromID(db, newreference)
                if (testuser && !testuser.err) return res.send({"err": "username-in-use"})
                await db.query('UPDATE users SET username = ?, reference = ? WHERE id = ?', [newusername, newreference, targetuser.id])
            }

            if (req.body.password) {
                const hash = bcrypt.hashSync(req.body.password, 10)
                await db.query('UPDATE users SET password = ? WHERE id = ?', [hash, targetuser.id])
            }

            if (req.body.permissions || req.body.permissions === 0) {
                const newperms = permissions.cleanBitfield(req.body.permissions)
                await db.query('UPDATE users SET permissions = ? WHERE id = ?', [newperms, targetuser.id])
            }

            const newuser = await utils.userFromID(db, targetuser.id)
            return res.send(newuser)
        })

        router.delete('/:user', async(req, res) => {
            await new Promise((resolve, reject) => setTimeout(resolve, 200))

            const requser = await utils.userFromHeader(db, req.headers.authorization)
            if (requser.err) return res.send(requser)

            const targetuser = await utils.userFromID(db, req.params.user)
            if (!targetuser) return res.status(404).send({"err": "unknown-user"})

            let hasPerms = Boolean(requser.id === targetuser.id || permissions.checkPerm(requser.permissions, 'ADMIN'))
            if (!hasPerms) return res.send({"err": "insufficient-permissions"})

            await db.query('DELETE FROM users WHERE id = ?', [targetuser.id])

            return res.status(204).send()
        })

        return router

    }
}