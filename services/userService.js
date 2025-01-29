const { body } = require('express-validator');
const pool = require('../config/db')
const DEFAULT_PROFILE_PICTURE='defualts/default_profile_photo.jpeg'
const {AppError, BAD_REQUEST} = require('../config/errorCodes')
const {getObjectSignedUrl, uploadFile, deleteFile} = require('./s3Service')
const bcrypt = require('bcrypt')

const getUserProfile = async (email) => { 

    try {
        const result = await pool.query('SELECT first_name, last_name, picture_url FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user) {
            throw new AppError(BAD_REQUEST.USER_NOT_EXISTS, 400)
        }

        const pictureUrl = user.picture_url
            ? await getObjectSignedUrl(user.picture_url)
            : await getObjectSignedUrl(DEFAULT_PROFILE_PICTURE);

        return {
            first_name: user.first_name,
            last_name: user.last_name,
            picture_url: pictureUrl,
        }
    } catch (e) {
        throw new AppError('Unknown Error', 500)
    }
};

const updateUserProfile = async (email, firstName, lastName) => {
    try{
        await pool.query(
            'UPDATE users SET first_name = $1, last_name = $2 WHERE email = $3',
            [firstName, lastName, email]
        );
    }catch(e){
        throw new AppError('Unable to update the profile', 400)
    }
}

const updateUserPassword = async (email, body) => {
    try{
        const {oldPassword, newPassword, newConfirmPassword} = body
        const result = await pool.query('SELECT password FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
            throw new AppError('Invalid old password', 400);
        }

        if (newPassword !== newConfirmPassword){
            throw new AppError(BAD_REQUEST.PASSWORD_MISMATCH, 401);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);

    }catch(e){
        throw new AppError(e.message || 'Unable to Change Password', e.statusCode || 401)
    }
}

const uploadProfilePhoto = async(email, file) => {
    try{
        if(!file){
            throw new AppError('No file uploaded', 400);
        }
        const user = await pool.query('SELECT picture_url FROM users WHERE email=$1', [email])

        const { buffer, originalname, mimetype } = file;

        const key = await uploadFile(buffer, originalname, mimetype, 'profile-photo');

        // If there is a picture url then delete the image from s3
        if(user.rows[0].picture_url){
            await deleteFile(user.rows[0].picture_url)
        }

        await pool.query('UPDATE users SET picture_url = $1 WHERE email = $2', [key, email]);

    }catch(e){
        throw new AppError(e.message || 'Unable to upload Profile Photo', e.statusCode || 400)
    }
}

module.exports = {
    getUserProfile,
    updateUserProfile,
    updateUserPassword,
    uploadProfilePhoto
}
