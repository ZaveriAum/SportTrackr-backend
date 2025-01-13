const BAD_REQUEST = {
    PASSWORD_MISMATCH: 'Password and confirm password do not match. Please try again.',
    USER_EXISTS: 'User already exists',
    USER_NOT_EXISTS: 'User does not exist',
    EMAIL_NOT_SEND: 'Unable to send email',
    UNABLE_TO_RESET: 'Unable to resent password'
};

const UNAUTHORIZED = {
    INVALID_CREDENTIALS: 'Invalid Credentials',
    INVALIDATE: 'User not verified',
    UNAUTHORIZED: 'Unauthorized',
};

const FORBIDDEN = {
    FORBIDDEN: 'Forbidden'
};

class AppError extends Error {
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = {
    BAD_REQUEST,
    UNAUTHORIZED,
    FORBIDDEN,
    AppError
};
