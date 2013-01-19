var locomotive = require('locomotive')
  , Controller = locomotive.Controller;

var AgentController = new Controller();
var db = new EscapeDB();
var h = new Helpers();
var passport = require('passport');

passport.deserializeUser(function(id, done) {
	console.log("FIND", id)
  db.User.findById(id, function(err, user) {
    done(err, user);
  });
});

AgentController.index = function() {

	if (!this.req.isAuthenticated()){
		this.req.session.redirectUrl = this.req.url;
		return this.res.redirect("/");
    }

    var self = this;
	db.Trip.find({'owner._id': this.req.user._id}, function (err, trips){
		self.trips = trips;
		for (var i=0;i<self.trips.length;i++){
			self.trips[i].adjustedDate = h.date("F jS", self.trips[i].startDate)
		}
		self.render();
	});
}

module.exports = AgentController;