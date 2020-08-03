const express = require('express')
const app = express()
const fs = require('fs')
const config = require('./config.json')
const mariadb = require('mariadb')
const render = require('./scripts/render')

app.use(express.json())
app.use(express.static('public'))

mariadb.createConnection(config.mariaoptions).then(async con => {

    const routerFiles = fs.readdirSync('./routers')

    for (const routerFile of routerFiles) {
        const routerObj = require('./routers/' + routerFile)
        const router = await routerObj.generate(config, con)
        app.use(routerObj.path, router)
        if (config.logging) console.log('router online for ' + routerObj.path + (routerObj.name ? ` (${routerObj.name})` : ''))
    }

    app.get(/\/.*/, (req, res) => res.send(render(__dirname + '/html/home.html')))

    app.listen(8080, () => console.log('resource-manager listening on localhost:8080'))

}).catch(console.error)