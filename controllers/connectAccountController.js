const connectAccountService = require('../services/connectAccountService')

const createConnectAccountLink = async (req, res, next) => {
    try{
        const {url, accountId} = await connectAccountService.createConnectAccountLink(req.user);
        res.status(200).json({
            url: url,
            accountId: accountId
        })
    }catch(e){
        next(e)
    }
}

module.exports = {
    createConnectAccountLink,
}