const pool = require('../config/db')
const { AppError } = require('../utilities/errorCodes')

const getTransactionsForLeagueOwner = async(email) => {
    try{
        const transactions = await pool.query(`
            SELECT t.amount, t.created_at, tm.name, l.league_name
            FROM transactions t
            JOIN teams tm ON t.team_id = tm.id
            JOIN leagues l ON tm.league_id = l.id
            JOIN users u ON u.id = l.organizer_id
            WHERE email=$1
            
        `, [email])

        return transactions.rows;
    }catch(e){
        throw new AppError('Error Fetching Transactions', 400)
    }
}

module.exports = {
    getTransactionsForLeagueOwner
}