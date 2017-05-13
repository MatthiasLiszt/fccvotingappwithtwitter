var server=require('./server')
var indexlink=server.indexlink 


var dbase=require('./dbase')
var passport = require('passport')

var authenticated=false 
var token=0
var uname="nobody"
var verifier=0

var oll
var Res

//var usign = passport.userName
var usign 

module.exports = function(app, passport) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        Res=res
        dbase.dbGetTitles(res,authenticated)
        dbGetPolls()
        console.log('index.ejs')
        if(oll !== undefined){console.log(oll[0])}else{console.log('oll still undefined')}
        //res.render('index.ejs',{authenticated: authenticated,list: oll});
        //res.sendFile(indexlink)
      });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        authenticated=false
        req.logout();
        res.redirect('/');
    });

    // NEW POLL ==============================

    app.get('/newpoll',function(req,res){
        if(authenticated)
         {res.render('newpoll.ejs')}
        else 
         {res.render('index.ejs',{authenticated: authenticated,list: oll});
          //dbase.dbGetTitles(Res,authenticated)
         }  
    });

    app.get('/createpoll',function(req,res){
        console.log("poll created successfully");  
        console.log(req.query.newpolltitle);
        //console.log(req.query.newpolloptions);
        var polloptions,x=req.query.newpolloptions 
        var djson,votes=[],o
        polloptions=x.split('\n');
         
        for(var i=0;i<polloptions.length;++i)
         {//console.log(polloptions[i]);
          votes.push(0);
         }
        
        djson={ title: req.query.newpolltitle, options: polloptions, votes: votes, owner: usign } 
        console.log(JSON.stringify(djson))
        o=djson.votes[0]
        console.log(djson.title+" - "+djson.options[0])
        console.log("votes : "+ o.toString())
        dbase.checkConnect();
        dbase.dbInsert(djson);
        res.render('index.ejs',{authenticated: authenticated,list: oll});
        //dbase.dbGetTitles(Res,authenticated)   
    });

    // MY POLLS ==============================

    app.get('/mypolls',function(req,res){
        if(authenticated)
         {//res.render('mypolls.ejs',{usign: usign, list: oll})
          dbase.dbGetOwnTitles(res,usign)  
         }
        else 
         {res.send("you are not authenticated !");
         }  
    });

    // Poll Details ==========================

    app.get('/pdetail/:id',function(req,res){
        console.log("id = ",req.params.id);
        dbase.dbFind(res,authenticated,req.params.id);
        //res.render('pdetail',{authenticated: authenticated, id: req.params.id}); 
    }); 

    // After Vote ============================

    app.get('/vote/:id/:vote',function(req,res){
        var id=req.params.id, voted=parseInt(req.params.vote) 
        console.log("id = ",req.params.id);
        console.log("vote = ",voted);
        //res.send("thank you");
        //res.render('vote',{id: req.params.id, vote: req.params.vote }); 
        dbase.dbDoVote(res,authenticated,id,voted);  
    }); 

    // Pre Login Username =====================

    app.get('/login',function(req,res){res.render('login');})

    app.get('/username',function(req,res){
        usign = req.query.username;
        console.log("username = "+usign)
        res.redirect('/auth/twitter');

    }); 

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

        // handle the callback after twitter has authenticated the user
        
        /*   
        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/',
                failureFlash: true
            }));
        */

        app.get('/auth/twitter/callback',function(req,res){
            console.log('parameters')
            console.log('token = '+req.query.oauth_token)
            console.log('verifier = '+req.query.oauth_verifier)
            token = req.query.oauth_token
            verifier = req.query.oauth_verifier
            if(token){authenticated=true}  
            //res.render('profile.ejs',{ user: { twitter: { token : token }}} )  
            res.render('index.ejs',{token : token, authenticated: authenticated,list: oll})   
            //dbase.dbGetTitles(Res,authenticated) 
        });    
           



// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================


    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

        // handle the callback after twitter has authorized the user
        app.get('/connect/twitter/callback',
            passport.authorize('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));




// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future


    // twitter --------------------------------
    app.get('/unlink/twitter', isLoggedIn, function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });


};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

var mongo = require('mongodb').MongoClient
var url = process.env.MONGOLAB_URI // for accessing database

var dbName='voting'

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
                 oll=list
                 console.log("list set to variable -- dbGetPolls exectued successfully")
                 })
                }
                
   })

}

