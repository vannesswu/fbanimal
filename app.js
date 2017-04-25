var graph = require('fbgraph');
var AnimalInfos = require('./models/FBAnimal');
var express = require('express')
var app = express()
var config = require('./config');
var mongoose = require('mongoose');
var date = require('./getDate')
var fbGroup = require('./fbgroup')
var schedule = require('node-schedule');
graph.setAccessToken('1895036317378531|tNIdJgaRP_R-bGWsoupso2H4urc');

console.log('ya~~~~~~```')
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://vanness:123456@ds117311.mlab.com:17311/fbanimal');
var rule = new schedule.RecurrenceRule();
rule.hour = 14
rule.minute = 12
//var j = schedule.scheduleJob(rule, function(){
 // dailySearch()
//  dailyDelete()
//})
//dailySearch()
//dailyDelete()
function dailySearch() {
       var searchIndex = 0
       for (var group in fbGroup.fbDict) {
           const url = group + '/feed?fields=message,picture,created_time'
           console.log(url)
           setTimeout(function() { craw(url) }, 1000*30*searchIndex)
           searchIndex++
       }
}

function dailyDelete(){
    var deletedDate = date.sevenDayAgo.toISOString().slice(0,10)
    AnimalInfos.find({ created_time: deletedDate }, function(err, AnimalInfos) {
            if (err) throw err;
            for (i=0 ; i<  AnimalInfos.length ; i++) {
         //       console.log(AnimalInfos[i])
                AnimalInfos[i].remove({}, function(err,removed) {
                    console.log(removed)
                 });
            }
        });
}



function craw(url) {
var isNeedCraw = true
var skipFlag = false
var nextPage = ''
var created_time_string = ''
var created_time = new Date()
console.log(url)
graph.get(url, function(err, res) {
  var  FBanimals = res.data; 
  for (i=0 ; i< FBanimals.length ; i++ ){
    var FBanimal = FBanimals[i] ;
    if (FBanimal['message'] == undefined) { skipFlag = true } else { skipFlag = false }
    if (!skipFlag) { 
        if ((FBanimal['message'].indexOf('領養') >= 0 || FBanimal['message'].indexOf('送養') >= 0 || FBanimal['message'].indexOf('認養') >= 0)
                  ||  FBanimal['message'].indexOf('養狗') >= 0 || FBanimal['message'].indexOf('養貓') >= 0 || FBanimal['message'].indexOf('找家') >= 0     )   {
             console.log(FBanimal); 
            created_time_string = checkNull(FBanimal['created_time']).split('T')[0]
            created_time = new Date(created_time_string)
          if (+created_time > +date.twoDayAgo) {
    
             var newFBAnimal = AnimalInfos({
              fbid: checkNull(FBanimal['id']),
              message: checkNull(FBanimal['message']),
              picture: checkNull(FBanimal['picture']),
              created_time: checkNull(FBanimal['created_time']).split('T')[0],
              kind: checkKind(checkNull(FBanimal['message']))
           });
           newFBAnimal.save(function(err) {
               if (err) throw err;     
           });
            }
       }
    }
     if (i == FBanimals.length-1) {
       nextPage = checkNull(res.paging.next)  
       console.log(nextPage)
       console.log(FBanimal['created_time'])
       created_time = new Date(FBanimal['created_time'].split('T')[0])

       if (+created_time < +date.twoDayAgo) {
           isNeedCraw = false
       }
       if (isNeedCraw && nextPage != 'nil') {
      console.log("here")
      craw(nextPage)
          } 
     }   
    }; //for loop
    
  }); //graph.get
  

}

function checkNull(key) {
   if (key) {
       return key;
   } else {
       return 'nil'
   }
}
function checkKind(message) {
    if (message.indexOf("狗") >= 0 && message.indexOf("貓") >= 0 ) {
        return "狗 或 貓"
    } else if ( message.indexOf("狗") >= 0 || message.indexOf("犬") >= 0 ) {
        return "狗"
   } else if ( message.indexOf("貓") >= 0) {
        return "貓"
    } else {
        return "未分類"
    }

}

app.get('/', function(req, res) {
         res.send('Hello World')
   //    dailySearch()
        
    });  
app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});