
module.exports = function(){
	var mongoose = require('mongoose');
	mongoose.connect('mongodb://127.0.0.1/escape_scout');
	/* models */
	EscapeDB = function(){

	var Schema = mongoose.Schema;

	var User = new Schema({
		fbId : {type: String, required: true},
		picture: { type: String},
		username: {type: String},
		firstName : {type: String},
		lastName : {type: String},
		email : {type: String}
	});


	var Comment = new Schema({
		owner : { type: Schema.Types.ObjectId, required: true},
		text: {type: String, required: true}
	});

	var Idea = new Schema({
		owner : { type: Schema.Types.ObjectId, required: true},
		text : {type: String, required: true},
		type: {type: String},
		comments : [Comment]
	});
	
	var Day = new Schema({
		trip: {type: Schema.Types.ObjectId, requred: true},
		day: {type: Date, required: true},
		place: {type: String, required: true},
		ideas: [Idea]
	});

	var Trip = new Schema({
	    owner : { type: Schema.Types.ObjectId, required: true},
	    days  : [Day],
		startDate  : { type: Date, required: true},
	});

	this.User = mongoose.model('User', User);
	this.Trip = mongoose.model('Trip', Trip);
	this.Day = mongoose.model('Day', Day);
	this.Idea = mongoose.model('Idea', Idea);
	this.Comment = mongoose.model('Comment', Comment);

	}

}

