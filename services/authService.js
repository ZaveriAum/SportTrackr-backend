require('dotenv').config();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { BAD_REQUEST, UNAUTHORIZED, FORBIDDEN } = require('../config/errorCodes');
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

// Function to generate access and refresh tokens
const generateTokens = (user) => {
    const payload = {
        id: user.id,
        email: user.email
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
        throw new Error(BAD_REQUEST.PASSWORD_MISMATCH);
    }

    // Check if user already exists and is verified
    const existing_user = await findUser(email, false);
    if (existing_user.rows[0] && existing_user.rows.length >= 2) {
        throw new Error(BAD_REQUEST.USER_EXISTS);
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
}

// Function to login a user
const login = async (body) => {
    const { email, password } = body;
    const user = (await findUser(email, true)).rows[0];
    if (user) {
        // Check if user is verified
        if (!user.verified) {
            throw new Error(UNAUTHORIZED.INVALIDATE);
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            throw new Error(UNAUTHORIZED.INVALID_CREDENTIALS);
        }

        return generateTokens(user);
    } else {
        throw new Error(BAD_REQUEST.USER_NOT_EXISTS);
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

        if (!user) {
            throw new Error(UNAUTHORIZED.UNAUTHORIZED);
        }

        return jwt.sign({ id: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    } catch (error) {
        throw new Error(UNAUTHORIZED.UNAUTHORIZED);
    }
}

// Function to confirm email verification
const confirmation = async (token) => {
    try {
        const decode = jwt.verify(token, process.env.EMAIL_TOKEN_SECRET);
        // Update user's verified status to true
        await pool.query('UPDATE users SET verified = true WHERE id = $1', [decode.id]);
    } catch (error) {
        throw new Error('Email expried');
    }
}

const forgotPassword = async (email) => {
    // Find the user by email
    const user = (await findUser(email, true)).rows[0];

    if (user) {
        // Generate a reset token with a short expiration time
        const resetToken = jwt.sign({ id: user.id }, process.env.RESET_PASSWORD_TOKEN_SECRET, { expiresIn: '5m' });

        // Send the reset password email with the token
        await mailService.sendResetPasswordEmail(user.email, resetToken);
    } else {
        // User not found, throw a bad request error
        throw new Error(BAD_REQUEST.USER_NOT_EXISTS);
    }
}

const resetPassword = async (resetToken, body) =>{

    const { new_password, confirm_password } = body;

    // Check if passwords match
    if (new_password !== confirm_password) {
        throw new Error(BAD_REQUEST.PASSWORD_MISMATCH);
    }

    // Verify the reset token
    const decode = jwt.verify(resetToken, process.env.RESET_PASSWORD_TOKEN_SECRET);
    const id = decode.id;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update the password in the database
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);
}

module.exports = {
    register,
    login,
    refresh,
    confirmation,
    forgotPassword,
    resetPassword
}
