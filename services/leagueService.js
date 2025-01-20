require('dotenv').config();
const pool = require('../config/db');
const {AppError, UNAUTHORIZED} = require('../config/errorCodes')
const {uploadFile, deleteFile, getObjectSignedUrl} = require('./s3Service')
const sharp = require('sharp')
const getAllLeagues = async (user) => {
    try{
        if("leagueOwner" === user.roles[0]){
            let response = await pool.query('SELECT league_name, team_starter_size, price, max_team_size, game_amount, current_season, logo_url from leagues WHERE organizer = $1', [user.id]);
            let leagues = response.rows;
            await Promise.all(
                leagues.map(async (league) => {
                    league.logo_url = await getObjectSignedUrl(league.logo_url);
                    return league;
                })
            );
            return leagues;
        }else{
            throw new AppError(`${UNAUTHORIZED.ACCESS_DENIED}`, 401)
        }
    }catch(e){
        throw new AppError(`${e.message}` || "Unknow Error",e.statusCode || 500)
    }
}

const createLeague = async (user, data, file) => {
    try{
        const { leagueName, teamStarterSize, price, maxTeamSize, gameAmount, currentSeason } = data;
        
        let leagueLogoUrl = null;
        if (file) {
        const fileBuffer = await sharp(file.buffer)
            .resize({ height: 1080, width: 1080, fit: "contain" })
            .toBuffer();
            leagueLogoUrl = await uploadFile(fileBuffer, leagueName, file.mimetype);
        }
        const values = [leagueName, user.id, teamStarterSize, price, maxTeamSize, gameAmount, currentSeason, leagueLogoUrl];
        const league = await pool.query('INSERT INTO public.leagues( league_name, organizer, team_starter_size, price, max_team_size, game_amount, current_season, logo_url) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;', values);
        return league.rows[0];
    }catch(e){
        throw new AppError(`${e.message}` || "Unknown Error",e.statusCode || 500)
    }
}

module.exports = {
    getAllLeagues,
    createLeague
}