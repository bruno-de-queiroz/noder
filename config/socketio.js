module.exports = function(app,port){
	var server = require('http').Server(app)
		, io = require("socket.io").listen(server)
		, i18n = require("i18n")
		, nub = require('nubnub')
		, rss = require('rssparser')
		, async = require('async')
		, _token = null
		, socket = null
		, Feed = mongoose.model("Feed")
		, generateToken = function(){
			var newToken = Math.round((new Date().valueOf() * Math.random()));
			return newToken == _token ? generateToken() : newToken ;
		}


	mediator.subscribe("send",function(data){
		console.log("Emiting to view");
		if(socket){
			socket.emit("event",data);
		}
	})

	mediator.subscribe("feeds",function(data){
		switch(data.action){
			case "fetch":
				console.log("Going to DB");
				Feed.findOne({ _id : { $in : data.feeds }}).populate("feeds").exec(function(err,feeds)
				{
					if(err) mediator.publish("error", { channel:"feeds", subchannel: "errors", data : { message: "Error while populating feeds"}});
					mediator.publish("send", { channel:"feeds", subchannel: "update", data : feeds});
				})
				break;
			case "fetch":

				break;
		}

	});

	io.on('connection', function(s){
		socket = s;
		_token = Math.round((new Date().valueOf() * Math.random()));

		socket.emit('csrf', _token);

		socket.on('event', function (request) {
			if(request.token == _token){
				mediator.publish(request.channel, request.action);
				_token = generateToken();
				socket.emit('csrf', _token);
			} else {
				console.log("NOT VALID TOKEN");
			}
		});
	});

	server.listen(port);
}