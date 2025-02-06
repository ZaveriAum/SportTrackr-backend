const userService = require('../services/userService')

const getUserProfile = async (req, res, next) => {
    try{
        const user_profile = await userService.getUserProfile(req.user.email);
        res.status(200).json({
            user: user_profile
        })
    }catch(e){
        next(e)
    }
}

const getUserById = async (req, res, next) => {
    try{
        const user = await userService.getUserById(req.params.id)
        res.status(200).json({
            user: user
        })
    }catch(e){
        next(e);
    }
}

const updateUserProfile = async(req, res, next) => {
    try{
        await userService.updateUserProfile(req.user.email, req.body.firstName, req.body.lastName);
        res.status(200).json({
            message: "Profile Updated"
        })
    }catch(e){
        next(e)
    }
}

const updateUserPassword = async(req, res, next) => {
    try{
        await userService.updateUserPassword(req.user.email, req.body);
        res.status(200).json({
            message: "Password updated"
        })
    }catch(e){
        next(e)
    }
}

const uploadProfilePhoto = async(req, res, next) => {
    try{
        await userService.uploadProfilePhoto(req.user.email, req.file);
        res.status(200).json({
            message: "Profile Photo Added"
        })
    }catch(e){
        next(e)
    }
}

module.exports = {
    getUserProfile,
    getUserById,
    updateUserProfile,
    updateUserPassword,
    uploadProfilePhoto
}