Application.Feeds = function(name,sandbox) {
	var context = this
		, name = name
		, element = sandbox.get('#feedsList')
		, box = sandbox.get("#add-feed")
		, input = box.find("input[name=feed-search]")
		, toggleButton = sandbox.get('.add-feed')
		, _token = null
		, _opened = false
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
				context.publish("socket", "event", { channel : "feeds" , action : "fetch" });
				context.unsubscribe("socket","status");
			}
		}
		, _handleSubscription = function(data){
			if(data.success){

			} else {
				box.find(".no-entries").html("<i class='icon warning'></i> "+data.message);
			}
		}
		, _toggle = function(e){
			box.animate(_opened ? "slideUp" : "slideDown" ,"fast",function() {
				_opened = !_opened;
			})
		}
		, _bind = function() {
			context.subscribe( "feeds", "message", _showMessages );
			context.subscribe( "feeds", "update", _viewData );
			context.subscribe( "feeds", "subscribe", _handleSubscription );
			context.subscribe( "socket", "status", _start );

			toggleButton.on("click",_toggle);

			input.on("change",function(){
				context.publish("socket", "event", { channel : "feeds" , action : "subscribe", data: { url : this.value } });
			});

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