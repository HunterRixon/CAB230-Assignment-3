var express = require('express');
var router = express.Router();
const authenticate = require("./authenticate");

/* GET people listing */
//router.get('/', function (req, res, next) {
//    res.send('respond with a resource');
//});

/* GET people */
router.get("/:id", authenticate, (req, res) => {
    if (Object.keys(req.query).length > 0) {
        res.status(400).json({
            "error": true,
            "message": `Invalid query parameters: ${req.query}. Query parameters are not permitted.` //make it so it can handle any query val tpye
        })
    }
    else {
        const id = req.params.id
        if (id) {
            req.db
                .from('names')
                .rightJoin('principals', 'names.nconst','principals.nconst')
                .where('principals.nconst', '=', id)
                .select('names.primaryName', 'names.birthYear', 'names.deathYear','principals.movieName',"principals.nconst","principals.category","principals.characters")
                .first()
                .then((rows) => {
                    const roles = [{
                        "movieName": rows.movieName,
                        "movieId": rows.nconst,
                        "category": rows.category,
                        "characters": [rows.characters],
                        "imdbRating":null
                    }]
                    res.status(200).json({"name":rows.primaryName, "birthYear":rows.birthYear, "deathYear":rows.deathYear, "roles": roles})
                })
                .catch((error) => {
                    console.error("Error fetching specific person: " + error)
                    res.status(500).json({
                        "error": true,
                        "message": "Please try again later or contact administration if error persists."
                    })
                })
        }
        else {
            res.status(400).json({ "error": true, "message": "You must supply an id!" })
        }
    }
})

module.exports = router;
