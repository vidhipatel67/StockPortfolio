var express = require('express');
var app = express();

var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
};
app.use(allowCrossDomain);

app.get('/', function (req, res) {
    res.send('<html><body><h1>Server running!</h1></body></html>');
});

var server = app.listen(5000, function () {
    console.log('Node server is running..');
});

var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "nyse"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

app.get('/get', function (req, res) {
    var sql = "SELECT * FROM stocks";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log(result);
        console.log("All records fetched");
        res.send(result);
    });

});

app.get('/add', function (req, res) {
    console.log(req.query.symbol);
    var sql = "INSERT INTO stocks (Symbol, No_of_stocks) VALUES ('" + req.query.symbol + "', '" + req.query.stocks + "')";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
    });
    res.send('Record added!');
});

app.get('/remove', function (req, res) {
    console.log(req.query.symbol);
    var sql = "DELETE FROM stocks WHERE symbol='" + req.query.symbol + "'";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record deleted");
    });
    res.send('Record deleted!');
});