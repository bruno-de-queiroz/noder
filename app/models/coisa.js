// comment schema

var mongoose = require('mongoose')
	, Schema = mongoose.Schema

var CoisaSchema = new Schema({
	title : { type: String, default : ''}
	, body: {type : String, default : ''}
	, createdAt: {type : Date, default : Date.now}
})

mongoose.model('Coisa', CoisaSchema)
