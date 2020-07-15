var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");
app.listen(3000);
var bodyParser = require('body-parser');

var fs = require('fs')
var path = require('path')
var crypto = require('crypto');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var pg = require('pg');
var config = {
    user: 'postgres',
    database: 'bao',
    password: 'postgres',
    host: 'localhost',
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000,
}
var pool = new pg.Pool(config);


app.get("/trangtintuc/list", function(req, res) {
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack)
        }
        client.query('SELECT * FROM diemditich1_font_point ', (err, result) => {
            release()
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            // console.log(result.rows[0].ten_chu_ho);
            res.render("quantri_list.ejs", { danhsach: result });

        });
    });
});

app.get("/", function(req, res) {
    res.render("main");
})