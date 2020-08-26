const express = require('express')
const app = express()
const fs = require('fs')
const config = require('./config.json')
const mariadb = require('mariadb')
const render = require('./scripts/render')

app.use(express.json())
app.use(express.static('public'))

let dbconnected = false

mariadb.createConnection(config.mariaoptions).then(async con => {

    const routerFiles = fs.readdirSync('./routers')

    for (const routerFile of routerFiles) {
        const routerObj = require('./routers/' + routerFile)
        const router = await routerObj.generate(config, con)
        app.use(routerObj.path, router)
        if (config.logging) console.log('router online for ' + routerObj.path + (routerObj.name ? ` (${routerObj.name})` : ''))
    }

    dbconnected = true

    app.get(/\/.*/, (req, res) => {
        if (dbconnected) res.send(render(__dirname + '/html/home.html'))
        else res.send(render(__dirname + '/html/error.html'))
    })

    app.listen(8080, () => console.log('resource-manager listening on localhost:8080'))

}).catch(() => {

    dbconnected = false

    app.get(/\/.*/, (req, res) => {
        if (dbconnected) res.send(render(__dirname + '/html/home.html'))
        else res.send(render(__dirname + '/html/error.html'))
    })

    app.listen(8080, () => console.log('resource-manager listening on localhost:8080'))

    console.error('Failed to connect to database! Please check your MariaDB config.')
})