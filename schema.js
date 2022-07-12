const CREATE_SQL =  'CREATE TABLE IF NOT EXISTS stats(ID INTEGER PRIMARY KEY,timestamp, channelId, channelName, received, sent, error, filtered)'
const INSERT_SQL = 'INSERT INTO stats(timestamp,channelId, channelName, received, sent, error, filtered) VALUES (?,?,?,?,?,?,?)'
const DELETE_SQL = 'DELETE FROM stats'

module.exports = {
    CREATE_SQL,
    INSERT_SQL,
    DELETE_SQL   
}
