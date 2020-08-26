// This file is used to load a HTML file, and replace certain keywords (in this case, used for the website name).

const fs = require('fs')
const config = require('../config.json')
const path = require('path')

const MAPS = {
    "%SITENAME%": config.sitename
}

const renderMaps = content => {
    for (const map of Object.keys(MAPS)) {
        content = content.replace(new RegExp(map, 'g'), MAPS[map])
    }
    return content
}

const render = path => renderMaps(fs.readFileSync(path, 'utf-8'))

module.exports = render