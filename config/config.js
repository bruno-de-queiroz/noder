module.exports = {
	development: {
		locales:['br', 'pt', 'en' ],
		staticMaxAge: 0,
		root: require('path').normalize(__dirname + '/..'),
		app: {
			name: 'noder - social blogger'
		},
		db: 'mongodb://localhost/noder',
		facebook: {
			clientID: "APP_ID"
			, clientSecret: "APP_SECRET"
			, callbackURL: "http://localhost:3000/auth/facebook/callback"
		},
		twitter: {
			clientID: "CONSUMER_KEY"
			, clientSecret: "CONSUMER_SECRET"
			, callbackURL: "http://localhost:3000/auth/twitter/callback"
		},
		google: {
			clientID: "APP_ID"
			, clientSecret: "APP_SECRET"
			, callbackURL: "http://localhost:3000/auth/google/callback"
		}
	}
	, test: {

	}
	, production: {

	}
}
