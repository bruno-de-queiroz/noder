var Mediator = (function() {
	var _channels = {},
		_subscribe = function(channel,fn){
			if(typeof fn != "function") throw new Error("You must specify a function as callback");
			if(!_channels.hasOwnProperty(channel)) _channels[channel] = [];
			_channels[channel].push({ context: this, callback: fn });
		},
		_publish = function(channel){
			if(!_channels.hasOwnProperty(channel)) return false;
			var args = Array.prototype.slice.call(arguments, 1);
			for (var i=0,j=_channels[channel].length;i<j;i++){
				var subscription = _channels[channel][i];
				subscription.callback.apply(subscription.context, args);
			}
		}
	return {
		publish : _publish,
		subscribe : _subscribe
	}
}())

module.exports = Mediator;