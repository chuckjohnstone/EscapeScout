var locomotive = require('locomotive')
  , Controller = locomotive.Controller;

var PagesController = new Controller();

PagesController.main = function() {
  this.render({error: this.req.flash('error')});
}

PagesController.about = function() {
	this.render();
}

PagesController.contact = function(){
	this.render();
}
    
PagesController.login = function() {
    this.render();
}
module.exports = PagesController;
