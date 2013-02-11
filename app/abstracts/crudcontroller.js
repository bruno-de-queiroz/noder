var auth = require('../../config/middlewares/authorization')
	, _ = require("lodash")
	, helpers = require('../../lib/helpers')
	, Controller = require("../../lib/controller")
	, CrudController = new Class({
		Extends : Controller
		, constructors : function() {
			//Defining Overloads
			return {
				"String,String,Function" : function(name,model,app) {
					this.name = name;
					this.baseModel = mongoose.model(model);
					this.app = app;
				}
				, "String,String,Function,Object" : function(name,model,app,routes) {
					this.name = name;
					this.baseModel = mongoose.model(model);
					this.app = app;
					this.routes = routes
				}
				, "String,String,Function,Object,Array" : function(name,model,app,routes,virtuals) {
					this.name = name;
					this.baseModel = mongoose.model(model);
					this.app = app;
					this.routes = routes
					this.virtuals = virtuals
				}
				, "String,String,Function,Object,Object" : function(name,model,app,routes,filters) {
					this.name = name;
					this.baseModel = mongoose.model(model);
					this.app = app;
					this.routes = routes
					this.filters = filters
				}
				, "String,String,Function,Object,Object,Array" : function(name,model,app,routes,filters,virtuals) {
					this.name = name;
					this.baseModel = mongoose.model(model);
					this.app = app;
					this.routes = routes
					this.filters = filters
					this.virtuals = virtuals
				}
			}
		}.protect()
		, setup : function (){

			//Calling Super
			this.parent();

			//Defining Defaults
			var self = this
			, baseModel = this.baseModel
			, lang = self.app.locals.__
			, singular = this.name
			, capital = helpers.capitalize(this.name)
			, plural = helpers.pluralize(this.name)
			, idparam = singular + "Id"
			, routes = {}
			, filters = {}

			routes = {
				index : {
					mapping : "/" + plural
					, method : "get"
					, filters : []
					, render : function(req,res){
						var perPage = 5
						, page = req.param('page') > 0 ? req.param('page') : 0

						baseModel
							.find({})
							.sort({'createdAt': -1}) // sort by date
							.limit(perPage)
							.skip(perPage * page)
							.exec(function(err, results) {
								if (err) return res.render('500')
								baseModel.count().exec(function (err, count) {
									var data = {};
									
									data.title = lang('List of %s',capital);
									data[plural] = results;
									data.pageName = plural + "-index";
									data.page = page;
									data.pages = count / perPage;

									res.render(plural + '/index',data)
								})
						})
					}
				}
				, add : {
					mapping : "/" + plural + "/add"
					, method : "get"
					, filters : [ auth.requiresLogin ]
					, render : function(req,res){
						var data = {};
							
						data.title = lang('New '+ capital)
						data[singular] = new baseModel({})
						data.pageName = plural + "-add";

						res.render( plural + '/add', data);
					}
				}
				, create : {
					mapping : "/" + plural + "/add"
					, method : "post"
					, filters : [ auth.requiresLogin ]
					, render : function(req,res){
						var model = new baseModel(req.body),
							data = {};

						model.save(function(err){
							if (err) {

								data.errors = err.errors;
								data.title = lang('New %s', capital);
								data[singular] = model;
								data.pageName = plural + "-add";

								res.render( plural + '/add', data)
							}
							else {
								res.redirect( "/" + plural + '/' + model._id)
							}
						})
					}
				}
				, view : {
					mapping : "/" + plural + "/:" + idparam
					, method : "get"
					, filters : []
					, render : function(req,res){
						var data = {}

						data.title = lang('View %s',capital);
						data[singular] = req[singular];
						data.pageName = plural + "-view";

						res.render( plural + '/view', data)
					}
				}
				, edit : {
					mapping : "/" + plural + "/:" + idparam +"/edit"
					, method : "get"
					, filters : [ auth.requiresLogin , auth.hasAuthorization ]
					, render : function(req,res){
						var data  = {}

						data.title = lang('Edit %s',req[singular].title)
						data[singular] = req[singular]
						data.pageName = plural + "-edit";
						res.render( plural + '/edit', data)
					}
				}
				, update : {
					mapping : "/" + plural + "/:" + idparam
					, method : "put"
					, filters : [ auth.requiresLogin , auth.hasAuthorization ]
					, render : function(req,res){
						var model = req[singular];

						model = _.merge(model, req.body)

						model.save(function(err, doc) {
							if (err) {
								var data = {};
								data.errors = err.errors;
								data.title = lang('Edit %s',capital);
								data[singular] = model;
								data.pageName = plural + "-edit";

								res.render( plural + '/edit', data);
							}
							else {
								res.redirect('/'+ plural + '/'+ model._id)
							}
						})

					}
				}
				, destroy : {
					mapping : "/" + plural + "/:" + idparam
					, method : "del"
					, filters : [ auth.requiresLogin , auth.hasAuthorization ]
					, render : function(req,res){
						var model = req[singular]
						model.remove(function(err){
							// req.flash('notice', 'Deleted successfully')
							res.redirect('/' + plural )
						})
					}
				}
			}
			filters[idparam] = function(req, res, next, id){
				baseModel
					.findOne({ _id : id })
					.exec(function (err, model) {
						if (err) return next(err)
						if (!model) return next(new Error(lang('Failed to load %s' , singular + ": " + id)))
							req[singular] = model
							next()
					})
			}

			_.merge(this.routes,routes);
			_.merge(this.filters,filters);
		}
	})

module.exports = CrudController