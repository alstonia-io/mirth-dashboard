const SELECT_ALL = 'SELECT * FROM stats'
const SELECT_TIMESTAMPS = 'SELECT DISTINCT timestamp FROM stats ORDER BY timestamp DESC'

module.exports = {
    SELECT_ALL,
    SELECT_TIMESTAMPS
}
