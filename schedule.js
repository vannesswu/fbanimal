var schedule = require('node-schedule');
var fbGroup = require('./fbgroup')
var FBAnimals = require('./models/FBAnimal');

var index = 0
var searchIndex = 0

var table = {}
table['1'] = '22'
table['2'] = '33'
delete table['1'] 
console.log(table)

FBAnimals.find({ }, function(err, fbanimals) {
            if (err) throw err;
             console.log('here')
           console.log(fbanimals[0]['fbid'])
         });
         
        
   