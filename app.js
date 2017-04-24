var graph = require('fbgraph');
var AnimalInfos = require('./models/FBAnimal');
var config = require('./config');
var mongoose = require('mongoose');
var date = require('./getDate')

graph.setAccessToken('1895036317378531|tNIdJgaRP_R-bGWsoupso2H4urc');


mongoose.Promise = global.Promise;
mongoose.connect('mongodb://vanness:123456@ds117311.mlab.com:17311/fbanimal');
craw("478420402277061/feed?fields=message,picture,created_time")


function craw(url) {
var isNeedCraw = true
var nextPage = ''
graph.get(url, function(err, res) {
  var  FBanimals = res.data; 
  for (i=0 ; i< FBanimals.length ; i++ ){
    var FBanimal = FBanimals[i] ;
    if (FBanimal['message'] == undefined) { continue }
    if (!(FBanimal['message'].indexOf('領養') >= 0 || FBanimal['message'].indexOf('送養') >= 0 || FBanimal['message'].indexOf('認養') >= 0))   {
        continue;
    };
  console.log(FBanimal); 
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
     if (i == FBanimals.length-1) {
       nextPage = checkNull(res.paging.next)  
       console.log(nextPage)
       createDate = new Date(newFBAnimal.created_time)
       console.log(createDate)
       console.log(date.sevenDayAgo)
       console.log(+createDate)
       console.log(+date.sevenDayAgo)

       if (+createDate < +date.sevenDayAgo) {
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
