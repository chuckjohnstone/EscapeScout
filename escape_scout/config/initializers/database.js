
module.exports = function(){
	var mongoose = require('mongoose');
	mongoose.connect('mongodb://127.0.0.1/escape_scout');
	/* models */
	EscapeDB = function(){

	var Schema = mongoose.Schema;

	var User = new Schema({
		fbId : {type: String, required: true},
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
		comments : [Comment]
	});

	var Trip = new Schema({
	    owner : { type: Schema.Types.ObjectId, required: true},
	    days  : { type: Number, required: true},
		startDate  : { type: Date, required: true},
		ideas : [Idea]
	});

	this.User = mongoose.model('User', User);
	this.Trip = mongoose.model('Trip', Trip);

	}

}

