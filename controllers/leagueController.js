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

const getLeague = async (req, res, next) => {
    try {
        const leagueId = req.params.id;
        const league = await leagueService.getLeague(leagueId); 
        
        if (!league) {
            return res.status(404).json({ message: "League not found" });
        }
        
        res.status(200).json({ league });
    } catch (e) {
        next(e);
    }
};

const createLeague = async (req, res, next) => {
    try{
        const league = await leagueService.createLeague(req.user, req.body, req.file);
        res.status(201).json({
            message : "League Created Successfully",
            league: league
        });
    }catch(e){
        next(e);
    }
}

module.exports = {
    getAllLeagues,
    getLeague,
    createLeague
}