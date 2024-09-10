var express = require('express');
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const JWT_SECRET = process.env.JWT_SECRET

module.exports = function (req, res) {
    const email = req.body.email
    const password = req.body.password

    // Verify body
    if (!email || !password) {
        res.status(400).json({
            "error": true,
            "message": "Request body incomplete - email and password needed"
        })
        return
    }

    // Determine if the email and password already exist in table
    const queryUsers = req.db
        .from("users")
        .select("email","hash")
        .where("email", "=", email)
    queryUsers
        .then((users) => {
            // IF these details already exist, return error response
            if (users.length > 0) {
                res.status(409).json({
                    "error": true,
                    "message": "User already exists",
                })
                return
            }
            else {
                // If the details do not exist, then insert into DB
                const saltRounds = 10;
                const hash = bcrypt.hashSync(password, saltRounds)

                return req.db.from("users").insert({ email, hash }) //Create a new user with null other values
            }
        })
        .then(() => {
            res.status(201).json({ "success": true, "message": "User created" })
        })
} 
