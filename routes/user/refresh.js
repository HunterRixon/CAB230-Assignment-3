var express = require('express');
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const JWT_SECRET = process.env.JWT_SECRET

module.exports = function (req, res) {
    const token = req.body.refreshToken

    //Verify body
    if (!token) {
        res.status(400).json({
            "error": true,
            "message": "Request body incomplete, refresh token required"
        })
        return
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
            console.log(err)
            if (err) {
                if (err.name === "TokenExpiredError") {
                    res.status(401).json({ "error": true, "message": "JWT token has expired" });
                }
                else {
                    res.status(401).json({ "error": true, "message": "Invalid JWT token" });
                }
            }
            else {
                const queryLogout = req.db
                    .from("logout")
                    .select("*")
                    .where("token", "=", token)
                queryLogout
                    .then((tokens) => {
                        // IF these details already exist, return error response
                        if (tokens.length > 0) {
                            res.status(401).json({ "error": true, "message": "Invalid JWT token" })
                            return

                        }
                        else {
                            bearerexpires = 600;
                            refreshexpires = 86400;
                            const email = decoded.email

                            var expires_in = (Math.floor(Date.now() / 1000) + bearerexpires)
                            const bearerToken = jwt.sign(
                                {
                                    email,
                                    expires_in
                                },
                                JWT_SECRET
                            )

                            expires_in = (Math.floor(Date.now() / 1000) + refreshexpires)
                            const refreshToken = jwt.sign(
                                {
                                    email,
                                    expires_in
                                },
                                JWT_SECRET
                            )

                            res.status(200).json({
                                "bearerToken": { "token": bearerToken, token_type: "Bearer", "expires_in": bearerexpires },
                                "refreshToken": { "token": refreshToken, token_type: "Refresh", "expires_in": refreshexpires }
                            })
                        }

                    })
            }
        })
    } catch (e) {
        res.status(500).json({ "error": true, "message": e.message });
        return;
    }
}
