// comment schema

var mongoose = require('mongoose')
	, Schema = mongoose.Schema

var FeedSchema = new Schema({
	title : { type: String, default : ''}
	, hash : String
	, url : String
	, subscribed : { type: Boolean, default: false }
	, image : String
	, description: String
	, content : {}
})

mongoose.model('Feed', FeedSchema)