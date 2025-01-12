const jwt = require("jsonwebtoken")
require('dotenv').config()

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "User unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    try {
        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET,
            (err, decoded) => {
                if (err) return res.status(403).json({ status: false, message: 'Forbidden' })
                console.log(decoded)
                req.user = {
                    id: decoded.id,
                    email: decoded.email
                }
                next()
            }
        )
    }
    catch (err) {
        return res.status(401).json({ message: "User is not authorized" });
    }
}

module.exports = {
    authenticateToken
}