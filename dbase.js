
var mongo = require('mongodb').MongoClient
var url = process.env.MONGOLAB_URI // for accessing database

var dbName='voting'


function checkConnect(){
   mongo.connect(url, function (err, db) {
     if (err) { console.log('Unable to connect to the mongoDB server. Error:', err)   } 
     else {    console.log('Connection established to mongoDB')
               db.close()}
   
   })
}


function dbInsert(djson){
   mongo.connect(url, function (err, db) {
           if (err) { console.log('Unable to connect to the mongoDB server. Error:', err)   } 
           else {    console.log('Connection established to')
              var dbUrl=db.collection(dbName)
              var value=djson
                            
             
              console.log("value = "+JSON.stringify(value))

              // do some work here with the database.
           
             dbUrl.insert(value,
             function(err, data) {
                 if (err) { throw err }
                                 
                 db.close()
             })
           }  
     }) 
}

 //==== finding just one poll 
function dbFind(Res,a,poll){ 
   mongo.connect(url, function (err, db) {
           if (err) { console.log('Unable to connect to the mongoDB server. Error:', err)   } 
           else {    console.log('Connection established ')
                 var dbUrl=db.collection(dbName)
                 var sN={"title": poll}
                 var o=[],v=[]   

                 console.log(JSON.stringify(sN))

                 dbUrl.find(sN)
                 .toArray(function(err,dat){
                 if(err) throw err 
                 var i=dat.length-1,q
                 console.log(dat[0].title)
                 q=dat[0].options
                 console.log("number of options "+q.length)
                 for(i=0;i<q.length;++i)
                   { console.log( i+1 +". "+dat[0].options[i])
                     o.push(dat[0].options[i])
	             v.push(dat[0].votes[i])		 
                     console.log(dat[0].votes[i]) }
                 db.close()
                 Res.render('pdetail',{authenticated: a, id: poll, options: o, 
                             votes: v, qlength: q.length});  
                 })
                } 
   })

}

function dbGetTitles(Res,authenticated){ 
   mongo.connect(url, function (err, db) {
           if (err) { console.log('Unable to connect to the mongoDB server. Error:', err)   } 
           else {    console.log('Connection established to')
                 var dbUrl=db.collection(dbName)
                 var list=[]             
                 var data 
                 
                 
                 dbUrl.find()
                 .toArray(function(err,dat){
                 if(err) throw err 
                 for(var i=0;i<dat.length;++i)
                  {//console.log(dat[i].title)
                   list.push(dat[i].title)
                  }
                                
                 db.close()
                 Res.render('index.ejs',{authenticated: authenticated,list: list});
                 })
                }
                
   })

}

function dbGetPolls(){ 
   mongo.connect(url, function (err, db) {
           if (err) { console.log('Unable to connect to the mongoDB server. Error:', err)   } 
           else {    console.log('Connection established to')
                 var dbUrl=db.collection(dbName)
                 var list=[]             
                 var data 
                 
                 
                 dbUrl.find()
                 .toArray(function(err,dat){
                 if(err) throw err 
                 for(var i=0;i<dat.length;++i)
                  {//console.log(dat[i].title)
                   list.push(dat[i].title)
                  }
                                
                 db.close()
                 console.log("list returned to variable -- dbGetPolls exectued successfully")
                 return list
                 })
                }
                
   })

}

function dbDoVote(Res,a,poll,voted){
   mongo.connect(url, function (err, db) {
           if (err) { console.log('Unable to connect to the mongoDB server. Error:', err)   } 
           else {    console.log('Connection established ')
                 var dbUrl=db.collection(dbName)
                 var sN={"title": poll}
                 var v=[]   

                 if( isNaN(parseInt(voted)) )
                  {voted=0
                   console.log("voted set to 0")  }
                 else
                  {var vx=parseInt(voted)
                   console.log("voted = "+vx)}
                
                 dbUrl.find(sN)
                 .toArray(function(err,dat){
                 if(err) throw err 
                 var i=dat.length-1,q,x 
                 if(err) throw err 
                 var i,q
                 q=dat[0].options
                 for(i=0;i<q.length;++i)
                   {x=dat[0].votes[i]
                    if(x === undefined || isNaN(x))
                     {console.log("!!! undefined or NaN found")
                      x=0}  
                    v.push(x)
                    console.log("v[i] "+v[i])
                   }
                   v[vx]=v[vx]+1
                   console.log("changed voted = "+v[vx])
                   update()
                 })  
                 
                 
                 function update(){
                 dbUrl.findAndModify(sN,
                 [['_id','asc']], // sort order
                 {$set: {votes: v}}, // replaces only the field votes with voted
                 {},     
                 function(err, object) {
                    if (err){console.warn(err.message);} //returns error if no matching object 
                    else{console.log(object);
                         db.close()   
                         Res.send("thank you");
                        } 
                 })
                 }
                } 
   })
}   

function dbGetOwnTitles(Res,owner){ 
   mongo.connect(url, function (err, db) {
           if (err) { console.log('Unable to connect to the mongoDB server. Error:', err)   } 
           else {    console.log('Connection established to')
                 var dbUrl=db.collection(dbName)
                 var list=[]  
                 var sN={"owner": owner}           
                 var data 
                 
                 
                 dbUrl.find(sN)
                 .toArray(function(err,dat){
                 if(err) throw err 
                 for(var i=0;i<dat.length;++i)
                  {//console.log(dat[i].title)
                   list.push(dat[i].title)
                  }
                                
                 db.close()
                 Res.render('mypolls',{list: list, usign: owner});
                 })
                }
                
   })
 
}



module.exports=({checkConnect: checkConnect, dbFind: dbFind, dbInsert: dbInsert, 
                dbGetTitles: dbGetTitles, dbDoVote: dbDoVote, dbGetOwnTitles: dbGetOwnTitles });


