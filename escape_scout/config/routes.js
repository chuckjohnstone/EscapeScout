// Draw routes.  Locomotive's router provides expressive syntax for drawing
// routes, including support for resourceful routes, namespaces, and nesting.
// MVC routes can be mapped mapped to controllers using convenient
// `controller#action` shorthand.  Standard middleware in the form of
// `function(req, res, next)` is also fully supported.  Consult the Locomotive
// Guide on [routing](http://locomotivejs.org/guide/routing.html) for additional
// information.
module.exports = function routes() {
	this.root('pages#main');

	this.match('/about' ,"pages#about");
	this.match('/contact', "pages#contact");

	this.match('auth/facebook/callback', { controller: 'auth', action: 'fbCallback' });
	this.match('auth/facebook', { controller: 'auth', action: 'facebook' });

	this.match('auth/twitter/callback', { controller: 'auth', action: 'twitterCallback' });
	this.match('auth/twitter', { controller: 'auth', action: 'twitter' });

	this.match('auth/register', {controller: 'auth', action: 'register'});
	this.match('auth/create', {controller: 'auth', action: 'create', via: "POST"});
	this.match('auth/login', {controller: 'auth', action:'login', via: 'POST'});



	this.resources('trips');
	this.resources('agent');

	
	this.match('analytics/track-sharing', 'trips#trackSharing');
	this.match('trips/:id/:day', { controller: 'trips', action: 'showDay' });
	this.match('trips/:id/:day', {controller: 'trips', action: 'idea', via: "POST"});
	this.match('trips/:id/:day/:idea', {controller: 'trips', action: 'comment', via: "POST"});

}
