require('dotenv').config();
const jwt = require("jsonwebtoken");

// a middleware to validate Bearer token sent by the frontend
verifyToken = async (req, res, next) => {
    let token = req.headers["authorization"];

    if (!token) {
        return res.status(403).send({
            message: "No token provided."
        });
    }

    // we need to parse Bearer token if it is not null
    token = token.split("Bearer ")[1];

    jwt.verify(token,
        process.env.JWT_SECRET,
        (err, decoded) => {
            if (err) {
                return res.status(401).send({
                    message: "Unauthorized",
                });
            }
            req.userId = decoded.id;
            next();
        });
};

module.exports = verifyToken;