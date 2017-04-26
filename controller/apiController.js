var FBAnimals = require('../models/FBAnimal');
var bodyParser = require('body-parser');

module.exports = function(app) {
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    
    app.get('/api/fbanimals/', function(req, res) {
        
        FBAnimals.find({ }, function(err, fbanimals) {
            if (err) throw err;
            res.send(fbanimals);
        });
        
    });
    
  
    
}