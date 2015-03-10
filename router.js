var express = require('express');
var router = express.Router();
var Category = require('./models/Category');

router
    .get('/getCategories', function(req, res) {
        Category.find(function(err, categories) {
            if(err) res.send(err);
            res.json(categories);
        })
    })

    .get('/getCategoriesById/:spotifyId', function(req, res) {
        var id = req.params.spotifyId;
        Category.find({spotifyID: id}, function(err, categories) {
            if(err) res.send(err);
            res.json(categories);
        })
    })

    .get('/getCategoriesByName/:name', function(req, res) {
        var name = req.body.name;
        Category.find({categoryName: name}, function(err, categories) {
            if(err) res.send(500);
            res.json(categories);
        })
    })

    .get('/getTopCategories', function(req, res) {
        Category.find({$query: {}, $orderby: {count: -1}}, function(err, categories) {
            if(err) res.send(err);
            res.json(categories);
        });
    })

    .post('/incrementCategoryCount', function(req, res) {
        var id = req.body.id;
        Category.update({_id: id}, { $inc: {count: 1}}, function(err) {
            if(err) res.send(err);
            res.sendStatus(200);
        });
    })

    .post('/createCategory', function(req, res) {
        var category = new Category();
        category.categoryName = req.body.name;
        category.spotifyID = req.body.id;
        category.type = req.body.type;
        category.count = 1;
        category.save();
        res.sendStatus(200);
    });

module.exports = router;
