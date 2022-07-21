const express = require('express')
const DB_CONNECTION = require('./connection')
const mirth_api = require('./mirth-api')
const {CREATE_SQL, INSERT_SQL} = require('./schema')
const {SELECT_TIMESTAMPS} = require('./queries')

let sql
const app = express()
const PORT = 5000
let token = ''

//newly fetched stats from mirth client apis
let fetched_stats = []
//channel groups
let channel_groups


//create table
sql = CREATE_SQL
DB_CONNECTION.run(sql)

//register view engine
app.set('view engine','ejs')
//read form data sent from html form element
app.use(express.urlencoded({extended: true}))
// listen to requests
app.listen(PORT)

//sqlite3 does not support async/await
//create an async function with a promise
async function db_all(query){
    return new Promise(function(resolve,reject){
        DB_CONNECTION.all(query, function(err,rows){
        if(err){return reject(err);}
        resolve(rows);
        });
    });
}


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
            channel_groups = [...stats.channelGroups]
            res.render('channels',{channels : fetched_stats, channelGroups : channel_groups})
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
                sql = INSERT_SQL
                DB_CONNECTION.run(sql, [timestamp, channel.channelId, channel.channelName, channel.received, channel.sent, channel.error, channel.filtered], err => {
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

app.get('/timestamps',(req,res)=> {
    if(token==''){
        res.render('index', {msg : null})
    }
    else{
        sql = SELECT_TIMESTAMPS
        DB_CONNECTION.all(sql,[],(err,rows)=>{
            if(err) console.log(err.message)
            res.render('timestamps',{stats: rows})
        })
    }
})

app.post('/timestamps',async (req,res)=> {
    //list of timestamps that were selected 
    let selected_timestamps = []
    let recent_timestamp
    let older_timestamp

    //recent stats
    let recent_stats = []
    ///older stats
    let older_stats = []

    for(checkbox in req.body){
        selected_timestamps.push(checkbox)
    }
    //make sure two timestamps are selected
    if(selected_timestamps.length != 2){
        res.send('Please select two timestamps to compare.')
    }
    else{
        //sort the timestamps
        selected_timestamps.sort(function(a, b){return a - b})
        recent_timestamp = selected_timestamps[1] 
        older_timestamp = selected_timestamps[0]

        //fetch recent stats
        sql = `SELECT * FROM stats WHERE timestamp = ${recent_timestamp}`
        recent_stats = await db_all(sql)

        //fetch older stats
        sql = `SELECT * FROM stats WHERE timestamp = ${older_timestamp}`
        older_stats = await db_all(sql)

        //generate compared results
        //overwrite compared results to recent_stats
        recent_stats.forEach(stat => {
            older_stat = older_stats.find(older_stat => older_stat.channelId == stat.channelId )
            stat.received   = stat.received - older_stat.received
            stat.sent       = stat.sent - older_stat.sent
            stat.error      = stat.error - older_stat.error
            stat.filtered   = stat.filtered - older_stat.filtered
        })
        res.render('channels',{channels : recent_stats, channelGroups : channel_groups})
    }
})
