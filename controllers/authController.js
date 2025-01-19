const authService = require('../services/authService')

const register = async (req, res, next) => {
    try{
        const response = await authService.register(req.body);
        const roles = await authService.findUserRoles(req.body.email)
        res.cookie("jwt", response.refreshToken, {
            httpOnly: true,
            domain: undefined,
            secure: true,
            sameSite: "None",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        });
        res.status(201).json({
            token: response.accessToken,
            roles
        })
    }catch(e){
        // Pass the error to the next middleware
        next(e);
    }
}

const login = async (req, res, next) => {
    try{
        const response = await authService.login(req.body);
        const roles = await authService.findUserRoles(req.body.email)
        res.cookie("jwt", response.refreshToken, {
            httpOnly: true,
            domain: undefined,
            secure: true,
            sameSite: "None",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        });
        res.status(200).json({
            token: response.accessToken,
            roles
        })
    }catch(e){
        // Pass the error to the next middleware
        next(e);
    }
}

const refresh = async (req, res, next) => {
    const refreshContent = await authService.refresh(req.cookies)
    
    try{
        res.status(200).json({
            token: refreshContent.token,
            roles:refreshContent.roles
        })
    }catch(e){
        // Pass the error to the next middleware
        next(e);
    }
}

const confirmation = async (req, res, next)=>{
    try{
        const token = req.params.token
        await authService.confirmation(token)
        res.status(200).json({
        })
    }catch(e){
        // Pass the error to the next middleware
        next(e);
    }
}

const forgotPassword = async (req, res, next) => {
    try{
        await authService.forgotPassword(req.body.email);
        res.status(200).json({
            status: true,
        })
    }catch(e){
        // Pass the error to the next middleware
        next(e);
    }
}

const resetPassword = async (req, res, next) => {
    try{
        
        await authService.resetPassword(req.params.token, req.body);
        res.status(200).json({
            status: true,
        })
    }catch(e){
        // Pass the error to the next middleware
        next(e);
    }
}

const logout = async (req, res, next) => {
    try{
        const cookies = req.cookies
        if (!cookies?.jwt) return res.status(204)
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
        res.status(204).json({
        })
    }catch(e){
        // Pass the error to the next middleware
        next(e);
    }
}

module.exports = {
    register,
    login,
    refresh,
    confirmation,
    forgotPassword,
    resetPassword,
    logout,
}