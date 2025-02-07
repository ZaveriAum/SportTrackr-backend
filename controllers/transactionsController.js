const transactionService = require('../services/transactionService')

const getTransactionsForLeagueOwner = async (req, res, next)=>{
    try{
        const transactions = await transactionService.getTransactionsForLeagueOwner(req.user.email);
        res.status(200).json({
            transactions : transactions
        })
    }catch(e){
        next(e);
    }
}

module.exports = {
    getTransactionsForLeagueOwner
}