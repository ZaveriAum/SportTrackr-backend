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

const getLeagueNamesByOwner = async (req,res,next)=>{
    try{
        res.status(200).json(await leagueService.getLeagueNamesByOwner(req.user.email))
    }
    catch(e){
        next(e);
    }
}

const getLeagueNamesByStatistician = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.userId, 10); // Convert to integer
        if (isNaN(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const leagues = await leagueService.getLeagueNamesByStatistician(userId);
        res.status(200).json(leagues);
    } catch (e) {
        next(e);
    }
};

const getLeagueStats = async(req,res,next)=>{
    try{
        res.status(200).json(await leagueService.getLeagueStats(req.user.teamId))
    }
    catch(e){
        next(e);
    }   
}

const getLeaguePointsTable = async (req, res, next) => {
    try{
        const pointsTable = await leagueService.getLeaguePointsTable(req.params.leagueId);
        res.status(200).json({
            pointsTable
        });
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
    getLeagueNamesByOwner,
    getLeagueNamesByStatistician,
    getLeaguePointsTable,
    getLeagueStats,
    getLeaguePointsTable
}