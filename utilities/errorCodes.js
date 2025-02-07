const BAD_REQUEST = {
    PASSWORD_MISMATCH: 'Password and confirm password do not match. Please try again.',
    USER_EXISTS: 'User already exists',
    USER_NOT_EXISTS: 'User does not exist',
    EMAIL_NOT_SEND: 'Unable to send email. Veryfiy the email',
    UNABLE_TO_RESET: 'Unable to resent password',
    UNABLE_TO_UPLOAD: 'Unable to upload',
    UNKNOWN_ERROR: 'Unknown Error',
    TEAM_NOT_EXISTS:"Team does not exist",
    MATCH_NOT_EXISTS:"Match does not exist"
};

const UNAUTHORIZED = {
    INVALID_CREDENTIALS: 'Invalid Credentials',
    INVALIDATE: 'User not verified',
    UNAUTHORIZED: 'Unauthorized',
    ACCESS_DENIED: 'Access Denied'
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
