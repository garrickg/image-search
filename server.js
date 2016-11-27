var express = require('express')
var MongoClient = require('mongodb').MongoClient
var google = require('googleapis')
var moment = require('moment')
var customsearch = google.customsearch('v1')
var app = express()
var port = process.env.PORT || 3000
var options = {
  mongos: {
    ssl: false,
    sslValidate: false,
  }
}
var mongo = {
  db: null
}
var cx = "005468505843740252244:voiz2m3vdgm"

var search = function(req, res, next) {
    if (!req.params.id){
        res.json({
            "error": "No search string given"
        })
    }
    else {
        customsearch.cse.list({ cx: cx, q: req.params.id, auth: process.env.API_KEY, num: req.query.offset || 10, searchType: "image" }, function (err, resp) {
            if (err) {
                return console.log('An error occured', err)
            }
            if (resp.items && resp.items.length > 0) {
                res.json(resp.items.map(function(item, index, array) {
                    return {
                        "url": item.link,
                        "snippet": item.snippet,
                        "context": item.image.contextLink
                    }
                }))
            }
        })
        mongo.db.collection('img')
            .insert({
                "query": req.params.id,
                "date": moment().format()
            }, 
            function(err, data){
                if (err) {
                    return console.error("Error pushing to DB:", err);
                }
                data
            })
    }
}

var latest = function (req, res, next) {
    mongo.db.collection('img')
        .find()
        .limit(10)
        .sort({"date": -1})
        .toArray(function(err, data){
            if (err) {
                return console.error("Error pushing to DB:", err);
            }
            res.json(data.map(function(item, index, array) {
                return {
                    "query": item.query,
                    "date": item.date
                }
            }))
        })
}

MongoClient.connect(process.env.MONGOLAB_URI, options, function(err, db) {  //  Start DB connection
  if (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
  mongo.db = db;
})

app.use(express.static(__dirname + '/public'));
app.set('views', (__dirname + '/public'))
app.set('view engine', 'pug')

app.get('/', function(req, res) { // Serves up homepage
    var url = req.protocol + "://" + req.get('host')
    res.render('index', {url: url})
})

app.get("/imagesearch/:id(*)", search, function(req, res){})

app.get("/latest", latest, function(req, res){})

app.get("*", function(req, res) { // 404
  res.end("404!"); // 404
})

app.listen(port, function () {
  console.log('Image search app listening on port ' + port + '!')
})