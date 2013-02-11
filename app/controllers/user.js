var UserController = function(app,passport,auth){

	var controller = require("../abstracts/controller")
	, _ = require('lodash')
	, Users = new controller("users",app,passport,auth);

	Users.extend({
		signin: {
			render : function (req, res) {}
		}
		, authCallback: {
			render : function (req, res, next) {
				res.redirect('/');
			}
		}
		, login : {
			mapping : "/login"
			, render : function (req, res) {
				res.render( Users.name() + '/login', {
					title: app.locals.__('Login')
					, message: req.flash('error')
					, pageName: "login"
					, providers : [ 'facebook', 'twitter' , 'google-plus' ]
				})
			}
		}
		, signup : {
			mapping : "/signup"
			, render : function (req, res) {
				var User = Users.model('User')

				res.render( Users.name() + '/signup', {
					title: app.locals.__('Sign up')
					, user: new User()
					, pageName: "Sign up"
				})
			}
		}
		, logout : {
			mapping : "/logout"
			, render : function (req, res) {
				req.logout()
				res.redirect('/login')
			}
		}
		, session : {
			mapping : '/users/session'
			, method : "post"
			, filters : [ passport.authenticate('local', {failureRedirect: '/login', failureFlash: 'Invalid email or password.'}) ]
			, render : function (req, res) {
				res.redirect('/')
			}
		}
		, create : {
			mapping : "/users/add"
			, method : "post"
			, filters : [ ]
			, render : function (req, res) {
				console.log("Criando usuário");
				var User = Users.model('User')
				, user = new User(req.body)
				user.provider = 'local';
				console.log("Registrando o user")
				user.save(function (err) {
					if (err) {
						console.log(err);
						return res.render( Users.name() + '/signup', { errors: err.errors, user: user })
					}
					console.log("Logando o user")
					req.logIn(user, function(err) {
						if (err){
							console.log(err);
							return next(err);
						}
						return res.redirect('/')
					})
				})
			}
		}
		, view  : {
			render : function (req, res) {
				var user = req.profile
				res.render( Users.name() + '/show', {
					title: user.name
					, user: user
					, pageName: "user-setup"
				})
			}
		}
	}).virtual([
		{
			mapping : '/auth/facebook'
			, filters : [ passport.authenticate('facebook', { scope: [ 'email', 'user_about_me'], failureRedirect: '/login' }) ]
			, action : 'signin'
		}
		, {
			mapping : '/auth/facebook/callback'
			, filters : [ passport.authenticate('facebook', { failureRedirect: '/login' }) ]
			, action : 'authCallback'
		}
		, {
			mapping : '/auth/twitter'
			, filters : [ passport.authenticate('twitter', { failureRedirect: '/login' }) ]
			, action : 'signin'
		}
		, {
			mapping : '/auth/twitter/callback'
			, filters : [ passport.authenticate('twitter', { failureRedirect: '/login' }) ]
			, action : 'authCallback'
		}
		, {
			mapping : '/auth/google-plus'
			, filters : [ passport.authenticate('google', { failureRedirect: '/login', scope: 'https://www.google.com/m8/feeds' }) ]
			, action : 'signin'
		}
		, {
			mapping : '/auth/google-plus/callback'
			, filters : [ passport.authenticate('google', { failureRedirect: '/login', scope: 'https://www.google.com/m8/feeds' }) ]
			, action : 'authCallback'
		}
	]).apply({
		usersId : function (req, res, next, id) {
			var User = Users.model('User')

			User.findOne({ _id : id })
				.exec(function (err, user) {
					if (err) return next(err)
					if (!user) return next(new Error(app.locals.__('Failed to load User %s',id)))
						req.profile = user
					next()
				})
		}
	}).create();
}

module.exports = UserController