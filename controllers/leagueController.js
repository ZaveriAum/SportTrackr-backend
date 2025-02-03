const leagueService = require('../services/leagueService')

const getAllLeagues = async (req, res, next) => {
    try{
        const leagues = await leagueService.getAllLeagues();
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
        const league = await leagueService.createLeague(req.user.email, req.user.roles, req.body, req.file);
        res.status(201).json({
            message : "League Created Successfully",
            league: league
        });
    }catch(e){
        next(e);
    }
}

const updateLeague = async (req, res, next) => {
    try{

        await leagueService.updateLeague(req.user, req.params.leagueId, req.body);
        res.status(201).json({
            message : "League Updated Successfully",
        });

    }catch(e){
        next(e);
    }
}

const uploadLeagueLogo = async (req, res, next) => {
    try{

        await leagueService.uploadLeagueLogo(req.user, req.file, req.params.leagueId);
        res.status(200).json({
            message : "League Logo Updated Successfully",
        });

    }catch(e){
        next(e);
    }
}

const deleteLeague = async (req, res, next) => {
    try{
        await leagueService.deleteLeague(req.user.email, req.user.roles, req.params.leagueId);
        res.status(200).json({
            message: "League Delete Successfully"
        })
    }catch(e){
        next(e);
    }
}

module.exports = {
    getAllLeagues,
    getLeague,
    createLeague,
    updateLeague,
    uploadLeagueLogo,
    deleteLeague,
}