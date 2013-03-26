Application.Socket = function(name,sandbox) {
	var context = this
		, name = name
		, socket = io.connect('/')
		, _token = null
		, _init = function() {
			sandbox.install(context);
			context.subscribe("socket", "connect", _bind);
			_load();
		}
		, _saveToken = function(data){
			_token = data;
			context.publish("socket" , "status" , { ready : true });
		}
		, _send = function(data){
			var data = sandbox.merge(data,{ token : _token });
			console.log(data);
			socket.emit("event", data);
		}
		, _bind = function(success,token) {
			if(success){

				context.subscribe("socket", "csrf", _saveToken );

				context.subscribe("socket", "event", _send );

				socket.on("error",function(response){
					context.publish("socket", "error" , response);
				});

				socket.on("event",function(response){
					console.log(response);
					context.publish(response.channel , response.subchannel , response.data);
				});

				socket.on("csrf",function(token){
					context.publish("socket" , "csrf" , token);
				});

				socket.on('disconnect', function(){
					context.publish("socket", "disconnect" , true);
				});

			} else {
				context.publish("socket", "error" , "Error connection to socket");
			}
		}
		, _load = function() {
			socket.on("connect",function(){
				context.publish("socket", "connect", true );
			})
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


core.register("socket", Application.Socket);