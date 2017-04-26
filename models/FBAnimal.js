var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var animalInfoSchema = new Schema({
    fbid: String,
    message: String,
    picture: String,
    created_time: String,
    kind: String,
    group: String
});

var AnimalInfos = mongoose.model('AnimalInfos', animalInfoSchema);

module.exports = AnimalInfos;