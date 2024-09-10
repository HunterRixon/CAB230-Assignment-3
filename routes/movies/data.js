var express = require('express');
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")


/* GET movies data imdbID */
module.exports = function (req, res) { //Doesn't include the data from ratings or basics because I honestly couldn't tell you how to do it
    if (Object.keys(req.query).length > 0) {
        res.status(400).json({ "error": true, "message": `Invalid query parameters: ${req.query}. Query parameters are not permitted.` }) //make it so it can handle any query val tpye
    
    }
    else {
        const imdbID = req.params.imdbID
        if (imdbID) {
            req.db
                .from("principals")
                .select("nconst as id", "category", "name", "characters")
                .where("tconst", "=", `${imdbID}`)
                .limit(100)
                .then((rows) => {
                    //Check if year ONLY contains numbers
                    if (rows.length == 0) { //Check if there are any movies which meet criteria
                        res.status(404).json({
                            error: true,
                            message: "No record exists of a movie with this ID"
                        })
                    }
                    else {
                        req.db
                            .from("basics")
                            .select("primaryTitle as title", "year", "tconst", "imdbRating", "boxoffice", "poster", "plot")
                            .where("tconst", "=", `${imdbID}`)
                            .first()
                            .then((basics) => {
                                const final = {
                                    "title": basics.title, "year":basics.year, "imdbId": basics.tconst, "imdbRating": basics.imdbRating, "boxoffice":basics.poster, "plot":basics.plot, "principals": rows
                                }
                                res.json(final)
                            })
                    }
                })
                .catch((error) => {
                    console.error("Error fetching specific movie: + " + error)
                    res.status(500).json({
                        error: true,
                        message: "Please try again later or contact administration if error persists."
                    })
                })

        }
        else { //If no imdbId, display error
            res.status(400).json({ "error": true, "message": "You must supply an imdbID!" })
        }
    }
}
