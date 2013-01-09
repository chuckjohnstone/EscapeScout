var locomotive = require('locomotive')
  , Controller = locomotive.Controller;

var TripsController = new Controller();
var db = new EscapeDB();

TripsController.index = function() {
  this.render();
}

TripsController.create = function() {
	this.place = this.param('place');
	this.days = this.param('days');
	this.date = this.param('date');

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