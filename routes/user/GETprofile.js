var express = require('express');
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");


/* GET movies data imdbID */
module.exports = function (req, res) { //Doesn't include the data from ratings or basics because I honestly couldn't tell you how to do it
    if (Object.keys(req.query).length > 0) {
        res.status(400).json({ "error": true, "message": `Invalid query parameters: ${req.query}. Query parameters are not permitted.` }) //make it so it can handle any query val tpye
    }
    else {
        if (req.email != req.params.email) { //If either there is no bearer token (req.email doesn't exist), or the emails between tokens do not match, send this
            req.db
                .from("users")
                .select("email", "firstName", "lastName")
                .where("email", "=", `${req.params.email}`)
                .then((rows) => {
                    if (rows.length > 0) {
                        res.status(200).json(rows)
                    }
                    else {
                        res.status(404).json({
                            "error": true,
                            "message": "User not found"
                        })
                    }
                })
                .catch((error) => {
                    console.error("Error fetching specific user: " + error)
                    res.status(500).json({
                        "error": true,
                        "message": "Please try again later or contact administration if error persists."
                    })
                })
        }
        else {
            req.db
                .from("users")
                .select("email", "firstName", "lastName", "dob", "address")
                .where("email", "=", req.params.email)
                .then((rows) => {
                    if (rows.length > 0) {
                        res.status(200).json(rows)
                    }
                    else {
                        res.status(404).json({
                            "error": true,
                            "message": "User not found"
                        })
                    }
                })
                .catch((error) => {
                    console.error("Error fetching specific user: " + error)
                    res.status(500).json({
                        "error": true,
                        "message": "Please try again later or contact administration if error persists."
                    })
                })
        }
    }
}
