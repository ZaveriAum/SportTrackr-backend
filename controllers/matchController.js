const matchService = require('../services/matchService')

const updateMatch = async (req, res, next) => {

    try{
        await matchService.updateMatch(req.user,req.body)
        res.status(200).json({
            message:"Match Updated Successfully"
        });
    }catch(e){
        next(e);
    }
}


module.exports = {
    updateMatch
}