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
			clientID: "486133094757475"
			, clientSecret: "fa587fbedb18b7ec1866f96a7f41f967"
			, callbackURL: "http://localhost:3000/auth/facebook/callback"
		},
		twitter: {
			clientID: "LdKuAiI17qNpC2SLNsXEbA"
			, clientSecret: "vs3eqg7BJO0bMRds6UXisqaKLddRNTwmO42VUEY4GI4"
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
		locales:['br', 'pt', 'en' ],
		staticMaxAge: 0,
		root: require('path').normalize(__dirname + '/..'),
		app: {
			name: 'Noder - Social Blogger'
		},
		db: 'mongodb://localhost/noder',
		facebook: {
			clientID: "486133094757475"
			, clientSecret: "fa587fbedb18b7ec1866f96a7f41f967"
			, callbackURL: "http://social-noder.herokuapp.com/auth/facebook/callback"
		},
		twitter: {
			clientID: "LdKuAiI17qNpC2SLNsXEbA"
			, clientSecret: "vs3eqg7BJO0bMRds6UXisqaKLddRNTwmO42VUEY4GI4"
			, callbackURL: "http://social-noder.herokuapp.com/auth/twitter/callback"
		},
		google: {
			clientID: "901779458674.apps.googleusercontent.com"
			, clientSecret: "FFVQOLl2CD9P59hxomUj5du2"
			, callbackURL: "http://social-noder.herokuapp.com/auth/google/callback"
		}
	}
}
