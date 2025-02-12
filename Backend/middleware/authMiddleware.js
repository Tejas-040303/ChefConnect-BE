const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    // Get auth header
    const authHeader = req.header("Authorization");
    
    // Check if token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ 
            success: false,
            message: "Access denied. No token provided or invalid format" 
        });
    }

    try {
        // Extract the token (remove "Bearer " prefix)
        const token = authHeader.split(" ")[1];
        
        // Verify token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        // Handle specific JWT errors
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token has expired"
            });
        }
        
        return res.status(403).json({
            success: false,
            message: "Invalid token"
        });
    }
};