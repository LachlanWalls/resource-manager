const fs = require('fs')
const path = require('path')
const rootdir = path.join(__dirname, '../')
const jwt = require('jsonwebtoken')
const WEB_TOKEN_SECRET = fs.readFileSync(rootdir + 'jwtsecret.key', 'utf-8')

const userFromID = async(db, id) => {
    if (id === 'admin') return { id: 'admin', username: 'admin', reference: 'admin', permissions: ['ADMIN'] }
    let users = await db.query('SELECT * FROM users WHERE id = ?', [id])
    if (users.length === 0) {
        users = await db.query('SELECT * FROM users WHERE reference = ?', [id])
        if (users.length === 0) return null
    }
    let user = users[0]
    delete user.password
    let perms = await db.query('SELECT * FROM user_permissions WHERE user_id = ?', [id])
    perms = perms.map(rw => rw.permission) || []
    user.permissions = perms
    return user
}

const userFromHeader = (db, header) => new Promise((resolve, reject) => {
    if (!header || header.match(/Bearer .+/).length === 0) resolve({"err": "no-authorization"})
    const token = header.replace('Bearer ', '')
    jwt.verify(token, WEB_TOKEN_SECRET, async(err, decoded) => {
        if (err) resolve({"err": "invalid-authorization"})
        const user = await userFromID(db, decoded.sub)
        if (!user) resolve({"err": "invalid-authorization"})
        resolve(user)
    })
})

const userFromHeaderHasPerm = async(db, header, perm) => {
    const user = await userFromHeader(db, header)
    if (user.err) return user
    if (user.permissions.includes(perm) || user.permissions.includes('ADMIN')) return {"status": "success"}
    else return {"err": "insufficient-permissions"}
}

const allUsers = async db => {
    let users = await db.query('SELECT * FROM users')
    for (let usr of users) {
        delete usr.password
        let perms = await db.query('SELECT * FROM user_permissions WHERE user_id = ?', [usr.id])
        perms = perms.map(rw => rw.permission) || []
        usr.permissions = perms
    }
    return users
}

module.exports = {
    userFromID: userFromID,
    userFromHeader: userFromHeader,
    userFromHeaderHasPerm: userFromHeaderHasPerm,
    allUsers: allUsers
}