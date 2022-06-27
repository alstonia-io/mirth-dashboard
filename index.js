const express = require('express')
const sqlite = require("sqlite3").verbose()
const bodyParser = require('body-parser')
const mirth_api = require('./mirth-api')
let sql

const app = express()
const PORT = 5000
let token = ''


//connect to db
const db = new sqlite.Database("./test.db", sqlite.OPEN_READWRITE, err => {
    if(err) console.log(err)
})

//create table
sql = `CREATE TABLE IF NOT EXISTS stats(ID INTEGER PRIMARY KEY,channelId, channelName, received, sent, error, filtered)`
db.run(sql)

//query existing stats from table
let existing_stats = []
console.log('existing stats:')
sql = `SELECT * FROM stats`
db.all(sql, [], (err,rows)=>{
    if(err) return console.log(err.message)
    existing_stats = [...rows]
    existing_stats.forEach(stat => {
        console.log(stat)
    })
})

//register view engine
app.set('view engine','ejs')

//read form data sent from html form element
app.use(express.urlencoded({extended: true}))

// listen to requests
app.listen(PORT)

app.get('/',(req,res)=> {
    if(token==''){
            res.render('index', {msg : null})
    }
    else{
        res.redirect('/channels')
    }
})

app.get('/channels',(req,res)=>{
    if(token==''){
        res.render('index', {msg : null})
    }
    else{
        mirth_api.channels()
        .then(stats=>{
            //delete existing stats from table
            console.log('deleting existing stats.')
            db.run(`DELETE FROM stats`,[],err => {
                if(err) return console.log(err.message)
            })

            //insert new stats into table
            stats.channels.forEach(channel => {
                sql = `INSERT INTO stats(channelId, channelName, received, sent, error, filtered) VALUES (?,?,?,?,?,?)`
                db.run(sql, [channel.channelId, channel.channelName, channel.received, channel.sent, channel.error, channel.filtered], err => {
                    if(err) return console.log(err.message)
                })
            })
            //newly stored stats
            console.log('newly stored stats:')
            db.all(`SELECT * FROM stats`,[],(err, rows)=>{
                if(err) return console.log(err.message)
                rows.forEach(row => {
                    console.log(row)
                })
            })
            res.render('channels',{channels : stats.channels, channelGroups : stats.channelGroups})
        })
        .catch(error => res.send("Cannot fetch channels!! Service temporarily unavailable."))
    }
})

app.get('/logout',async (req,res)=>{
    await mirth_api.logout()
    token = ''
    res.redirect('/')
})

app.post('/',(req,res)=>{   
        mirth_api.login(req.body.baseURL,req.body.username, req.body.password)
        .then(sessionid => {
            token = sessionid
            res.redirect('/channels')
        })
        .catch(error => res.render('index',{msg : 'Incorrect credentials' })  )
})