const express = require('express')
const bodyParser = require('body-parser');
const mirth_api = require('./mirth-api')

const app = express()
const PORT = 5000
let token = ''


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