const connectAccountService = require('../services/connectAccountService')

const createConnectAccountLink = async (req, res, next) => {
    try{
        const {url, accountId} = await connectAccountService.createConnectAccountLink();
        res.status(200).json({
            url: url,
            accountId: accountId
        })
    }catch(e){
        next(e)
    }
}

const accountAuthorizedWebhook = async (req, res, next) => {
    try{
        await connectAccountService.accountAuthorizedWebhook(req.body, req.body);
        res.status(200).json({})
    }catch(e){
        next(e);
    }
}

module.exports = {
    createConnectAccountLink,
    accountAuthorizedWebhook
}