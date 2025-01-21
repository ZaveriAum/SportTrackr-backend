require('dotenv').config();
const pool = require('../config/db');
const {AppError, UNAUTHORIZED} = require('../config/errorCodes')
const {uploadFile, deleteFile, getObjectSignedUrl} = require('./s3Service')

const getAllLeagues = async (user) => {
    try{
        let response = await pool.query('SELECT id, league_name, team_starter_size, price, max_team_size, game_amount, start_time, end_time, logo_url from leagues WHERE organizer_id = $1', [user.id]);
        let leagues = response.rows;
        await Promise.all(
            leagues.map(async (league) => {
                league.logo_url = await getObjectSignedUrl(league.logo_url);
                return league;
            })
        );
        return leagues;
    }catch(e){
        throw new AppError(`${e.message}` || "Unknow Error",e.statusCode || 500)
    }
}

const createLeague = async (user, data, file) => {
    try{
        if("owner" === user.roles[0]){
            const { leagueName, teamStarterSize, price, maxTeamSize, gameAmount, startTime, endTime } = data;
            
            let leagueLogoUrl = null;
            if (file) {
                leagueLogoUrl = await uploadFile(file.buffer, leagueName, file.mimetype, 'league-logos');
            }
            const values = [leagueName, user.id, teamStarterSize, price, maxTeamSize, gameAmount, startTime, endTime, leagueLogoUrl];
            const league = await pool.query('INSERT INTO public.leagues( league_name, organizer_id, team_starter_size, price, max_team_size, game_amount, start_time, end_time , logo_url) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;', values);
            return league.rows[0];
        }else{
            throw new AppError(`${UNAUTHORIZED.ACCESS_DENIED}`, 401)
        }
    }catch(e){
        throw new AppError(`${e.message}` || "Unknown Error",e.statusCode || 500)
    }
}

module.exports = {
    getAllLeagues,
    createLeague
}