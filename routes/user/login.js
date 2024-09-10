var express = require('express');
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const JWT_SECRET = process.env.JWT_SECRET

module.exports = function (req, res) {
    try {
        const email = req.body.email;
        const password = req.body.password;
        var bearerexpires = req.body.bearerExpiresInSeconds;
        var refreshexpires = req.body.refreshExpiresInSeconds;
        var invalid = false;

        //Verify body
        if (!email) {
            res.status(400).json({
                "error": true,
                "message": "Request body incomplete - email and password needed"
            })
        }
        else if (!password) {
            res.status(400).json({
                "error": true,
                "message": "Request body incomplete - email and password needed"
            })
        }
        else {
            if (!bearerexpires) { // If there is no bearer token expirey time in the body, that's fine, create one with default
                bearerexpires = 600;
            }
            else { //If there is a bearer token in the body, see if it will convert to integer. 
                try {
                    bearerexpires = parseInt(bearerexpires)
                }
                catch (error) { //If it fails, because the entry isn't valid or cannot be converted (is alphabetical or decimal) just set it to default
                    bearerexpires = 600;
                }
            }

            if (!refreshexpires) { // If there is no refresh token expirey time in the body, that's fine, create one with default
                refreshexpires = 86400;
            }
            else {
                try { //If there is a refresh token in the body, see if it will convert to integer.
                    refreshexpires = paseInt(refreshexpires)
                }
                catch (error) { //If it fails, because the entry isn't valid or cannot be converted (is alphabetical or decimal) just set it to default 
                    refreshexpires = 86400;
                }
            }

            // Determine if email exists in db
            const queryUsers = req.db
                .from("users")
                .select("email", "hash")
                .where("email", "=", `${email}`)
            queryUsers
                .then((rows) => {
                    // If email doesn't exist, return error response
                    if (rows.length > 0) {
                        //If email does exist, verify if password matches it
                        const gamer = rows[0]
                        return bcrypt.compare(password, gamer.hash)
                    }
                    else {
                        return false
                    }
                })
                .then((match) => {
                    //if the two passwords do not match, return error response
                    if (!match) {
                        invalid = true;
                        res.status(401).json({
                            "error": true,
                            "message": "Incorrect email or password",
                        })
                        return
                    }
                    var expires_in = (Math.floor(Date.now() / 1000) + bearerexpires)
                    const bearerToken = jwt.sign(
                        {
                            email,
                            expires_in
                        },
                        JWT_SECRET
                    )
                    var expires_in = (Math.floor(Date.now() / 1000) + refreshexpires)
                    const refreshToken = jwt.sign(
                        {
                            email,
                            expires_in
                        },
                        JWT_SECRET
                    )

                    res.json({
                        "bearerToken": { "token": bearerToken, token_type: "Bearer", "expires_in": bearerexpires },
                        "refreshToken": { "token": refreshToken, token_type: "Refresh", "expires_in": refreshexpires }
                    })
                })
            return
        }
    }
    catch (e) {
        res.status(500).json({
            error: true,
            message: e.message
        })
        console.log(e.message)
        return
    }

}
