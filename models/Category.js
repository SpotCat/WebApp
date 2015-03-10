var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var categorySchema = new Schema({
    categoryName: String,
    spotifyID: String,
    count: Number,
    type: String
});

module.exports = mongoose.model('Category', categorySchema);
