var BaseController = function(name,app,passport,auth){
	var _ = require('lodash')
	, __name = name ? name : ''
	, __map = __name != '' ? ("/"+__name) : ""
	, __filters = {}
	, __models = {}
	, __requires = {}
	, __configs = {}
	, __loadModel = function(name){
			if(!__models.hasOwnProperty(name))
				__models[name] = mongoose.model(name);
		}
	, __loadLibrary = function(path){
		var path = path,
			name = path.indexOf("/") > -1 ? path.substr(path.lastIndexOf("/")+1,path.length) : path;

		if(!__requires.hasOwnProperty(name))
			__requires[name] = require(path);
	}
	, __loadConfig = function(name){
		var path = "../../config/"+name;

		if(!__configs.hasOwnProperty(name))
			__configs[name] = require(path);
	}
	, __virtuals = []
	, __routes = {
		index : {
			mapping : __map
			, method : "get"
			, filters : []
			, render : function(req,res,controller){}
		}
		, add : {
			mapping : __map + "/add"
			, method : "get"
			, filters : [] //[ auth.requiresLogin ]
			, render : function(req,res,controller){}
		}
		, create : {
			mapping : __map + "/add"
			, method : "post"
			, filters : [] //[ auth.requiresLogin ]
			, render : function(req,res,controller){}
		}
		, view : {
			mapping : __map + "/:" + __name + "Id"
			, method : "get"
			, filters : []
			, render : function(req,res,controller){}
		}
		, edit : {
			mapping : __map + "/:" + __name + "Id" +"/edit"
			, method : "get"
			, filters : [] //[ auth.requiresLogin , auth.hasAuthorization ]
			, render : function(req,res,controller){}
		}
		, update : {
			mapping : __map + "/:" + __name + "Id"
			, method : "put"
			, filters : [] //[ auth.requiresLogin , auth.hasAuthorization ]
			, render : function(req,res,controller){}
		}
		, destroy : {
			mapping : __map + "/:" + __name + "Id"
			, method : "del"
			, filters : [] //[ auth.requiresLogin , auth.hasAuthorization ]
			, render : function(req,res,controller){}
		}
	}
	return {
		model : function(name){
			if(!__models.hasOwnProperty(name))
				__loadModel(name);

			return __models[name];
		}
		, lib : function(name){
			if(!__requires.hasOwnProperty(name))
				__loadLibrary(name);

			return __requires[name];
		}
		, config : function(name){
			if(!__configs.hasOwnProperty(name))
				__loadConfig(name);

			return __configs[name];
		}
		, name : function() {
			return __name;
		}
		, import : function(array) {
			for (var i=0,j=array.length;i<j;i++)
				__loadLibrary(array[i]);
			return this;
		}
		, extend : function(obj) {
			_.merge(__routes,obj);
			return this;
		}
		, virtual : function(array){
			__virtuals = array;
			return this;
		}
		, apply : function(objs){
			for ( var filter in objs )
				__filters[filter] = objs[filter];
			return this;
		}
		, create : function() {

			for (var obj in __routes) {

				var obj = __routes[obj]
				, args = [];

				if(!obj.mapping) continue;

				args.push(obj.mapping);

				if(obj.filters){
					for(var n=0,m=obj.filters.length;n<m;n++)
						args.push(obj.filters[n]);
				}

				args.push(obj.render);

				app[ (obj.method ? obj.method : 'get') ].apply(app,args);

			};

			for (var obj in __virtuals) {

				var obj = __virtuals[obj]
				, args = [];

				if(!obj.mapping) continue;

				args.push(obj.mapping);

				if(obj.filters){
					for(var n=0,m=obj.filters.length;n<m;n++)
						args.push(obj.filters[n]);
				}

				if(!__routes.hasOwnProperty(obj.action)) continue;

				args.push(__routes[obj.action].render);

				app[ (obj.method ? obj.method : 'get') ].apply(app,args);

			};

			for (var filter in __filters)
				app.param(filter, __filters[filter])

		}
	}
}


module.exports = BaseController;