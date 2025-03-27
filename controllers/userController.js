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

const getUserProfileMobile = async(req,res,next)=>{
    try{
        const id = req.params.id;
        const userProfile = await userService.getUserProfileMobile(id)
        res.status(200).json({
            userProfile
        })
    }
    catch(e){
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
        const profilePictureUrl = await userService.uploadProfilePhoto(req.user.email, req.file);
        res.status(200).json({
            profilePictureUrl: profilePictureUrl,
            message: "Profile Photo Added"
        })
    }catch(e){
        next(e)
    }
}
const getFilteredUsers = async (req, res, next) => {
    try {
      const { leagueId, teamId, name } = req.query;  
  
      const users = await userService.getFilteredUsers(req.user, leagueId, teamId, name);

      res.json(users);
    } catch (err) {
      next(err);
    }
  };
  
const toggleProfile = async (req, res, next) => {
    try{
        await userService.toggleProfile(req.user.email);
        res.status(200).json({
            message : "Visibility Changed Successfully"
        })
    }catch(e){
        next(e);
    }
}

module.exports = {
    getUserProfile,
    getUserProfileMobile,
    getUserById,
    updateUserProfile,
    updateUserPassword,
    uploadProfilePhoto,
    getFilteredUsers,
    toggleProfile
}