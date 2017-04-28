var graph = require('fbgraph');
var AnimalInfos = require('./models/FBAnimal');
var express = require('express')
var app = express()
var config = require('./config');
var mongoose = require('mongoose');
var date = require('./getDate')
var fbGroup = require('./fbgroup')
var schedule = require('node-schedule');
var apiController = require('./controller/apiController');
graph.setAccessToken('1895036317378531|tNIdJgaRP_R-bGWsoupso2H4urc');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://vanness:123456@ds117311.mlab.com:17311/fbanimal');
var rule = new schedule.RecurrenceRule();
rule.minute = 0
//rule.second = 0
var dailyHashTable = {}
var fbidTable = {}
console.log(new Date())
//dailySearch()
var j = schedule.scheduleJob(rule, function(){
 if(checkDaily()) {
     console.log('perform search')
// dailySearch()
// dailyDelete()
}
 
})
var fbindex = 0
function dailySearch() {
       var searchIndex = 0
       fbindex = 0
       for (var group in fbGroup.fbDict) {
           setTimeout(function() { craw(group,true) }, 1000*20*searchIndex)
           console.log(group)
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
                    delete fbidTable[AnimalInfos[i]['fbid']]
                    console.log(removed)
                 });
            }
        });
}


function craw(url,isUseGroup) {
var isNeedCraw = true
var writeFlag = false
var nextPage = ''
var created_time_string = ''
var created_time = new Date()
var picture = ''
var context = ''

if (isUseGroup) {
var fburl = fbGroup.fbArray[fbindex] + '/feed?fields=message,picture,created_time,attachments'
} else {
    var fburl = url
}
console.log(fburl)
graph.get(fburl, function(err, res) {
  var  FBanimals = res.data; 
  for (i=0 ; i< FBanimals.length ; i++ ){
    var FBanimal = FBanimals[i] ;
    

    if (!(FBanimal['message'] == undefined)) {
         if (checkQualified(FBanimal['message']))  {
       //     writeFlag = true 
           if (fbidTable[FBanimal['fbid']] == undefined) {
            fbidTable[FBanimal['fbid']] = true
            writeFlag = true
           }
            // picture = checkNull(FBanimal['picture'])
            // context = checkNull(FBanimal['message'])
    } else { 
        writeFlag = false 
      }
    } else {
        writeFlag = false 
     } 
     
      if (writeFlag) {
          console.log(FBanimal)
            created_time_string = checkNull(FBanimal['created_time']).split('T')[0]
            created_time = new Date(created_time_string) 
          if (+created_time > +date.twoDayAgo) {
             var newFBAnimal = AnimalInfos({
              fbid: checkNull(FBanimal['id']),
              message: checkNull(FBanimal['message']),
              picture: checkNull(FBanimal['picture']),
              created_time: checkNull(FBanimal['created_time']).split('T')[0],
              kind: checkKind(checkNull(FBanimal['message'])),
              group: fbGroup.fbDict[fbGroup.fbArray[fbindex]]
           });
           newFBAnimal.save(function(err) {
               if (err) throw err;     
           });
            }
         }

       
    
     if (i == FBanimals.length-1) {
       nextPage = checkNull(res.paging.next)  
       console.log(nextPage)
       console.log(FBanimal['created_time'])
       console.log(date.twoDayAgo)
       created_time = new Date(FBanimal['created_time'].split('T')[0])

       if (+created_time < +date.twoDayAgo) {
           isNeedCraw = false
           fbindex++
       }
       if (isNeedCraw && nextPage != 'nil') {
      console.log("here")
      craw(nextPage,false)
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

function checkQualified(message) {

if (message.indexOf('領養') >= 0 || message.indexOf('送養') >= 0 || message.indexOf('認養') >= 0 ||  
    message.indexOf('養狗') >= 0 || message.indexOf('養貓') >= 0 || message.indexOf('找家') >= 0 ||
    message.indexOf('棄養') >= 0 || message.indexOf('流浪') >= 0 || message.indexOf('中途') >= 0 ||
    message.indexOf('浪浪') >= 0) {
   return true
  } else {
    return false
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

function  checkDaily() {
    
  if (dailyHashTable[date.today.toISOString().slice(0,10)] == undefined ) {
    dailyHashTable[date.today.toISOString().slice(0,10)] = true
    console.log(dailyHashTable[date.today.toISOString().slice(0,10)])
    return true
  } else {
      return false
  }
}


apiController(app);
app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});