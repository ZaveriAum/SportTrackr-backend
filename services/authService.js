require('dotenv').config()

const pool = require('../config/db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { BAD_REQUEST, UNAUTHORIZED, FORBIDDEN } = require('../config/errorCodes')

const findUser = async(email) => {
    try {
        const result = await pool.query('SELECT id, first_name, last_name, email, password FROM users WHERE email = $1', [email]);
        return result.rows[0];
    } catch (error) {
        throw new Error('Database error');
    }
}

const generateTokens = (user) => {
    const payload = {
        id: user.id,
        email: user.email
    };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
}

const register = async(body) => {
    const {first_name, last_name, email, password, confirm_password} = body;

    if (password !== confirm_password)
        throw new Error(BAD_REQUEST.PASSWORD_MISMATCH);

    if(await findUser(email)){
        throw new Error(BAD_REQUEST.USER_EXISTS);
    }

    const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS) || 10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await pool.query('INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name, email', [first_name, last_name, email, hashedPassword]);
    
    return generateTokens(user.rows[0]);
}

const login = async(body) => {
    const { email, password } = body;
    const user = await findUser(email);
    if(user){
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch)
            throw new Error(UNAUTHORIZED.INVALID_CREDENTIALS);

        return generateTokens(user);
    }else{
        throw new Error(BAD_REQUEST.USER_NOT_EXISTS);
    }
}

const refresh = async (cookies) => {
    if (!cookies?.jwt) {
        throw new Error(FORBIDDEN.FORBIDDEN);
    }
    
    try {
        const refreshToken = cookies.jwt;
        const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await findUser(decode.email);

        if (!user) {
            throw new Error(UNAUTHORIZED.UNAUTHORIZED);
        }

        return jwt.sign({ id: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    } catch (error) {
        throw new Error(UNAUTHORIZED.UNAUTHORIZED);
    }
}

module.exports = {
    register,
    login,
    refresh,
}
