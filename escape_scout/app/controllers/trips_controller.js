var locomotive = require('locomotive')
  , Controller = locomotive.Controller;

var TripsController = new Controller();
var db = new EscapeDB();
var h = new Helpers();
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
	if (!this.req.isAuthenticated())
    return this.res.redirect("/");

	this.place = this.param('place');
	this.days = this.param('days');
	this.date = new Date(this.param('date'));
	
	var owner = db.Types.ObjectId(this.req.user._id.toString())

	var trip = new db.Trip({
		owner: owner,
		startDate: this.date,
		place: this.param('place')
	});

	for (var i=0;i<parseInt(this.days);i++){
		var tomorrow = new Date().setDate(this.date.getDate() + (i - 1));
		trip.days.push(new db.Day({owner: owner, day: i+1, date: tomorrow, location: this.place}));
	}

	trip.save();


	return this.res.redirect('trips/' + trip._id + "/1");

}

TripsController.showDay = function() {
	if (!this.req.isAuthenticated())
    return this.res.redirect("/");

	var self = this;
	this.user = this.req.user;
	db.Trip.findById(this.param('id'), function (err, trip){
		self.trip = trip;
		self.day = self.trip.days[parseInt(self.param('day')) - 1];
		self.day.adjustedDate = h.date('l, M j', self.day.date);
		self.render('day');
	});


}

module.exports = TripsController;