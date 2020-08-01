const express = require('express')
const app = express()

const mariadb = require('mariadb')
let conn = null

const config = require('./config.json')

app.get('/', (req, res) => res.send('Hello, world!'))

app.get('/test', async(req, res) => {
    res.send('ok')
    let results = await conn.query('SELECT * FROM users;')
    console.log(results)
})

mariadb.createConnection(config.mariaoptions).then(con => {

    conn = con
    app.listen(8080, () => console.log('resource-manager listening on localhost:8080'))

}).catch(console.error)

