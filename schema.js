const CREATE_SQL =  'CREATE TABLE IF NOT EXISTS stats(ID INTEGER PRIMARY KEY,timestamp, channelId, channelName, received, sent, error, filtered)'
const INSERT_SQL = 'INSERT INTO stats(timestamp,channelId, channelName, received, sent, error, filtered) VALUES (?,?,?,?,?,?,?)'
const INDEX_SQL = 'CREATE INDEX IF NOT EXISTS timestamp_index ON stats (timestamp);'
const DELETE_SQL = 'DELETE FROM stats'

module.exports = {
    CREATE_SQL,
    INSERT_SQL,
    INDEX_SQL,
    DELETE_SQL   
}

