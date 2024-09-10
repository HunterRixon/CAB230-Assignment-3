const jwt = require('jsonwebtoken');
module.exports = function (req, res, next) {
    if (!("authorization" in req.headers)
        || !req.headers.authorization.match(/^Bearer /) //If the token header is missing
    ) {
        res.status(401).json({ "error": true, "message": "Authorization header ('Bearer token') not found" });
        return;
    }
    const token = req.headers.authorization.replace(/^Bearer /, "");
    try {
        jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    res.status(401).json({ "error": true, "message": "JWT token has expired" });
                }
                else {
                    res.status(401).json({ "error": true, "message": "Invalid JWT token" });
                }
            }
            else {
                req.email = decoded.email;
                const queryUsers = req.db
                    .from("users")
                    .select("email")
                    .where("email", "=", req.email)
                queryUsers
                    .then((users) => {
                        // If email doesn't exist, meaning this is a fake bearer token, return an error
                        if (users.length == 0) {
                            res.status(403).json({
                                "error": true,
                                "message": "Forbidden",
                            })
                            return
                        }
                    })
                next();
                return;
            }
        })
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            res.status(401).json({ "error": true, "message": "JWT token has expired" });
        }
        else {
            console.log(err.message)
            res.status(401).json({ "error": true, "message": "Invalid JWT token" });
        }
        return;
    }
    
};
