const teamService = require('../services/teamService')

const createTeam = async (req, res, next) => {
    try{
        const team = await teamService.createTeam(req.user, req.body, req.file);
        res.status(201).json({
            message : "Team Created Successfully",
            team: team
        });
    }catch(e){
        next(e);
    }
}


module.exports = {

    createTeam
}