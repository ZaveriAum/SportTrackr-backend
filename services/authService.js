require('dotenv').config();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, AppError } = require('../config/errorCodes');
const mailService = require('./mailService');

// Helper function to find user by email
const findUser = async (email) => {
    try {
        const result = await pool.query('SELECT id, first_name, last_name, email, password FROM users WHERE email = $1', [email]);
        return result;
    } catch (error) {
        throw new Error(error);
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

const findLeagueRoles = async(email) =>{
    try{
        const result = await pool.query('SELECT lr.role_name FROM users u JOIN league_emp le ON u.id = le.user_id JOIN employee_roles er ON le.id = er.employee_id JOIN league_roles lr ON er.role_id = lr.id WHERE u.email = $1', [email])
        if (result.rows.length > 0){
            console.log(result)
            const roleName = result.rows.map(role=> role.role_name)
            return roleName
        }
        return []
    }catch(e){
        throw new Error(e);
    }
}

// Function to generate access and refresh tokens
const generateTokens = async (user) => {
    const roles = await findUserRoles(user.email)
    const league_roles = await findLeagueRoles(user.email)
    const payload = {
        id: user.id,
        email: user.email,
        roles: [...roles, ...league_roles] 
    };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
}

// Function to register a new user
const register = async (body, token) => {

    try{

        const { firstName, lastName, password, confirmPassword } = body;

        // Check if passwords match
        if (password !== confirmPassword) {
            throw new AppError(BAD_REQUEST.PASSWORD_MISMATCH, 400);
        }

        const decode = jwt.verify(token, process.env.EMAIL_TOKEN_SECRET);

        // check if the email is verified
        if (!decode.verified)
            throw new AppError('Please verify your email before registration', 401)

        // Check if user already exists
        const existing_user = await findUser(decode.email);
        if (existing_user.rows[0]) {
            throw new AppError(BAD_REQUEST.USER_EXISTS, 400);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        const user = await pool.query('INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id', [firstName, lastName, decode.email, hashedPassword]);

        // Adding "user" role to first time users
        await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [user.rows[0].id, 1]);

        // Send welcome email
        mailService.sendWelcomeEmail(decode.email, firstName, lastName);

        return generateTokens(decode.email);
    }catch(e){
        throw new AppError(`${e.message}` || 'Registration failed', e.statusCode || 500)
    }
}

// Function to login a user
const login = async (body) => {
    const { email, password } = body;
    const user = (await findUser(email)).rows[0];
    try{
        if (user) {

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
    
    try {
        
        if (!cookies?.jwt) {
            throw new Error(FORBIDDEN.FORBIDDEN);
        }
    
        const refreshToken = cookies.jwt;
        const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = (await findUser(decode.email)).rows[0];
        const roles = await findUserRoles(decode.email);

        if (!user) {
            throw new AppError(UNAUTHORIZED.UNAUTHORIZED, 401);
        }

        return {token:jwt.sign({ id: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' }),roles}
    } catch (e) {
        throw new AppError(`${e.message}` || UNAUTHORIZED.UNAUTHORIZED, e.statusCode || 401);
    }
}

const verifyEmail = async (email)=>{
    try{
        const token = jwt.sign({ email: email, verified: true }, process.env.EMAIL_TOKEN_SECRET, { expiresIn: '30m' });

        // Send verification email
        mailService.sendVerificationEmail(email, token);
    }catch(e){
        throw new AppError(`${e.message}` || BAD_REQUEST.EMAIL_NOT_SEND, e.statusCode || 401)
    }
}

const forgotPassword = async (email) => {
    // Find the user by email
    const user = (await findUser(email)).rows[0];

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
    findLeagueRoles,
    register,
    login,
    refresh,
    verifyEmail,
    forgotPassword,
    resetPassword,
    findUserRoles
}
