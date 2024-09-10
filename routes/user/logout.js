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
        return;
    }
    else if (token.length > 200) {
        res.status(401).json({ "error": true, "message": "Invalid JWT token" });
        return;
    }
    else {
        try {
            jwt.verify(token, process.env.JWT_SECRET, function (err) { //
                if (err) {
                    if (err.name === "TokenExpiredError") {
                        res.status(401).json({ "error": true, "message": "JWT token has expired" });
                    }
                    else {
                        console.log(err.message)
                        res.status(401).json({ "error": true, "message": "Invalid JWT token" });
                    }
                }
                else {
                    const queryLogout = req.db
                        .from("logout")
                        .select("*")
                        .where("token", "=", token) //I don't want two of the same token in the db. This would cause an error...
                    queryLogout
                        .then((tokens) => {
                            // IF these details already exist, return error response
                            if (tokens.length > 0) {
                                res.status(401).json({ "error": true, "message": "Invalid JWT token" })
                                return
                            }
                            else {
                                return req.db.from("logout").insert({ token }) //I KNOW THIS IS UNSAFE, I DID THIS LAST MINUTE
                            }
                        })
                        .then(() => {
                            res.status(200).json({
                                "error": false,
                                "message": "Token successfully invalidated"
                            })
                        })
                }
            })
        }
        catch (err) {
            res.status(500).json({ "error": true, "message": err.message });
            console.log(err)
        }
        
    }
}