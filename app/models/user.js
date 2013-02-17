// user schema

var mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, crypto = require('crypto')
	, _ = require('lodash')
	, authTypes = ['twitter', 'facebook', 'google']

var UserSchema = new Schema(
	{
		name: String
		, email: String
		, username: String
		, providers: [{ type: String }]
		, hashed_password: String
		, salt: String
		, facebook: {}
		, twitter: {}
		, google: {}
		, feeds: []
		, picture : {
				cdnUri: String
				, files: []
		}
		, blog : {
			title: {type : String, default : 'noder-blog'}
			, description : {type : String, default : 'another noder blog'}
		}
		, articles : [{ type: Schema.ObjectId, ref : 'Article' }]
	});

// virtual attributes
UserSchema
	.virtual('password')
	.set(function(password) {
		this._password = password
		this.salt = this.makeSalt()
		this.hashed_password = this.encryptPassword(password)
	})
	.get(function() { return this._password })

UserSchema
	.virtual('meta').get(function() {
		var comments = 0,
			likes = 0,
			shares = 0,
			articleLength = this.articles.length,
			total = articleLength;
		while(articleLength--){
			var article = this.articles[articleLength];
			comments += article.comments.length;
			likes += (article.facebook.likes.length + article.twitter.followers.length + article.google.plus.length);
			shares += (article.facebook.shares.length + article.twitter.retweets.length + article.google.shares.length);
		}
		return { total: total, comments : comments , shares : shares , likes : likes };
	});

UserSchema
	.virtual('shares').get(function() {
		var shares = 0,
			articleLength = this.articles.length;
		while(articleLength--){
			var article = this.articles[articleLength];
			comments += article.comments.length;
		}
		return comments;
	});

// validations
var validatePresenceOf = function (value) {
	return value && value.length
}

// the below 4 validations only apply if you are signing up traditionally

UserSchema.path('name').validate(function (name) {
	// if you are authenticating by any of the oauth strategies, don't validate
	if (authTypes.indexOf(this.provider) !== -1) return true
	return name.length
}, 'Name cannot be blank')

UserSchema.path('email').validate(function (email) {
	// if you are authenticating by any of the oauth strategies, don't validate
	if (authTypes.indexOf(this.provider) !== -1) return true
	return email.length
}, 'Email cannot be blank')

UserSchema.path('username').validate(function (username) {
	// if you are authenticating by any of the oauth strategies, don't validate
	if (authTypes.indexOf(this.provider) !== -1) return true
	return username.length
}, 'Username cannot be blank')

UserSchema.path('hashed_password').validate(function (hashed_password) {
	// if you are authenticating by any of the oauth strategies, don't validate
	if (authTypes.indexOf(this.provider) !== -1) return true
	return hashed_password.length
}, 'Password cannot be blank')


// pre save hooks
UserSchema.pre('save', function(next) {
	if (!this.isNew) return next()

	if (!validatePresenceOf(this.password) && authTypes.indexOf(this.provider) === -1)
		next(new Error('Invalid password'))
	else
		next()
})

// methods
UserSchema.method('authenticate', function(plainText) {
	return this.encryptPassword(plainText) === this.hashed_password
})

UserSchema.method('makeSalt', function() {
	return Math.round((new Date().valueOf() * Math.random())) + ''
})

UserSchema.method('encryptPassword', function(password) {
	if (!password) return ''
	return crypto.createHmac('sha1', this.salt).update(password).digest('hex')
})
mongoose.model('User', UserSchema)