var locomotive = require('locomotive')
  , Controller = locomotive.Controller;

var TripsController = new Controller();
var db = new EscapeDB();
var h = new Helpers();
var passport = require('passport');

passport.deserializeUser(function(id, done) {
	console.log("FIND", id)
  db.User.findById(id, function(err, user) {
    done(err, user);
  });
});

TripsController.index = function() {

  if (!this.req.isAuthenticated())
    return this.res.redirect("/");

  this.render();
}

TripsController.create = function() {
	if (!this.req.isAuthenticated()){
		this.req.session.redirectUrl = this.req.url;
		return this.res.redirect("/");
    }

	this.place = this.param('place');
	this.days = this.param('days');
	this.date = new Date(this.param('date'));
	
	var owner = db.Types.ObjectId(this.req.user._id.toString())

	var trip = new db.Trip({
		owner: this.req.user,
		startDate: this.date,
		place: this.param('place')
	});

	trip.save();

	for (var i=0;i<parseInt(this.days);i++){
		var tomorrow = new Date().setDate(this.date.getDate() + (i - 1));
		var day = new db.Day({owner: owner, trip: trip._id, day: i+1, date: tomorrow, location: this.place});
		day.save();
		trip.days.push(day);
	}
	trip.save();

	


	return this.res.redirect('trips/' + trip._id + "/1");

}

TripsController.showDay = function() {
	if (!this.req.isAuthenticated()){
		this.req.session.redirectUrl = this.req.url;
		return this.res.redirect("/");
    }


	var self = this;
	this.user = this.req.user;

	db.Trip.findById(this.param('id')).populate('days').exec(function (err, trip){
		self.trip = trip;
		/*
		if (trip.owner._id == this.user._id){
			self.trip.isOwner = true;
		}
		else {
			self.trip.isOwner = false;
		}
		*/
		self.day = self.trip.days[parseInt(self.param('day')) - 1];
		self.day.adjustedDate = h.date('l, M j', self.day.date);
		self.render('day');
	});

}

TripsController.idea = function() {
	if (!this.req.isAuthenticated())
    return this.res.redirect("/");

	var self = this;
	
    var owner = db.Types.ObjectId(this.req.user._id.toString())
    this.user = this.req.user;

    db.Day.findById(this.param('day'), function (err, day){
    	var idea = new db.Idea({
    		//day: day._id,
    		owner: self.user,
    		text: self.param('idea'),
    		type: self.param('type'),

    	});
    	day.ideas.push(idea);
    	day.save();

    	return self.res.redirect('trips/' + self.param('id') + "/" + day.day);
    });
}

TripsController.comment = function() {
	if (!this.req.isAuthenticated())
    return this.res.redirect("/");

	var self = this;
	
    this.user = this.req.user;

    db.Day.findById(this.param('day'), function (err, day){
    	
    	var comment = new db.Comment({
    		owner: self.user,
    		text: self.param('comment'),

    	});
    	console.log("LOOPING");
    	day.ideas.forEach(function(idea){
    		if (idea._id == self.param('idea')){
    			idea.comments.push(comment);	
    		}
    	});
    	
    	day.save();

    	return self.res.redirect('trips/' + self.param('id') + "/" + day.day);
    });

}

module.exports = TripsController;