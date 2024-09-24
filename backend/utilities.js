const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Extract the token from "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: true, message: "No token provided, access denied." });
    }

    jwt.verify(token, process.env.ACESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: true, message: "Invalid or expired token." });
        }

        req.user = user; // Attach decoded token payload to req.user
        next(); // Proceed to the next middleware or route handler
    });
}

module.exports = {
    authenticateToken,
};
