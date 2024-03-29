// Draw routes.  Locomotive's router provides expressive syntax for drawing
// routes, including support for resourceful routes, namespaces, and nesting.
// MVC routes can be mapped mapped to controllers using convenient
// `controller#action` shorthand.  Standard middleware in the form of
// `function(req, res, next)` is also fully supported.  Consult the Locomotive
// Guide on [routing](http://locomotivejs.org/guide/routing.html) for additional
// information.
module.exports = function routes() {
	this.root('pages#main');
	this.match('auth/facebook/callback', { controller: 'auth', action: 'fbCallback' });
	this.match('auth/facebook', { controller: 'auth', action: 'facebook' });


	this.resources('trips');
	this.resources('agent');

	

	this.match('trips/:id/:day', { controller: 'trips', action: 'showDay' });
	this.match('trips/:id/:day', {controller: 'trips', action: 'idea', via: "POST"});
	this.match('trips/:id/:day/:idea', {controller: 'trips', action: 'comment', via: "POST"});

}
