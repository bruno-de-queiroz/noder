GLOBAL.moo = require('./lib/mootools/mootools')
GLOBAL.mongoose = require('mongoose')
GLOBAL.mediator = require("./lib/mediator")

var express = require('express')
	, fs = require('fs')
	, passport = require('passport')
	// loading config
	, env = process.env.NODE_ENV || 'development'
	, config = require('./config/config')[env]
	, auth = require('./config/middlewares/authorization')
	, mongoose = require('mongoose')
	, Superfeedr = require('superfeedr')
	, subscriber = new Superfeedr(config.superfeedr.user, config.superfeedr.password);
	//, subscriber = require('snrub').createSubscriber({'host': config.app.baseURL })

// Bootstrap db connection
mongoose.connect(config.db)

subscriber.on("connected",function(){
	console.log("Conneted to SuperFeedr");
})

subscriber.on("error",function(){
	console.log("Error trying to connect SuperFeedr");
})

// Bootstrap models
var models_path = __dirname + '/app/models'
fs.readdirSync(models_path).forEach(function (file) {
	require(models_path+'/'+file)
})

// bootstrap passport config
require('./config/passport')(passport, config)

var app = express()

// express settings
require('./config/express')(app, subscriber, config, passport)

// Bootstrap routes
var controllers_path = __dirname + '/app/controllers';
fs.readdirSync(controllers_path).forEach(function (file) {
	require(controllers_path+'/'+file)(app, passport, auth)
});

// Start the app by listening on <port>
var port = process.env.PORT || 3000
	, socketPort = 3444
	, io = require('./config/socketio')(app,config,port)
	, handler = require('./mediator')(io,subscriber,config);


console.log('Express app started on port '+port)

