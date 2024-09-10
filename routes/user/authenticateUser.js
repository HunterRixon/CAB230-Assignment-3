const jwt = require('jsonwebtoken');
module.exports = function (req, res, next) {
    if (!req.headers || !req.headers.authorization) { //If the token header is missing
        next(); //Return to the profile page without a req.email variable being passed.
        return
    }
    else if (!req.headers.authorization.match(/^Bearer /)) { //If the token header does exist, but there's no bearer token
        res.status(401).json({ 
            "error": true,
            "message": "Authorization header is malformed"
        })
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
                    console.log(err.message)
                    res.status(401).json({ "error": true, "message": "Invalid JWT token" });
                }
                return;
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
    } catch (e) {
        res.status(401).json({ "error": true, "message": "Invalid JWT token" });
        return;
    }
};
