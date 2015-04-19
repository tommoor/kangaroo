var express = require('express');
var exphbs  = require('express-handlebars');
var http  = require('http');
var app = express();
var session = require('express-session');
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var appHost = process.env.ENVIRONMENT == 'development' ? 'http://localhost:5000' : 'http://www.stumblemeer.com';
var Twitter = require('twitter');

// oauth
passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: appHost + '/auth/twitter/callback'
  },
  function(token, tokenSecret, profile, done) {
    done(null, {
      access_token: token,
      access_token_secret: tokenSecret,
      profile: profile
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, {
    access_token: user.access_token,
    access_token_secret: user.access_token_secret,
    id: user.profile.id,
    username: user.profile.username
  });
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// config
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.set('port', (process.env.PORT || 5000));

// middleware
app.use(express.static('public'));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET
}));
app.use(passport.initialize());
app.use(passport.session());
  
// routes
app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback', passport.authenticate('twitter', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

app.get('/', function(request, response) {
  if (request.user) {
    response.render('home');
  } else {
    response.render('signin');
  }
});

app.get('/live', function(request, response) {

  var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: request.user.access_token,
    access_token_secret: request.user.access_token_secret
  });
  
  client.get('search/tweets', {q: 'LIVE NOW mrk.tv'}, function(error, data, res){

     var total = data.statuses.length;
     var stream = Math.floor(Math.random()*data.statuses.length);
     var tweet = data.statuses[stream];
     var urls = tweet.entities.urls;
     var first_url = urls[0];
     
     // expand the mrk.tv url into the full path
     http.get(first_url.expanded_url, function(res){
       
       // extract the stream id
       var location = res.headers.location;
       var location_parts = location.split('/');
       var stream_id = location_parts[location_parts.length-1];
       
       // send it back to the client
       response.send({
         service: 'meerkat',
         stream_id: stream_id,
         tweet: tweet
       });
     });
  });
});

// start
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
