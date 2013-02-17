// comment schema

var mongoose = require('mongoose')
	, Schema = mongoose.Schema

var FeedSchema = new Schema({
	title : { type: String, default : ''}
	, url : String
	, articles : {}
})

mongoose.model('Feed', FeedSchema)