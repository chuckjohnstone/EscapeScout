var locomotive = require('locomotive')
  , Controller = locomotive.Controller;

var TripsController = new Controller();
var db = new EscapeDB();
var passport = require('passport');

passport.deserializeUser(function(id, done) {
	console.log("FIND", id)
  db.User.findOne(id, function(err, user) {
    done(err, user);
  });
});

TripsController.index = function() {

  if (!this.req.isAuthenticated())
    return this.res.redirect("/");

  this.render();
}

TripsController.create = function() {
	this.place = this.param('place');
	this.days = this.param('days');
	this.date = new Date(this.param('date'));
	
	console.log(this.req.user._id);
	var owner = db.Types.ObjectId(this.req.user._id.toString())

	var trip = new db.Trip({
		owner: owner,
		startDate: this.date
	});

	for (var i=0;i<parseInt(this.days);i++){
		var tomorrow = new Date().setDate(this.date.getDate() + (i - 1));
		trip.days.push(new db.Day({owner: owner, day: i+1, date: tomorrow, place: this.place}));
	}

	trip.save();


	/*
	var newUser = new db.User();


	newUser.save(function(err) {
    	if(err) {throw err;}
    	console.log('New user: ' + newUser.firstName + ' created and logged in!');
    	done(null, newUser);
  	}); 
	*/

}

module.exports = TripsController;