var locomotive = require('locomotive')
  , Controller = locomotive.Controller;

var PagesController = new Controller();

PagesController.main = function() {
  this.render({error: this.req.flash('error')});
}

module.exports = PagesController;
