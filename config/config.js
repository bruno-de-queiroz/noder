module.exports = {
	development: {
		locales:['br', 'pt', 'en' ]
		, sessionStorage: null
		, staticMaxAge: 0
		, key: "express.sid"
		, secret: "noderblogger"
		, root: require('path').normalize(__dirname + '/..')
		, db: 'mongodb://localhost/noder'
		, app: {
			name: 'Noder - Social Blogger'
			, baseURL: "noder.app.com:3000"
			, pushServer: "http://pubsubhubbub.appspot.com"
		}
		, superfeedr: {
			user: "brunoqs"
			, password: "b1r2u3n4"
		}
		, facebook: {
			clientID: "486133094757475"
			, clientSecret: "fa587fbedb18b7ec1866f96a7f41f967"
			, callbackURL: "http://noder.app.com:3000/auth/facebook/callback"
		}
		, twitter: {
			clientID: "LdKuAiI17qNpC2SLNsXEbA"
			, clientSecret: "vs3eqg7BJO0bMRds6UXisqaKLddRNTwmO42VUEY4GI4"
			, callbackURL: "http://noder.app.com:3000/auth/twitter/callback"
		}
		, google: {
			clientID: "901779458674.apps.googleusercontent.com"
			, clientSecret: "FFVQOLl2CD9P59hxomUj5du2"
			, callbackURL: "http://noder.app.com:3000/auth/google/callback"
		}
	}
	, test: {

	}
	, production: {
		locales:['br', 'pt', 'en' ]
		, staticMaxAge: 0
		, key: "express.sid"
		, secret: "noderblogger"
		, sessionStorage: null
		, root: require('path').normalize(__dirname + '/..')
		, db: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/noder'
		, app: {
			name: 'Noder - Social Blogger'
			, baseURL: "social-noder.herokuapp.com"
			, pushServer: "http://pubsubhubbub.appspot.com"
		}
		, superfeedr: {
			user: "brunoqs"
			, password: "b1r2u3n4"
		}
		, facebook: {
			clientID: "486133094757475"
			, clientSecret: "fa587fbedb18b7ec1866f96a7f41f967"
			, callbackURL: "http://social-noder.herokuapp.com/auth/facebook/callback"
		}
		, twitter: {
			clientID: "LdKuAiI17qNpC2SLNsXEbA"
			, clientSecret: "vs3eqg7BJO0bMRds6UXisqaKLddRNTwmO42VUEY4GI4"
			, callbackURL: "http://social-noder.herokuapp.com/auth/twitter/callback"
		}
		, google: {
			clientID: "901779458674.apps.googleusercontent.com"
			, clientSecret: "FFVQOLl2CD9P59hxomUj5du2"
			, callbackURL: "http://social-noder.herokuapp.com/auth/google/callback"
		}
	}
}
