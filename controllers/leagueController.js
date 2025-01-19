const leagueService = require('../services/leagueService')

const getAllLeagues = async (req, res, next) => {
    try{
        const leagues = await leagueService.getAllLeagues(req.user);
        res.status(200).json({
            leagues:leagues
        });
    }catch(e){
        next(e);
    }
}

const createLeague = async (req, res, next) => {
    try{
        console.log(req.user)
        const leagues = await leagueService.createLeague(req.user, req.body, req.file);
        res.status(201).json({
            message : "League Created Successfully"
        });
    }catch(e){
        next(e);
    }
}

module.exports = {
    getAllLeagues,
    createLeague
}