const jwt = require("jsonwebtoken");
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
                if (err) return res.status(403).json({ message: 'Forbidden' })
                req.user = {
                    id: decoded.id,
                    email: decoded.email,
                    roles: decoded.roles,
                    teamId:decoded.teamId
                }
                
                next()
            }
        )
    }
    catch (err) {
        return res.status(401).json({ message: "User is not authorized" });
    }
}

module.exports = authenticateToken
