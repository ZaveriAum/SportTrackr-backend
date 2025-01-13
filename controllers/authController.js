const authService = require('../services/authService')

const register = async (req, res) => {
    try{
        const response = await authService.register(req.body);
        res.cookie("jwt", response.refreshToken, {
            httpOnly: true,
            domain: undefined,
            secure: true,
            sameSite: "None",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        });
        res.status(201).json({
            token: response.accessToken
        })
    }catch(e){
        res.status(400).json({
            message: e.message || 'Registration failed. Please try again'
        });
    }
}

const login = async (req, res) => {
    try{
        const response = await authService.login(req.body);
        res.cookie("jwt", response.refreshToken, {
            httpOnly: true,
            domain: undefined,
            secure: true,
            sameSite: "None",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        });
        res.status(200).json({
            token: response.accessToken
        })
    }catch(e){
        res.status(401).json({
            message: e.message || 'Login failed. Please try again'
        })
    }
}

const refresh = async (req, res) => {
    const accessToken = await authService.refresh(req.cookies)
    try{
        res.status(200).json({
            token: accessToken
        })
    }catch(e){
        res.status(e.statusCode || 401).json({
            message: e.message || 'Unuathorized'
        })
    }
}

const confirmation = async (req, res)=>{
    try{
        const token = req.params.token
        authService.confirmation(token)
        res.status(200).json({
        })
    }catch(e){
        res.status(401).json({
            message: e.message || 'Unknown'
        })
    }
}

const forgotPassword = async (req, res) => {
    try{
        await authService.forgotPassword(req.body.email);
        res.status(200).json({
            status: true,
        })
    }catch(e){
        res.status(500).json({
            status: false,
            message: e.message || 'Unknown'
        })
    }
}

const resetPassword = async (req, res) => {
    try{
        
        await authService.resetPassword(req.params.token, req.body);
        res.status(200).json({
            status: true,
        })
    }catch(e){
        res.status(500).json({
            status: false,
            message: e.message || 'Unknown'
        })
    }
}

const logout = async (req, res) => {
    try{
        const cookies = req.cookies
        if (!cookies?.jwt) return res.status(204)
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
        res.status(204).json({
        })
    }catch(e){
        res.status(401).json({
            message: e.message || 'Unuathorized'
        })
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