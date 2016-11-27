var express = require('express')
var MongoClient = require('mongodb').MongoClient
var validator = require('validator');
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

var addUrl = function(req, res, next) {
    res.json({
      "status": "Adding URL!"
    })
}

var findUrl = function (req, res, next) {
    res.json({
        "status": "Finding URL!"
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

app.get("/new/:id(*)", addUrl, function(req,res){
	res.end()
})

app.get('/:id', findUrl, function(req, res) {
    res.end()
})

app.get("*", function(req, res) { // 404
  res.end("404!"); // 404
})

app.listen(port, function () {
  console.log('Whoami app listening on port ' + port + '!')
})