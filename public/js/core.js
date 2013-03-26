var Application = {};

Application.Library = function() {
	"use strict";
	var dom = {};
		dom.query = jQuery;

	var	_getClass = function(obj){
			if (typeof obj === "undefined")
				return "undefined";
			if (obj === null)
				return "null";
				return Object.prototype.toString.call(obj).match(/^\[object\s(.*)\]$/)[1];
		}
		, _find = function(parent,object){
			var query = dom.query(parent).find(object);
			if(query.length == 1)
				return _treatReturn(query[0]);
			else if (query.length > 1) {
				return _treatMutiples(query);
			}
			else
				return false;
		}
		, _new = function(id,type,attr,html){
			var obj = dom.query("<"+type+"></"+type+">");
			obj.attr("id",id);
			if(attr)
				obj.attr(attr);
			if(html)
				obj.html(html);

			return _treatReturn(obj[0]);
		}
		, _merge = function(a,b){
			return dom.query.extend({},a,b);
		}
		, _attr = function(el,attr,value){
			var result;
			if(value){
				dom.query(el).attr(attr,value);
				result = _treatReturn(dom.query(el)[0]);
			} else {
				if(typeof attr != "object" ) throw new Error("Invalid arguments");
				result = dom.query(el).attr(attr);
			}
			return result;
		}
		, _remove = function(selector){
			dom.query(selector).remove();
		}
		, _animate = function(type,obj,callback,time){
			var obj = dom.query(obj);
			obj[type](time ? time : "fast",callback);
			return _treatReturn(obj[0]);
		}
		, _append = function(a,b) {
			dom.query(a).append(b);
		}
		, _get = function(selector) {
			var query = dom.query(selector);
			if(query.length > 0)
				return _treatReturn(query[0]);
			else
				return false;
		}
		, _html = function(selector,html){
			var query = dom.query(selector);
			query.html(html);
			return _treatReturn(query[0]);
		}
		, _bind = function(selector,event,callback){
			dom.query(selector).on(event,callback);
		}
		, _unbind = function(selector,event){
			dom.query(selector).off(event);
		}
		, _treatMutiples = function(array){
			var objs = []
			for(var i = 0, j= array.length; i<j; i++){
				var obj = array[i];
				objs.push(_treatReturn(obj));
			}
			return objs;
		}
		, _treatReturn = function(obj){

			var wrapper = {
				selector : obj
				, find : function(query){
					return _find.call(this,obj,query)
				}
				, attr : function(attr,value) {
					return _attr.call(this,obj,attr,value);
				}
				, append : function(object){
					return _append.call(this,obj,object);
				}
				, animate : function(type,time,callback){
					return _animate.call(this,type,obj,callback,time);
				}
				, html : function(string){
					return _html.call(this,obj,string);
				}
				, on : function(event,callback){
					return _bind.call(this,obj,event,callback);
				}
				, off : function(event){
					return _unbind.call(this,obj,event);
				}
			}

			return wrapper;
		}

	return {
		getClass: _getClass
		, create: _new
		, merge : _merge
		, attr: _attr
		, remove: _remove
		, animate: _animate
		, append: _append
		, get: _get
		, find : _find
		, html: _html
		, bind: _bind
		, unbind: _unbind
	};
};

Application.Mediator = function() {
	var self = this,
		_channels = {},
		_ = function(object, arguments){
			var args = [];
			for (var i = 0, j = arguments.length; i < j; i++) {
				args.push(arguments[i].constructor.toString().match(/function\s+(\w+)s*/)[1]);
			}
			args.pop();
			return object[args.toString()].apply(this, arguments);
		},
		_s = {
			"String" : function(channel,fn){

				if(typeof fn != "function") throw new Error("You must specify a function as callback");
				if(!_channels[channel]) _channels[channel] = { listeners: {}, subchannels: {} };
				_channels[channel].listeners[this.instance.name] = { context: this, callback: fn };
				return this;
			},
			"String,String" : function(channel,subchannel,fn){
				if(typeof fn != "function") throw new Error("You must specify a function as callback");
				if(!_channels[channel]) _channels[channel] = { listeners: {}, subchannels: {} };
				if(!_channels[channel].subchannels[subchannel]) _channels[channel].subchannels[subchannel] = { listeners: {} };
				_channels[channel].subchannels[subchannel].listeners[this.instance.name] = { context: this, callback: fn };
				return this;
			}
		},
		_p = {
			"String" : function(channel){
				if(!_channels[channel]) return false;
				var args = Array.prototype.slice.call(arguments, 1);
				for (var i in _channels[channel].listeners){
					var subscription = _channels[channel].listeners[i];
					subscription.callback.apply(subscription.context, args);
				}
				return this;
			},
			"String,String" : function(channel,subchannel){
				if(!_channels[channel]) return false;
				if(!_channels[channel].subchannels[subchannel]) return false;
				var args = Array.prototype.slice.call(arguments, 2);
				for (var i in _channels[channel].subchannels[subchannel].listeners){
					var subscription = _channels[channel].subchannels[subchannel].listeners[i];
					subscription.callback.apply(subscription.context, args);
				}
				return this;
			}
		},
		_u = function() {
			var overloads = {
				"String" : function(channel){
					if(_channels[channel].listeners.hasOwnProperty(this.instance.name))
						delete _channels[channel].listeners[this.instance.name]
				},
				"String,String" : function(channel,subchannel) {
					if(_channels[channel].subchannels[subchannel].listeners.hasOwnProperty(this.instance.name))
						delete _channels[channel].subchannels[subchannel].listeners[this.instance.name]
				}
			}
			var args = [];
			for (var i = 0, j = arguments.length; i < j; i++) {
				args.push(arguments[i].constructor.toString().match(/function\s+(\w+)s*/)[1]);
			}
			return overloads[args.toString()].apply(this, arguments);
		},
		_subscribe = function() {
			_.call(this,_s,arguments);
		},
		_publish = function() {
			_.call(this,_p,arguments);
		},
		_unsubscribe = function() {
			_u.apply(this,arguments);
		},
		_clean = function(channels,module){
			for ( var i in channels ) {
				var channel = channels[i];
				if(channel.listeners.hasOwnProperty(module))
					delete channel.listeners[module];

				if(channel.hasOwnProperty("subchannels"))
					_clean(channel.subchannels,module);
			}
		}
	return {
		channels: _channels,
		publish: _publish,
		subscribe: _subscribe,
		unsubscribe: _unsubscribe,
		clean: _clean,
		install: function(obj){
			obj.subscribe = _subscribe;
			obj.publish = _publish;
			obj.unsubscribe = _unsubscribe;
		}
	};
};

Application.Sandbox = function (){
	var lib = new Application.Library(),
		mediator = new Application.Mediator(),
		el = lib.get("#content"),
		_ = function(fn, arguments){
			var args = [];
			for (var i = 0, j = arguments.length; i < j; i++) {
				args.push(arguments[i].constructor.toString().match(/function\s+(\w+)s*/)[1]);
			}

			return fn[args.toString()].apply(this, arguments);
		},
		_remove = {
			"Object,String" : function(el,m) {
				lib.remove(el);
				this.unsubscribe(m);
			},
			"String" : function(m) {
				this.unsubscribe(m);
			}
		};
	return {
		append: function(a,b) {
			if(b){
				lib.append(a,b);
			} else {
				lib.append(el,a);
			}
		},
		getClass: lib.getClass,
		new: lib.new,
		remove: function(name) {
			this.unsubscribe(name);
		},
		attr: lib.attr,
		get: lib.get,
		find: lib.find,
		animate: lib.animate,
		html: lib.html,
		bind: lib.bind,
		unbind: lib.unbind,
		merge: lib.merge,
		publish: mediator.publish,
		subscribe: mediator.subscribe,
		unsubscribe: mediator.unsubscribe,
		clean: mediator.clean,
		install: mediator.install
	};
};

var core = Application.Core = (function() {
	var modules = {},
		sandbox = new Application.Sandbox(),
		_register = function(m,creator){
			modules[m] = {
				creator: creator,
				instance: null
			};
		},
		_init = function() {
			for(var i in modules){
				try {
					_start(i);
				} catch(err){
					console.log(err.message);
				}
			}
		},
		_start = function(m) {
			try {
				if(!modules.hasOwnProperty(m)) return false;
				var module = modules[m];
				module.instance = modules[m].creator(m,sandbox);
				module.instance.init();
			} catch(err){
				console.log(err.stack);
			}
		},
		_stop = function(m){
			try {
				if(!modules.hasOwnProperty(m)) return false;
				var module = modules[m];
				if(module.instance){
					module.instance.destroy();
					module.instance = null;
				}
			} catch(err){
				console.log(err.getStack());
			}
		};
	return {
		register: _register,
		init: _init,
		stop: _stop,
		start: _start
	};
}());