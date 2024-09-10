var express = require('express');
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")


/* GET movies search */
module.exports = function (req, res) {
    const year = req.query.year
    const title = req.query.title


    if (year) {
        req.db
            .distinct()
            .from("basics")
            .select("primaryTitle as title", "year", "tconst as imdbId", "imdbRating", "rottenTomatoesRating", "metacriticRating", "rated as classification")
            .where("year", "=", year)
            .limit(100)
            .then((data) => {
                //Check if year ONLY contains numbers
                if (year.match(/^[0-9]+$/)) {
                    if (data.length < 100) {
                        const pagination = {
                            "total": data.length,
                            "lastPage": Math.floor(data.length / 100),
                            "prevPage": null,
                            "nextPage": null,
                            "perPage": 100,
                            "currentPage": 1,
                            "from": 0,
                            "to": data.length
                        }
                        res.status(200).json({ "data": data, "pagination": pagination })
                    }
                    else {
                        const pagination = {
                            "total": data.length,
                            "lastPage": Math.floor(data.length / 100),
                            "prevPage": null,
                            "nextPage": 2,
                            "perPage": 100,
                            "currentPage": 1,
                            "from": 0,
                            "to": 100
                        }
                        //Check if year ONLY contains numbers
                        res.status(200).json({ "data": data, "pagination": pagination })
                    }
                }
                else {
                    res.status(400).json({
                        "error": true,
                        "message": "Invalid year format. Format must be yyyy."
                    })
                }
            })
        
    }
    else if (title) {
        req.db
            .distinct()
            .from("basics")
            .select("primaryTitle as title", "year", "tconst as imdbId", "imdbRating", "rottenTomatoesRating", "metacriticRating", "rated as classification")
            .where("primaryTitle", "like", `%${title}%`)
            .limit(100)
            .then((data) => {
                if (data.length <= 100) {
                    const pagination = {
                        "total": data.length,
                        "lastPage": Math.floor(data.length / 100) + 1,
                        "prevPage": null,
                        "nextPage": null,
                        "perPage": 100,
                        "currentPage": 1,
                        "from": 0,
                        "to": data.length
                    }
                    res.status(200).json({ "data": data, "pagination": pagination })
                }
                else {
                    const pagination = {
                        "total": data.length,
                        "lastPage": Math.floor(data.length / 100) + 1,
                        "prevPage": null,
                        "nextPage": 2,
                        "perPage": 100,
                        "currentPage": 1,
                        "from": 0,
                        "to": 100
                    }
                    //Check if year ONLY contains numbers
                    res.status(200).json({ "data": data, "pagination": pagination })
                }
            })

    }
    else { //If no year, just display everything
        req.db
            .distinct()
            .from("basics")
            .select("primaryTitle as title", "year", "tconst as imdbID", "imdbRating", "rottenTomatoesRating", "metacriticRating", "rated as classification")
            .limit(100)
            .then((data) => {
                const pagination = {
                    "total": 12184,
                    "lastPage": Math.floor(12184 / 100)+1,
                    "prevPage": null,
                    "nextPage": 2,
                    "perPage": 100,
                    "currentPage": 1,
                    "from": 0,
                    "to": 100
                }

                res.status(200).json({"data":data, "pagination":pagination })
            })
            .catch((error) => {
                res.status(404).json({ "error": true, "message": "Error during MySQL query"}) //CHANGE THIS
            })
    } 
}