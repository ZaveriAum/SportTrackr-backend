require('dotenv').config();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, AppError } = require('../config/errorCodes');
const mailService = require('./mailService');

// Helper function to find user by email
const findUser = async (email, verified) => {
    try {
        const result = await pool.query('SELECT id, first_name, last_name, email, password, verified FROM users WHERE email = $1 AND verified = $2', [email, verified]);
        return result;
    } catch (error) {
        throw new Error('Connection error');
    }
}

const findUserRoles = async(email) =>{
    try{
        const result = await pool.query('SELECT r.role_name FROM user_roles ur JOIN roles r ON ur.role_id = r.id JOIN users u on u.id = ur.user_id WHERE u.email=$1', [email]);
        const roleNames = result.rows.map(row => row.role_name);
        return roleNames
    }catch(error){
        throw new Error('Connection error');
    }
}

// Function to generate access and refresh tokens
const generateTokens = async (user) => {
    const roles = await findUserRoles(user.email)
    const payload = {
        id: user.id,
        email: user.email,
        roles: roles
    };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
}

// Function to register a new user
const register = async (body) => {
    const { firstName, lastName, email, password, confirmPassword } = body;

    // Check if passwords match
    if (password !== confirmPassword) {
        throw new AppError(BAD_REQUEST.PASSWORD_MISMATCH, 400);
    }

    try{
        // Check if user already exists and is verified
        const existing_user = await findUser(email, false);
        if (existing_user.rows[0] && existing_user.rows.length >= 2) {
            console.log("In here")
            throw new AppError(BAD_REQUEST.USER_EXISTS, 400);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        const user = await pool.query('INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name, email', [firstName, lastName, email, hashedPassword]);
        // Generate email verification token
        const token = jwt.sign({ id: user.rows[0].id }, process.env.EMAIL_TOKEN_SECRET, { expiresIn: '5m' });

        // Send verification email
        mailService.sendVerificationEmail(user.rows[0].email, token);

        return generateTokens(user.rows[0]);
    }catch(e){
        throw new AppError(`${e.message}` || 'Registration failed', e.statusCode || 500)
    }
}

// Function to login a user
const login = async (body) => {
    const { email, password } = body;
    const user = (await findUser(email, true)).rows[0];
    try{
        if (user) {
            // Check if user is verified
            if (!user.verified) {
                throw new AppError(UNAUTHORIZED.INVALIDATE , 400);
            }

            // Compare passwords
            const isMatch = await bcrypt.compare(password, user.password);
            
            if (!isMatch) {
                throw new AppError(UNAUTHORIZED.INVALID_CREDENTIALS, 400);
            }

            return generateTokens(user);
        } else {
            throw new AppError(BAD_REQUEST.USER_NOT_EXISTS, 400);
        }
    }catch(e){
        throw new AppError(`${e.message}` || 'Login failed', e.statusCode || 500)
    }
}

// Function to refresh access token
const refresh = async (cookies) => {
    
    
    if (!cookies?.jwt) {
        throw new Error(FORBIDDEN.FORBIDDEN);
    }
    
    try {
        const refreshToken = cookies.jwt;
        const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = (await findUser(decode.email, true)).rows[0];
        const roles = await findUserRoles(decode.email);

        if (!user) {
            throw new AppError(UNAUTHORIZED.UNAUTHORIZED, 401);
        }

        return {token:jwt.sign({ id: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' }),roles}
    } catch (e) {
        throw new AppError(`${e.message}` || UNAUTHORIZED.UNAUTHORIZED, e.statusCode || 401);
    }
}

// Function to confirm email verification
const confirmation = async (token) => {
    try {
        const decode = jwt.verify(token, process.env.EMAIL_TOKEN_SECRET);
        
        if (decode.exp < Date.now() / 1000) {
            throw new AppError('Email token has expired', 401);
        }
        await pool.query('UPDATE users SET verified = true WHERE id = $1', [decode.id]);
        await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [decode.id, 1]);
        const result = await pool.query('SELECT first_name, last_name, email FROM users WHERE id = $1', [decode.id]);
        mailService.sendWelcomeEmail(result.rows[0].email, `${result.rows[0].first_name} ${result.rows[0].last_name}`);
        
    } catch (e) {
        if (e.name === 'TokenExpiredError') {
            throw new AppError('Email token has expired', 401);
        }
        throw new AppError(`${e.message}` || 'An error occurred', e.statusCode || 500);
    }
};

const forgotPassword = async (email) => {
    // Find the user by email
    const user = (await findUser(email, true)).rows[0];

    try{
        if (user) {
            // Generate a reset token with a short expiration time
            const resetToken = jwt.sign({ id: user.id }, process.env.RESET_PASSWORD_TOKEN_SECRET, { expiresIn: '5m' });
    
            // Send the reset password email with the token
            await mailService.sendResetPasswordEmail(user.email, resetToken);
        } else {
            // User not found, throw a bad request error
            throw new Error(BAD_REQUEST.USER_NOT_EXISTS);
        }
    }catch(e){
        throw new AppError(`${e.message}` || `${BAD_REQUEST.EMAIL_NOT_SEND}`, e.statusCode || 500)
    }
    
}

const resetPassword = async (resetToken, body) =>{

    const { new_password, confirmPassword } = body;

    try{
        // Check if passwords match
        if (new_password !== confirmPassword) {
            throw new Error(BAD_REQUEST.PASSWORD_MISMATCH);
        }

        // Verify the reset token
        const decode = jwt.verify(resetToken, process.env.RESET_PASSWORD_TOKEN_SECRET);
        const id = decode.id;
        
        // Hash password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update the password in the database
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);
    }catch(e){
        throw new AppError(`${e.message}` || `${BAD_REQUEST.UNABLE_TO_RESET}`, e.statusCode || 500)
    }
}

module.exports = {
    register,
    login,
    refresh,
    confirmation,
    forgotPassword,
    resetPassword,
    findUserRoles
}
