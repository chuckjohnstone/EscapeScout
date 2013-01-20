
module.exports = function(){
	var mongoose = require('mongoose');
	mongoose.connect('mongodb://127.0.0.1/escape_scout');
	/* models */
	EscapeDB = function(){

	var Schema = mongoose.Schema;
	this.Types = mongoose.Types;


	var User = new Schema({
		service : {type: String},
		serviceId : {type: String},
		picture: { type: String},
		username: {type: String},
		firstName : {type: String},
		lastName : {type: String},
		email : {type: String},
		password: {type: String}
	});


	var Comment = new Schema({
		owner : { type: Schema.Types.Mixed, required: true},
		//idea: { type: Schema.Types.ObjectId, required: true},
		text: {type: String, required: true}
	});

	var Vote = new Schema({
		owner : { type: Schema.Types.Mixed, required: true},
		//idea : { type: Schema.Types.ObjectId, required: true}, 
	});

	var Idea = new Schema({
		owner : { type: Schema.Types.Mixed, required: true},
		text : {type: String, required: true},
		type: {type: String},
		votes: [Vote],
		comments : [Comment]
	});
	
	var Day = new Schema({
		owner : { type: Schema.Types.ObjectId, required: true},
		trip: { type: Schema.Types.ObjectId, required: true},
		day: {type: Number, required: true},
		date: {type: Date, required: true},
		location: {type: String, required: true},
		ideas: [Idea]
	});

	var Trip = new Schema({
	    owner : { type: Schema.Types.Mixed, required: true},
	    days  : [{ type: Schema.Types.ObjectId, ref: 'Day' }],
		startDate  : { type: Date, required: true},
		place: {type: String, required: true},
		shortUrl: {type: String}
	});

	this.User = mongoose.model('User', User);
	this.Trip = mongoose.model('Trip', Trip);
	this.Day = mongoose.model('Day', Day);
	this.Idea = mongoose.model('Idea', Idea);
	this.Vote = mongoose.model('Vote', Vote);
	this.Comment = mongoose.model('Comment', Comment);

	}

}

