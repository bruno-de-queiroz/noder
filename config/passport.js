
var mongoose = require('mongoose')
	, LocalStrategy = require('passport-local').Strategy
	, TwitterStrategy = require('passport-twitter').Strategy
	, FacebookStrategy = require('passport-facebook').Strategy
	, GoogleStrategy = require('passport-google-oauth').Strategy
	, User = mongoose.model('User');


module.exports = function (passport, config) {
	// require('./initializer')

	// serialize sessions
	passport.serializeUser(function(user, done) {
		done(null, user.id)
	})

	passport.deserializeUser(function(id, done) {
		User.findOne({ _id: id }).populate("articles","comments facebook google twitter").exec(function (err, user) {
			done(err, user)
		})
	})

	// use local strategy
	passport.use(new LocalStrategy({
			usernameField: 'email',
			passwordField: 'password'
		},
		function(email, password, done) {
			User.findOne({ email: email }, function (err, user) {
				if (err) { return done(err) }
				if (!user) {
					return done(null, false, { message: 'Unknown user' })
				}
				if (!user.authenticate(password)) {
					return done(null, false, { message: 'Invalid password' })
				}
				return done(null, user)
			})
		}
	))

	// use twitter strategy
	passport.use(new TwitterStrategy({
			consumerKey: config.twitter.clientID
			, consumerSecret: config.twitter.clientSecret
			, callbackURL: config.twitter.callbackURL
			, passReqToCallback: true
		},
		function(req, token, tokenSecret, profile, done) {
			console.log(req.user);
			if (req.user) {
				User.findOne({ '_id': req.user._id }, function (err, user) {
					if (err) { return done(err) }
					user.twitter = profile._json;
					user.providers.push("twitter");
					user.save(function(err){
						if (err) console.log(err)
							return done(err, user)
					})
				})
			} else {
				User.findOne({ 'twitter.id': profile.id }, function (err, user) {
					if (err) { return done(err) }
					var end_profile = profile._json;
					if (!user) {
						user = new User({
								name: profile.displayName
							, username: profile.username
							, provider: 'twitter'
							, twitter: end_profile
							, providers: ['twitter']
							, picture : {
								small : 'https://api.twitter.com/1/users/profile_image?screen_name='+end_profile.screen_name+'&size=normal'
								, medium : 'https://api.twitter.com/1/users/profile_image?screen_name='+end_profile.screen_name+'&size=bigger'
								, large : 'https://api.twitter.com/1/users/profile_image?screen_name='+end_profile.screen_name+'&size=original'
							}
						})
						user.save(function (err) {
							if (err) console.log(err)
							return done(err, user)
						})
					} else {
						return done(err, user)
					}
				})
			}
		}
	))

	// use facebook strategy
	passport.use(new FacebookStrategy({
			clientID: config.facebook.clientID
			, clientSecret: config.facebook.clientSecret
			, callbackURL: config.facebook.callbackURL
			, passReqToCallback: true
		},
		function(req, accessToken, refreshToken, profile, done) {
			console.log(req.user);
			if (req.user) {
				User.findOne({ '_id': req.user._id }, function (err, user) {
					if (err) { return done(err) }
					user.facebook = profile._json;
					user.providers.push("facebook");
					user.save(function(err){
						if (err) console.log(err)
							return done(err, user)
					})
				})
			} else {
				User.findOne({ 'facebook.id': profile.id }, function (err, user) {
					if (err) { return done(err) }
					var end_profile = profile._json
					if (!user) {
						user = new User({
								name: profile.displayName
							, email: profile.emails[0].value
							, username: profile.username
							, provider: 'facebook'
							, facebook: end_profile
							, providers: ['facebook']
							, picture : {
								small : 'https://graph.facebook.com/'+end_profile.id+'/picture?width=50&height=50'
								, medium : 'https://graph.facebook.com/'+end_profile.id+'/picture?width=92&height=92'
								, large : 'https://graph.facebook.com/'+end_profile.id+'/picture?width=200&height=200'
							}
						});
						user.save(function (err) {
							if (err) console.log(err)
							return done(err, user)
						})
					} else {
						return done(err, user)
					}
				})
			}
		}
	))

	// use google strategy
	passport.use(new GoogleStrategy({
			consumerKey: config.google.clientID
			, consumerSecret: config.google.clientSecret
			, callbackURL: config.google.callbackURL
			, passReqToCallback: true
		},
		function(req, accessToken, refreshToken, profile, done) {
			console.log(profile);
			if (req.user) {
				User.findOne({ '_id': req.user.id }, function (err, user) {
					if (err) { return done(err) }
					var new_profile = {};
					new_profile.id = profile.id
					new_profile.displayName = profile.displayName
					new_profile.emails = profile.emails
					new_profile.image = profile.image
					user.google = new_profile;
					user.providers.push("google");
					user.save(function(err){
						if (err) console.log(err)
							return done(err, user)
					})
				})
			} else {
				User.findOne({ 'google.id': profile.id }, function (err, user) {
					if (!user) {
						var new_profile = {};
						new_profile.id = profile.id
						new_profile.displayName = profile.displayName
						new_profile.emails = profile.emails
						new_profile.image = profile.image
						var end_profile = new_profile
						user = new User({
							name: profile.displayName
							, email: profile.emails[0].value
							, provider: 'google'
							, google: end_profile
							, providers: ['google']
							, picture : {
								small : end_profile.image.url+'?sz=50x50'
								, medium : end_profile.image.url+'?sz=92x92'
								, large : end_profile.image.url+'?sz=200x200'
							}
						})
						user.save(function (err) {
							if (err) console.log(err)
							return done(err, user)
						})
					} else {
						return done(err, user)
					}
				})
			}
		}
	));
}
