var express = require('express');
var sys = require('util');
var oauth = require('oauth');

var app = express();

var _twitterConsumerKey = process.env.TWITTER_CKEY;
var _twitterConsumerSecret = process.env.TWITTER_CSECRET;

function consumer() {
    return new oauth.OAuth(
        "https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token",
        _twitterConsumerKey, _twitterConsumerSecret, "1.0A", "http://localhost:3000/sessions/callback", "HMAC-SHA1");
}

    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.session({ secret: "secretkey" }));


/*app.dynamicHelpers({
    session: function(req, res){
        return req.session;
    }
});
*/

app.get('/', function(req, res){
    res.send('Hello World');
});

app.get('/sessions/connect', function(req, res){
    consumer().getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
        if (error) {
            res.send("Error getting OAuth request token : " + sys.inspect(error), 500);
        } else {
            req.session.oauthRequestToken = oauthToken;
            req.session.oauthRequestTokenSecret = oauthTokenSecret;
            res.redirect("https://twitter.com/oauth/authorize?oauth_token="+req.session.oauthRequestToken);
        }
    });
});

app.get('/sessions/callback', function(req, res){
    sys.puts(">>"+req.session.oauthRequestToken);
    sys.puts(">>"+req.session.oauthRequestTokenSecret);
    sys.puts(">>"+req.query.oauth_verifier);
    consumer().getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
        if (error) {
            res.send("Error getting OAuth access token : " + sys.inspect(error) + "["+oauthAccessToken+"]"+ "["+oauthAccessTokenSecret+"]"+ "["+sys.inspect(results)+"]", 500);
        } else {
            req.session.oauthAccessToken = oauthAccessToken;
            req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
            // Right here is where we would write out some nice user stuff
            consumer().get("https://api.twitter.com/1/account/verify_credentials.json", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
                if (error) {
                    res.send("Error getting twitter screen name : " + sys.inspect(error), 500);
                } else {
                    console.log("data is %j", data);
                    data = JSON.parse(data);
                    req.session.twitterScreenName = data["screen_name"];
                    res.send('You are signed in: ' + req.session.twitterScreenName)
                }
            });
        }
    });
});

app.listen(3000);