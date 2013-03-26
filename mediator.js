module.exports = function(io,config){
	var config = config.app
		, _ = require('lodash')
		, rss = require('rssparser')
		, crypto = require('crypto')
		, i18n = require("i18n")
		, User = mongoose.model("User")
		, Feed = mongoose.model("Feed")
		, subscriber = require('snrub').createSubscriber({'host': config.baseURL })
		, saveSubscription = function(client,url){
			rss.parseURL(url, {}, function(err,response){
				if(err)
					mediator.publish("send", client.socket,
						{
							channel:"feeds"
							, subchannel: "subscribe"
							, data : {
								success: false
								, message: i18n.__("Error trying to save feed")
							}
						}
					);
			 	else {
					var feed = {
						hash : crypto.createHmac('sha1', response.url + response.title).digest("hex")
						, url: response.url
						, title: response.title
						, image: response.image
						, subscribed: true
						, description: response.description
						, articles: response.items
					}

					Feed.update({ hash: feed.hash }, feed, {upsert: true}, function(err){
						if(!err){
							User.findOne({ _id : client.user },function(err,user) {
								user.feeds.push(feed._id);
								user.save(function(err){
									if (err)
										throw new Error(i18n.__('Error while saving user'))
									else
										mediator.publish("send", client.socket,{
											channel:"feeds"
											, subchannel: "subscribe"
											, data : {
												success: true
												, feed : {
													image: feed.image
													, title : feed.title
													, description: feed.description
												}
											}
										});
								});
							});
						}
					});
				}
			})
		}
		, getFeed = function(client,url){
			Feed.findOne({ url: url },function(err,feed){
				console.log(config.pushServer);
				if(!feed)
					subscriber.subscribe(config.pushServer,url,{ leaseSeconds: 10 * 60 },
						function(url){
							saveSubscription(client,url);
						},
						function(status){
							mediator.publish("send", client.socket,
								{
									channel:"feeds"
									, subchannel: "subscribe"
									, data : {
										success: false
										, message: i18n.__("Bad response from hub: "+status)
									}
								}
							);
						}
					);
				else{
					User.findOne({ _id : client.user },function(err,user) {
						if(_.indexOf(user.feed, feed._id) == -1)
							user.feeds.push(feed._id);
							user.save(function(err){
								if (err)
									throw new Error(i18n.__('Error while saving user'))
								else
									mediator.publish("send", client.socket,{
										channel:"feeds"
										, subchannel: "subscribe"
										, data : {
											success: true
											, feed : {
												image: feed.image
												, title : feed.title
												, description: feed.description
											}
										}
									});
							});
					});
				}
			});
		}

	subscriber.on('subscribe', function(topic) {
	  console.log("Subscribed to " + topic);
	});

	subscriber.on('update', function(topic, content) {
	  console.log("Content from " + topic);
	  console.log(content);
	});

	mediator.subscribe("send",function(client,data){
		console.log("Emiting to view");
		io.sockets.socket(client).emit("event",data);
	})

	mediator.subscribe("feeds",function(client,action,data){
		switch(action){
			case "fetch":
				console.log("Going to DB");
				Feed.findOne({ _id : { $in : data }}).populate("feeds").exec(function(err,feeds)
				{
					if(err) mediator.publish("error", { channel:"feeds", subchannel: "errors", data : { message: "Error while populating feeds"}});
					mediator.publish("send", client.socket, { channel:"feeds", subchannel: "update", data : feeds});
				})
				break;
			case "subscribe":
				console.log("Subscribing to:" + data.url);
				getFeed(client,data.url);
				break;
			case "update":
				mediator.publish("send", client.socket, { channel:"feeds", subchannel: "update", data : { "G1" : "opa" }});
				break;
		}
	});
}