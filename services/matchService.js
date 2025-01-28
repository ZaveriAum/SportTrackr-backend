require("dotenv").config();
const pool = require("../config/db");
const { AppError, UNAUTHORIZED, BAD_REQUEST } = require("../config/errorCodes");
const { toCamelCase } = require("../utilities/utilities");

const updateMatch = async (user, data) => {
    try {

        const { matchId, homeTeam, awayTeam } = data;
        const query = "SELECT league_id FROM teams WHERE id = $1";
        const values = [homeTeam.id];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            throw new AppError(BAD_REQUEST.TEAM_NOT_EXISTS, 404);
        }
        const leagueId = result.rows[0].league_id;
        

        const players = [...homeTeam.players, ...awayTeam.players];

        for (const player of players) {
            const { id, goals, shots, assists, saves, interceptions, yellowCards, redCard } = player;

            const insertQuery = `
                INSERT INTO user_stats (user_id, match_id, goals, shots, assists, saves, interceptions, yellow_card, red_card)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `;
            const insertValues = [id, matchId, goals, shots, assists, saves, interceptions, yellowCards, redCard];

            await pool.query(insertQuery, insertValues);
        }

        return leagueId;
    } catch (error) {
        throw error;
    }
};


module.exports = {
    updateMatch
};
