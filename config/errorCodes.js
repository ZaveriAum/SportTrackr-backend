const BAD_REQUEST = {
    PASSWORD_MISMATCH: 'Password and confirm password do not match. Please try again.',
    USER_EXISTS: 'User already exists',
    USER_NOT_EXISTS: 'User does not exist'
};

const UNAUTHORIZED = {
    INVALID_CREDENTIALS: 'Invalid Credentials',
    UNAUTHORIZED: 'Unauthorized'
};

const FORBIDDEN = {
    FORBIDDEN: 'Forbidden'
};

module.exports = {
    BAD_REQUEST,
    UNAUTHORIZED,
    FORBIDDEN
};
