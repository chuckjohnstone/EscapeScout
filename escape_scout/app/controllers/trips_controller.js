var locomotive = require('locomotive')
  , Controller = locomotive.Controller;

var TripsController = new Controller();

TripsController.index = function() {
  this.render();
}

TripsController.create = function() {
	this.place = this.param('place');
	this.days = this.param('days');
}

module.exports = TripsController;