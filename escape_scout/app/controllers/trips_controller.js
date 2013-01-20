var locomotive = require('locomotive')
  , Controller = locomotive.Controller;

var TripsController = new Controller();
var db = new EscapeDB();
var h = new Helpers();
var passport = require('passport');
var moment = require('moment');
var Mixpanel = require('mixpanel');
var mixpanel = Mixpanel.init('f71451f7fecbfee2d1ce280e6595461f'); 

passport.deserializeUser(function(id, done) {
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

    var self = this;

	this.place = this.param('place');
	this.days = this.param('days');
	this.date = new Date(this.param('date'));
	
	var owner = db.Types.ObjectId(this.req.user._id.toString())
	var Bitly = require('bitly');
	var bitly = new Bitly('chuckjohnstone', 'R_24b4e55ac0caa2828cc45d18fd35419e');

	var trip = new db.Trip({
		owner: this.req.user,
		startDate: this.date,
		place: this.param('place')
	});

	trip.save();

	for (var i=0;i<parseInt(this.days);i++){
		var day = new db.Day({owner: owner, trip: trip._id, day: i+1, date: moment(trip.startDate).add('d', i).format(), location: this.place});
		day.save();
		trip.days.push(day);
		moment(trip.startDate).subtract('d', i);
	}
	trip.save();

	mixpanel.track("Trip Created", {
	    distinct_id: this.req.user._id,
	    location: trip.place,
	    start_date: new Date(trip.startDate).toISOString(),
	    number_of_days: this.days
	});
	mixpanel.people.increment(this.req.user._id, "trips");


	//We need to offload this function and run it as a job after the trip is created. This is just temporary.
	bitly.shorten('http://escapescout.com/trips/' + trip._id + "/1/", function(err, response) {
  		if (err) throw err;

  		console.log(response);
  		trip.shortUrl = response.data.url;
  		trip.save();
  		return self.res.redirect('trips/' + trip._id + "/1");

	});

	

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
		if ("trip.owner._id" == self.user._id){
			self.owner = true;
		}
		self.day = self.trip.days[parseInt(self.param('day')) - 1];
		self.day.adjustedDate = moment(self.day.date).format('dddd, MMM Do');
		console.log(self.day.adjustedDate);
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

    	mixpanel.track("Idea Submitted", {
	    	distinct_id: self.req.user._id,
	    	type: idea.type
		});
		if (idea.type == "general"){
			mixpanel.people.increment(self.req.user._id, "ideas");
		}
		else {
			mixpanel.people.increment(self.req.user._id, "lodging_ideas");
		}

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
    	day.ideas.forEach(function(idea){
    		if (idea._id == self.param('idea')){
    			idea.comments.push(comment);	
    		}
    	});
    	
    	day.save();

    	mixpanel.track("Comment Posted", {
	    	distinct_id: self.req.user._id,
		});
		mixpanel.people.increment(self.req.user._id, "comments");

    	return self.res.redirect('trips/' + self.param('id') + "/" + day.day);
    });

}

TripsController.trackSharing = function(){
		mixpanel.track("Trip Shared", {
	    	distinct_id: this.req.user._id,
	    	share_type: this.param('type')
		});	
		mixpanel.people.increment(this.req.user._id, "trips_shared");
}

module.exports = TripsController;