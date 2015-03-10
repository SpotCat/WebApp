var express = require('express');
var app = express();
var router = require('./router');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');


app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use('/api', router);

app.get('/', function(req, resp) {
    resp.render('index.html');
});

mongoose.connect('mongodb://heroku_app34670059:urp9qn42jurrkbmtkm7oceucnt@ds053251.mongolab.com:53251/heroku_app34670059');

app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});
