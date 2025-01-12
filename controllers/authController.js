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
            status: true,
            token: response.accessToken
        })
    }catch(e){
        res.status(400).json({
            status: false,
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
            status: true,
            token: response.accessToken
        })
    }catch(e){
        res.status(401).json({
            status: false,
            message: e.message || 'Login failed. Please try again'
        })
    }
}

const refresh = async (req, res) => {
    const accessToken = await authService.refresh(req.cookies)
    try{
        res.status(200).json({
            status: true,
            token: accessToken
        })
    }catch(e){
        res.status(e.statusCode || 401).json({
            status: false,
            message: e.message || 'Unuathorized'
        })
    }
}

const logout = async (req, res) => {
    try{
        const cookies = req.cookies
        if (!cookies?.jwt) return res.status(204)
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
        res.status(204).json({
            status: true,
        })
    }catch(e){
        res.status(401).json({
            status: false,
            message: e.message || 'Unuathorized'
        })
    }
}

module.exports = {
    register,
    login,
    refresh,
    logout,
}