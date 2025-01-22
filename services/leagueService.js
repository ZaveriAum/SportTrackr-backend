require('dotenv').config();
const pool = require('../config/db');
const {AppError, UNAUTHORIZED} = require('../config/errorCodes')
const {uploadFile, deleteFile, getObjectSignedUrl} = require('./s3Service')

const getAllLeagues = async (user) => {
    try{
            let response = await pool.query('SELECT id, league_name, team_starter_size, price, max_team_size, game_amount, start_time, end_time, logo_url from leagues');
            let leagues = response.rows;
            await Promise.all(
                leagues.map(async (league) => {
                    league.start_time = new Date(league.start_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
                    league.end_time = new Date(league.end_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    
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
        if(user.roles.includes('owner')){
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

const updateLeague = async(user, leagueId, body) => {
    try{

        const { leagueName, teamStarterSize, price, maxTeamSize, gameAmount, startTime, endTime } = body;

        // Check if league exists
        const league = await pool.query('Select league_name FROM leagues WHERE id = $1', [leagueId]);

        if(league.rows.length === 0){
            throw new AppError("League does not exists", 400)
        }

        const values = [leagueName, teamStarterSize, price, maxTeamSize, gameAmount, startTime, endTime, leagueId]

        await pool.query('UPDATE public.leagues SET league_name=$1, team_starter_size=$2, price=$3, max_team_size=$4, game_amount=$5, start_time=$6, end_time=$7  WHERE id = $8', [values])


    }catch(e){
        throw new AppError('Unable to update league', 400)
    }
    const { leagueName, teamStarterSize, price, maxTeamSize, gameAmount, startTime, endTime } = data;

}

module.exports = {
    getAllLeagues,
    createLeague,
    updateLeague
}