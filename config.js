const fs = require('fs')
const DB_PATH = './test.db'

//create db file if doesn't already exist
fs.closeSync(fs.openSync(DB_PATH, 'a'))

module.exports = DB_PATH
