const express = require('express')
const sqlite = require("sqlite3").verbose()
const bodyParser = require('body-parser')
const mirth_api = require('./mirth-api')
let sql

const app = express()
const PORT = 5000
let token = ''

//query existing stats from table
let existing_stats = []
//fetcehd_stats
let fetched_stats = []

//connect to db
const db = new sqlite.Database("./test.db", sqlite.OPEN_READWRITE, err => {
    if(err) console.log(err)
})

//create table
sql = `CREATE TABLE IF NOT EXISTS stats(ID INTEGER PRIMARY KEY,timestamp, channelId, channelName, received, sent, error, filtered)`
db.run(sql)


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
            //copy fetched stats
            fetched_stats = [...stats.channels]

            //delete existing stats from table
            // console.log('deleting existing stats.')
            // db.run(`DELETE FROM stats`,[],err => {
            //     if(err) return console.log(err.message)
            // })

            //insert new stats into table
            // stats.channels.forEach(channel => {
            //     sql = `INSERT INTO stats(channelId, channelName, received, sent, error, filtered) VALUES (?,?,?,?,?,?)`
            //     db.run(sql, [channel.channelId, channel.channelName, channel.received, channel.sent, channel.error, channel.filtered], err => {
            //         if(err) return console.log(err.message)
            //     })
            // })
            //newly stored stats
            // console.log('newly stored stats:')
            // db.all(`SELECT * FROM stats`,[],(err, rows)=>{
            //     if(err) return console.log(err.message)
            //     rows.forEach(row => {
            //         console.log(row)
            //     })
            // })
            res.render('channels',{channels : fetched_stats, channelGroups : stats.channelGroups})
        })
        .catch(error => res.send("Cannot fetch channels!! Service temporarily unavailable."))
    }
})

app.get('/save',(req,res)=>{
    if(token==''){
        res.render('index', {msg : null})
    }
    else{
        console.log('writing to database')
        try{
            let timestamp = Date.now()
            console.log('timestamp now: '+ timestamp)
            fetched_stats.forEach(channel => {
                sql = `INSERT INTO stats(timestamp,channelId, channelName, received, sent, error, filtered) VALUES (?,?,?,?,?,?,?)`
                db.run(sql, [timestamp, channel.channelId, channel.channelName, channel.received, channel.sent, channel.error, channel.filtered], err => {
                    if(err) return console.log(err.message)
                })
            })
            res.redirect('/channels')
        }
        catch{
            console.log('Error saving to database: ')
        }
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