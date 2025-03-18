const connectAccountService = require('../services/connectAccountService')

const createConnectAccountLink = async (req, res, next) => {
    try{
        const {url, accountId} = await connectAccountService.createConnectAccountLink(req.user);
        res.status(200).json({
            url: url,
            accountId: accountId
        })
    }catch(e){
        next(e);
    }
}

const getExpressDashboard = async(req, res, next) => {
    try{
        const url = await connectAccountService.getExpressDashboard(req.user.email);
        res.status(200).json({
            url: url
        })
    }catch(e){
        next(e);
    }
}


module.exports = {
    createConnectAccountLink,
    getExpressDashboard
}