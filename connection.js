const sqlite = require("sqlite3").verbose()
const DB_PATH = require("./config")

const db = new sqlite.Database(DB_PATH, sqlite.OPEN_READWRITE, err => {
    if(err) console.log(err)
})

module.exports = db