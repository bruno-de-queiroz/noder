Application.Feeds = function(name,sandbox) {
	var context = this
		, name = name
		, element = sandbox.get('#right-content #feedsList')
		, _token = null
		, _init = function() {
			sandbox.install(context);
			console.log("Listening to socket");
			context.subscribe("socket", "connect", _bind );
		}
		, _showMessages = function(message) {
			element.html(message);
		}
		, _viewData = function(data){
			console.log(data);
		}
		, _start = function(data) {
			if(data.ready){
				console.log("Starting widget");
				context.publish("socket", "event", { channel : "feeds" , action : "fetchLast" });
				context.unsubscribe("socket","status");
			}
		}
		, _bind = function() {
			context.subscribe( "feeds", "message", _showMessages );
			context.subscribe( "feeds", "update", _viewData );
			context.subscribe( "socket", "status", _start );
		}
		, _destroy = function(){
			sandbox.clean(name);
		};
	return {
		name: name
		, init: _init
		, destroy: _destroy
	};
};


core.register("feeds", Application.Feeds);