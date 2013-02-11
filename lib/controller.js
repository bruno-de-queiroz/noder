var _ = require("lodash"),
	Controller = new Class({
	initialize : function() {

		this.init = this.constructors();

		var args = [];
		for( var i = 0,j=arguments.length;i<j;i++)
			args.push(arguments[i].constructor.toString().match(/function\s+(\w+)s*/)[1])

		if(this.init.hasOwnProperty(args.toString()))
			this.init[args.toString()].apply(this,arguments);
		else {
			console.log("Controller: Undefined params");
			return false;
		}

		this.setup();
		this.build();
	}
	, constructors : function() {
		return {
			"Function,Object,Array" : function(app,routes,virtuals) {
				this.app = app;
				this.routes = routes;
				this.virtuals = virtuals;
			}
			, "Function,Object" : function(app,routes) {
				this.app = app;
				this.routes = routes;
			}
			, "Function" : function(app) {
				this.app = app;
			}
			, "String,Function,Object,Array" : function(name,app,routes,virtuals) {
				this.name = name;
				this.app = app;
				this.routes = routes;
				this.virtuals = virtuals;
			}
			, "String,Function,Object" : function(name,app,routes) {
				this.name = name;
				this.app = app;
				this.routes = routes;
			}
			, "String,Function" : function(name,app) {
				this.name = name;
				this.app = app;
			}
		}
	}.protect()
	, setup : function() {

		this.routes = this.routes || {};
		this.virtuals = this.virtuals || [];
		this.filters = this.filters || {};

		this.libs = this.libs || {};
		this.models = this.models || {};
		this.configs = this.models || {};

	}
	, action : function(name,route) {
		if(!this.routes.hasOwnProperty(name)){
			_.merge(this.routes,{ name : route });
			this.addRoute(route);
		} else {
			console.log("Controller: Route already started");
			return false;
		}
	}
	, model : function(name){
		if(!this.models.hasOwnProperty(name))
			this.models[name] = mongoose.model(name);

		return this.models[name];
	}
	, lib : function(name){
		var path = path,
			name = path.indexOf("/") > -1 ? path.substr(path.lastIndexOf("/")+1,path.length) : path;

		if(!this.libs.hasOwnProperty(name))
			this.libs[name] = require(path);

		return this.libs[name];
	}
	, config : function(name){
		var path = "../../config/"+name;

		if(!this.configs.hasOwnProperty(name))
			this.configs[name] = require(path);

		return this.configs[name];
	}
	, addRoute : function(obj) {

		var args = [];
			
		if(!obj.mapping) return false;

		args.push(obj.mapping);

		if(obj.filters){
			for(var n=0,m=obj.filters.length;n<m;n++)
				args.push(obj.filters[n]);
		}

		args.push(obj.render);
		
		this.app[ (obj.method ? obj.method : 'get') ].apply(this.app,args);

	}.protect()
	, addVirtual : function(obj){

		var args = [];

		if(!obj.mapping) return false;

		args.push(obj.mapping);

		if(obj.filters){
			for(var n=0,m=obj.filters.length;n<m;n++)
				args.push(obj.filters[n]);
		}

		if(!this.routes.hasOwnProperty(obj.action)) return false;

		args.push(this.routes[obj.action].render);
		
		this.app[ (obj.method ? obj.method : 'get') ].apply(this.app,args);

	}.protect()
	, addFilter : function(param,callback){

		this.app.param(param, callback);

	}.protect()
	, build : function(){

		for (var obj in this.routes)
			this.addRoute(this.routes[obj]);

		for (var obj in this.virtuals)
			this.addVirtual(this.virtuals[obj]);

		for (var filter in this.filters)
			this.addFilter(filter, this.filters[filter])

	}.protect()
})

module.exports = Controller