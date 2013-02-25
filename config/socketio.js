module.exports = function(app,port){
	var server = require('http').Server(app)
		, io = require("socket.io").listen(server)
		, i18n = require("i18n")
		, nub = require('nubnub')
		, rss = require('rssparser')
		, async = require('async')
		, _token = null
		, _feeds = {}
		, _errors = []
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
					console.log("Iterate over feeds");

					var populateFeeds = function (feed, cb) {
						if(!_feeds[feed.title]) _feeds[feed.title] = {};

						rss.parseURL(feed.url, {}, function(err, result){

							_feeds[feed.title].article = result ;

							cb(null,_feeds);

						});
					}

					if (typeof feeds == "array" && feeds.length) {
						async.map(feeds, populateFeeds, function (err, results) {
							if(err)	_errors.push(err);
						})
					} else if(typeof feeds == "object"){
						console.log("Publishing to mediator");
						populateFeeds(feeds,function(err,articles){
							if(err)	_errors.push(err);
						})
					}
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

		mediator.publish("send",{ channel:"feeds", subchannel: "update", data : _feeds });
		if(_errors.length>0)
			mediator.publish("send",{ channel:"socket", subchannel: "errors", data : _errors });
	});

	server.listen(port);
}