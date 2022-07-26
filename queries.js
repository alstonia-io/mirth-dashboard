const SELECT_ALL = 'SELECT * FROM stats'
const SELECT_TIMESTAMPS = 'SELECT DISTINCT timestamp FROM stats ORDER BY timestamp DESC'
const SELECT_ROWS = 'SELECT * FROM stats WHERE timestamp ='

module.exports = {
    SELECT_ALL,
    SELECT_TIMESTAMPS,
    SELECT_ROWS
}
