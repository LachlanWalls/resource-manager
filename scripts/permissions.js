const perms = require('./constants').PERMISSIONS
const generatePermStructures = require('../public/home/scripts/permissions')
module.exports = generatePermStructures(perms)