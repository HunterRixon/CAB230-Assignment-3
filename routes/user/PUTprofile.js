var express = require('express');
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");


/* GET movies data imdbID */
module.exports = function (req, res) { //Doesn't include the data from ratings or basics because I honestly couldn't tell you how to do it
    if (Object.keys(req.query).length > 0) {
        res.status(400).json({ "error": true, "message": `Invalid query parameters: ${req.query}. Query parameters are not permitted.` }) //make it so it can handle any query val tpye
    }
    else {
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const dob = req.body.dob;
        const address = req.body.address;

        if (!firstName || !lastName || !dob || !address) {
            res.status(400).json({
                "error": true,
                "message": "Request body incomplete: firstName, lastName, dob and address are required"
            })
        }

        else if (dob.length > 15) {
            res.status(400).json({
                "error": true,
                "message": "Invalid input: dob must be a real date in format YYYY-MM-DD"
            })
        }

        //else if (!(firstName instanceof String) || !(lastName instanceof String) || !(dob instanceof String) || !(address instanceof String)) { //This doesn't work...
        //    res.status(400).json({                                                                                                             
        //        error: true,
        //        message: "Request body invalid: firstName, lastName, dob and address must be strings only"
        //    })
        //}
        else if (req.email != req.params.email) { //Will check if the user is trying to update a profile which isn't theirs or doesn't have an authorization header
            res.status(403).json({
                "error": true,
                "message": "Forbidden"
            })
        }
        //Because I went word for word off the task sheet, I don't know how to do the date check without certain modules not listed on the task sheet. This is still mostly functional though
        else {
            const changes = {
                email: req.params.email,
                firstName: firstName,
                lastName: lastName,
                dob: dob,
                address: address
            }
            try {
                req.db("users")
                    .where('email', req.params.email)
                    .update({
                        firstName: firstName,
                        lastName: lastName,
                        dob: dob,
                        address: address
                    })
                    .then((output) => {
                        if (!(output === 0)) { //if the output (number of changed profiles) does not equal 0
                            console.log("Successfully updated " + output + " profiles.")
                            res.status(200).json( changes )
                        }
                        else if (output === 0) { //Just making sure this doesn't trigger both this and the catch, it has been for me when it was just else
                            res.status(404).json({
                                "error": true,
                                "message": "User not found"
                            })
                        }
                    })
            } catch (err) {
                res.status(500).json({ "error": true, "message": err.message })
            }

    }
    }
}
