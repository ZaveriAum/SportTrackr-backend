const teamService = require('../services/teamService')

const createTeam = async (req, res, next) => {
    try{
        const url = await teamService.createTeam(req.user, req.body, req.file);
        res.status(201).json({
            url: url
        });
    }catch(e){
        next(e);
    }
}

const updateTeam = async(req,res,next)=>{
    const teamId = req.params.id
    try{
        const team = await teamService.updateTeam(req.user.email, req.body, req.file,teamId)
        res.status(200).json({
            message : "Team Updated Successfully",
            team: team
        });
    }
    catch(e){
        next(e);
    }
}

const getTeamsByLeagueId = async(req,res,next)=>{
    const leagueId = req.params.id;
    try{
        const teams = await teamService.getTeamsByLeagueId(leagueId)
        res.status(200).json({
            teams
        })
    }catch(e){
        next(e);
    }
}

const getTeamById = async(req,res,next)=>{
    const teamId = req.params.id
    
    try{
        const team = await teamService.getTeamById(teamId)
        res.status(200).json({
            team
        })
    }catch(e){
        next(e);
    }
}

const getTeamByLeagueOwner = async(req,res,next)=>{
    try{
        const teams = await teamService.getTeamByLeagueOwner(req.user.email)
        res.status(200).json({
            teams
        })
    }
    catch(e){
        next(e)
    }
}

const deleteTeam = async(req, res, next) => {
    try{
        await teamService.deleteTeam(req.user.email, req.user.teamId)
        res.status(204).json({});
    }catch(e){
        next(e);
    }
}

const getTeamPlayers = async(req,res,next)=>{
    const teamId = req.params.teamId
    try{
        const teamPlayers = await teamService.getTeamPlayers(teamId)
        res.status(200).json(teamPlayers)
    }catch(e){
        next(e);
    }
}
module.exports = {
    updateTeam,
    createTeam,
    getTeamsByLeagueId,
    getTeamById,
    getTeamByLeagueOwner,
    deleteTeam,
    getTeamPlayers
}