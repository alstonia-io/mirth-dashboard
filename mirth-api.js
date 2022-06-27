const axios = require('axios').default
require('https').globalAgent.options.rejectUnauthorized = false
var querystring = require('querystring');

let baseurl
let jsession_id

const login_headers = {
    headers : {
        "Content-Type": "application/x-www-form-urlencoded"
    }
}

async function login(baseURL,username,password){
    baseurl = baseURL
    var login_body ={
        username: username,
        password: password
    }
    try{
        let response = await axios.post(`${baseurl}/api/users/_login`,
        querystring.stringify(login_body),
        login_headers
        )
        console.log("successful login")
        jsession_id = response.headers['set-cookie'][0].split(";")[0].split('.')[0]
        return jsession_id
    }
    catch(error){
        console.log("login failed")
        throw new Error('Inavlid credentials')
    }
}

async function channels(){
    let channels=[]
    let channelGroups= []
    try{
        let channel_statistics = await axios.get(`${baseurl}/api/channels/statistics`,
        {
            headers : {
            'Cookie': jsession_id,
            'Accept': "application/json"
            }
        })
        let channel_details = await axios.get(`${baseurl}/api/channels`,
        {
            headers : {
            'Cookie': jsession_id,
            'Accept': "application/json"
            }
        })
        let channel_groups = await axios.get(`${baseurl}/api/channelgroups`,
        {
            headers : {
            'Cookie': jsession_id,
            'Accept': "application/json"
            }
        })
        // console.log('channel groups:')
        channel_groups["data"]["list"]["channelGroup"].forEach(group => {
            let channels_list =  Array.isArray(group.channels.channel) ? group.channels.channel : [group.channels.channel]
            let channel_ids_list = []
            channels_list.forEach(channel => {
                channel_ids_list.push(channel.id)
            })
            channelGroups.push({
                name: group.name,
                channel_ids_list
            })
        })

        console.log("fetched channels: ")
        channel_statistics["data"]["list"]["channelStatistics"].forEach(function(channel) {
            let fetched_channel={}
            let current_channel = channel_details["data"]["list"]["channel"].find(channel_detail => channel_detail.id === channel.channelId)
            fetched_channel["channelName"] = current_channel.name
            for(let property in channel){
                fetched_channel[property] = channel[property]
                console.log(`${property}: ${channel[property]}`)
            }
            channels.push(fetched_channel)
        })
        return {
            channels,
            channelGroups      
        }
    }
    catch(error){
        console.log("Error fetching channels")
    }
}

async function logout(){
    try{
        await axios.post(`${baseurl}/api/users/_logout`,
        {
            headers : {
            'Cookie': jsession_id,
            'Accept': "application/json"
            }
        })
    }
    catch{
        console.log('error logging out')
    }
}


exports.login = login
exports.channels = channels
exports.logout = logout


