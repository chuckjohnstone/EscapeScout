var locomotive = require('locomotive')
  , Controller = locomotive.Controller;

var TripsController = new Controller();

TripsController.index = function() {
  this.render();
}

module.exports = TripsController;