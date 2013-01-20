var locomotive = require('locomotive')
  , Controller = locomotive.Controller;

var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy
  , LocalStrategy = require('passport-local').Strategy
  , TwitterStrategy = require('passport-twitter').Strategy;

var db = new EscapeDB();
var fs = require('fs');

var salt = "AbACabB";

passport.serializeUser(function(user, done) {
	console.log("SERIALIZE", user._id)
  done(null, user._id);
});


//Helper Methods
function encodePassword( pass ){
	var crypto = require('crypto');
	var shasum = crypto.createHash('sha1');
	shasum.update(pass);

	return shasum.digest('hex');
}


//Facebook Login
passport.use(new FacebookStrategy({
    clientID: "392465224163061",
    clientSecret: "4b0d122cbeaa55e10d9c39a72d9f9835",
    callbackURL: "http://escapescout.com/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
   		process.nextTick(function () {
		  var query = db.User.findOne({ service: 'facebook', serviceId: profile.id });
		  query.exec(function (err, oldUser) {
		    if(oldUser) {
		      done(null, oldUser);
		    } 
		    else {
		      var newUser = new db.User();
		      newUser.service = "facebook";
		      newUser.serviceId = profile.id;
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

//Twitter Login
passport.use(new TwitterStrategy({
    consumerKey: "CnlNcpQ5dqiQjiRnbwy5Yw",
    consumerSecret: "lh5ojNt4pwLJqDsqk1rfwWiJ1l3dF7uXAK6kjCjFY",
    callbackURL: "http://escapescout.com/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    process.nextTick(function () {
	  var query = db.User.findOne({ service: 'twitter', serviceId: profile.id });
	  query.exec(function (err, oldUser) {
	    if(oldUser) {
	      done(null, oldUser);
	    } 
	    else {
	      var newUser = new db.User();
	      newUser.service = "twitter";
	      newUser.serviceId = profile.id;
		  newUser.username = profile.username;
	      newUser.firstName = profile.displayName.split(" ")[0];
		  newUser.lastName = profile.displayName.split(" ")[1];
		  newUser.picture = "https://api.twitter.com/1/users/profile_image?screen_name=" + profile.username;

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

//Local Login
passport.use(new LocalStrategy(
  function(username, password, done) {
  	var query = db.User.findOne({ username: username });
    query.exec(function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'The username or password was incorrect.' });
      }
      if (encodePassword(password) != user.password) {
        return done(null, false, { message: 'The username or password was incorrect.' });
      }
      return done(null, user);
    });
  }
));


var AuthController = new Controller();

AuthController.facebook = function() {
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

	})(this.__req, this.__res, this.__next);
}

AuthController.twitter = function() {
  passport.authenticate('twitter')(this.__req, this.__res, this.__next);
}

AuthController.twitterCallback = function(){
	var self = this;
	passport.authenticate('twitter', function(err, user, info){
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

	})(this.__req, this.__res, this.__next);
}

AuthController.login = function() {
	var self = this;
	passport.authenticate('local', function(err, user, info){
		// This is the default destination upon successful login.
	    var redirectUrl = '/agent';

	    if (err) { return self.next(err); }
	    if (!user) { 
	    	self.req.flash('error', "The username or password was incorrect.");
	    	return self.res.redirect('/'); 
	    }

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

	})(this.__req, this.__res, this.__next);
};


AuthController.register = function() {
	this.render();
};

AuthController.create = function() {
	var self = this;

	var user = new db.User({
		firstName: this.param('firstName'),
		lastName: this.param('lastName'),
		username: this.param('email'),
		email: this.param('email'),
		picture: "/img/generic-user.png",
		password: encodePassword(this.param('password'))
	});

	user.save();
	this.res.redirect("/");
};

module.exports = AuthController;