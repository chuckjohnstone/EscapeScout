var locomotive = require('locomotive')
  , Controller = locomotive.Controller;

var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;

var db = new EscapeDB();
var fs = require('fs');

passport.serializeUser(function(user, done) {
	console.log("SERIALIZE", user._id)
  done(null, user._id);
});


passport.use(new FacebookStrategy({
    clientID: "392465224163061",
    clientSecret: "4b0d122cbeaa55e10d9c39a72d9f9835",
    callbackURL: "http://escapescout.com/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
   	process.nextTick(function () {
	      var query = db.User.findOne({ 'fbId': profile.id });
		  console.log(profile);
	      query.exec(function (err, oldUser) {
	        if(oldUser) {
	          console.log('User: ' + oldUser.firstName + ' found and logged in!');
	          done(null, oldUser);
	        } else {
	          var newUser = new db.User();
	          newUser.fbId = profile.id;
			  newUser.username = profile.username;
	          newUser.firstName = profile.name.givenName;
			  newUser.lastName = profile.name.familyName;
	          newUser.email = profile.emails[0].value;
			  newUser.picture = "http://graph.facebook.com/"+ profile.username +"/picture";

	          newUser.save(function(err) {
	            if(err) {throw err;}
	            console.log('New user: ' + newUser.firstName + ' created and logged in!');
	            done(null, newUser);
	          }); 
	        }
	      });
	    });
  }
));

var AuthController = new Controller();

AuthController.facebook = function() {
  console.log("Authenticating...");
  passport.authenticate('facebook', { scope: ['email', 'publish_stream'] })(this.__req, this.__res, this.__next);
}

AuthController.fbCallback = function(){
	var self = this;
	passport.authenticate('facebook', function(err, user, info){
		// This is the default destination upon successful login.
	    var redirectUrl = '/agent';

	    if (err) { return self.next(err); }
	    if (!user) { return self.res.redirect('/'); }

	    // If we have previously stored a redirectUrl, use that, 
	    // otherwise, use the default.
	    if (self.req.session.redirectUrl) {
	      redirectUrl = self.req.session.redirectUrl;
	      self.req.session.redirectUrl = null;
	    }
	    self.req.logIn(user, function(err){
	      if (err) { return self.next(err); }
	    });
	    self.res.redirect(redirectUrl);

	})(this.__req, this.__res, this.__next);;
}

module.exports = AuthController;