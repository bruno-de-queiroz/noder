module.exports = function(app,config,port){
	var server = require('http').Server(app)
		, io = require("socket.io").listen(server)
		, passio = require("passport.socketio")
		, i18n = require("i18n")
		, _instances = {}
		, socket = null
		, generateToken = function(token){
			var newToken = Math.round((new Date().valueOf() * Math.random()));
			return newToken == token ? generateToken() : newToken ;
		}

	io.set("authorization", passio.authorize({
		key: config.key					//the cookie where express (or connect) stores its session id.
		, secret: config.secret				//the session secret to parse the cookie
		, store: config.sessionStorage	//the session store that express uses
		, fail: function(data, accept) {
			console.log()
			accept(i18n.__('Not authorized.'), false);
		}
		, success: function(data, accept) {
			accept(null, true);
		}
	}));

	io.on('connection', function(s){
		socket = s;
		var token = Math.round((new Date().valueOf() * Math.random()));

		_instances[s.id] = {
			user: socket.handshake.user.id
			, token: token
			, socket: s.id
		}

		socket.emit('csrf', token);

		socket.on('event', function (request) {

			var token = _instances[s.id].token;

			if(request.token == token){

				mediator.publish(request.channel, _instances[s.id], request.action, request.data ? request.data : null );

				token = generateToken(token);

				_instances[s.id].token = token;

				socket.emit('csrf', token);

			} else {
				console.log(i18n.__("Not valid token."));
			}
		});
	});

	server.listen(port);

	return io;
}