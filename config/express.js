/**
 * Module dependencies.
 */

var express = require('express')
	, mongoStore = require('connect-mongo')(express)
	, flash = require('connect-flash')
	, stylus = require("stylus")
	, i18n = require("i18n")
	, moment = require("moment")
	, nib = require("nib")
	, viewHelpers = require('./middlewares/view');

module.exports = function (app, config, passport) {

	i18n.configure({
		locales: config.locales
	});

	app.set('showStackError', true)

	// should be placed before express.static
	app.use(express.compress({
		filter: function (req, res) {
			console.log(res.getHeader('Content-Type'));
			return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
		},
		level: 9
	}))
		
	app.use(i18n.init);

	// use stylus middleware
	app.use(stylus.middleware({
		src: config.root + '/public',
		compile: function(str,path) { return stylus(str).set('filename',path).use(nib()).set('compress', true); }
	}))

	app.use(express.static(config.root + '/public', { maxAge : config.staticMaxAge }))
	app.use(express.logger('dev'))

	// set views path, template engine and default layout
	app.set('views', config.root + '/app/views')
	app.set('view engine', 'jade')

	app.configure(function () {

		app.locals({
			__: i18n.__,
			__n: i18n.__n
		})

		// dynamic helpers
		app.use(viewHelpers(config,i18n))

		// cookieParser should be above session
		app.use(express.cookieParser())

		// bodyParser should be above methodOverride
		app.use(express.bodyParser())
		app.use(express.methodOverride())

		// express/mongo session storage
		app.use(express.session({
			secret: 'noderblogger',
			maxAge  : new Date(Date.now() + 600000), //10 min
    		expires : new Date(Date.now() + 600000), //10 min
			store: new mongoStore({
				url: config.db,
				collection : 'sessions'
			})
		}))

		// connect flash for flash messages
		app.use(flash())

		// use passport session
		app.use(passport.initialize())
		app.use(passport.session())

		app.use(express.favicon())

		// routes should be at the last
		app.use(app.router)

		// assume "not found" in the error msgs
		// is a 404. this is somewhat silly, but
		// valid, you can do whatever you like, set
		// properties, use instanceof etc.
		app.use(function(err, req, res, next){
			// treat as 404
			if (~err.message.indexOf('not found')) return next()

			// log it
			console.error(err.stack)

			// error page
			res.status(500).render('500', { error: err.stack, pageName: '500' })
		})

		// assume 404 since no middleware responded
		app.use(function(req, res, next){
			res.status(404).render('404', { url: req.originalUrl, pageName: '404' })
		})

	})
}