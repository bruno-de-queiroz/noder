var ArticleController = function(app,passport,auth){

	var controller = require("../abstracts/controller")
	, _ = require('lodash')
	, async = require('async')
	, inspect = require('util').inspect
	, Articles = new controller("articles",app,passport,auth)

	Articles.import([ 'imager' ]).extend({
		add : {
			filters : [ auth.requiresLogin ]
			, render : function(req, res){
				var Article = Articles.model('Article');

				console.log("Fetching feeds async");
				mediator.publish("feeds",{ action : "fetch" , feeds: req.user.feeds });

				res.render( Articles.name() + '/add', {
					title: app.locals.__('New Article')
					, pageName: Articles.name() + "-add"
					, article: new Article({})
				})
			}
		}
		, create : {
			filters : [ auth.requiresLogin ]
			, render : function (req, res) {
				var Article = Articles.model('Article')
				, User = Articles.model('User')
				, Imager = Articles.lib('imager')
				, imagerConfig = Articles.config('imager')
				, article = new Article(req.body)
				, imager = new Imager(imagerConfig, 'S3');


				article.user = req.user

				imager.upload(req.files.image, function (err, cdnUri, files) {
					if (err) return res.render('400')
						if (files.length) {
							article.image = { cdnUri : cdnUri, files : files }
						}
						article.save(function(err){
							if (err) {
								res.render(Articles.name() + '/add', {
									title: app.locals.__('New Article')
									, article: article
									, pageName: Articles.name() + "-add"
									, errors: err.errors
								})
							}
							else {
								User.findOne({ _id : req.user._id },function(err,user) {
									user.articles.push(article._id);

									user.save(function (err) {
										if (err) throw new Error(app.locals.__('Error while saving user'))
										res.redirect(Articles.name() + '/' + article._id)
									})

									if(err)
										res.render(Articles.name() + '/add', {
											title: app.locals.__('New Article')
											, article: article
											, pageName: Articles.name() + "-add"
											, errors: err.errors
										});
								});
							}
						})
					}, 'article')
			}
		}
		, edit : {
			filters : [ auth.requiresLogin , auth.hasAuthorization ]
			, render : function (req, res) {
				res.render( Articles.name() + '/edit', {
					title: app.locals.__('Edit %s',req.article.title)
					, pageName: Articles.name() + "-edit"
					, article: req.article
				})
			}
		}
		, update : {
			filters : [ auth.requiresLogin , auth.hasAuthorization ]
			, render : function(req, res){
				var article = req.article;

				article = _.extend(article, req.body)

				article.save(function(err, doc) {
					if (err) {
						res.render( Articles.name() + '/edit', {
							title: app.locals.__('Edit Article')
							, article: article
							, pageName: Articles.name() + "-edit"
							, errors: err.errors
						})
					}
					else {
						res.redirect('/'+ Articles.name() + '/'+ article._id)
					}
				})
			}
		}
		, view : {
			render : function(req, res){
				res.render( Articles.name() + '/show', {
					title: req.article.title
					, article: req.article
					, pageName: Articles.name() + "-view"
					, comments: req.comments
				})
			}
		}
		, destroy : {
			filters : [ auth.requiresLogin , auth.hasAuthorization ]
			, render : function(req, res){
				var User = Articles.model("User")
				, article = req.article;
				console.log(article.user);
				User.findOne({ _id : article.user }).populate("articles","_id").exec(function(err,user) {
					for(var i=0,j=user.articles.length;i<j;i++)
						if(user.articles[i]._id == article._id)
							user.articles.slice(i,1);

					user.save(function(err){
						if(err)
							throw new Error(app.locals.__('Error while removing article from user'))

						article.remove(function(err){
							// req.flash('notice', 'Deleted successfully')
							res.redirect('/' + Articles.name())
						})
					})
				});
			}
		}
		, index : {
			mapping : "/articles"
			, method : "get"
			, filters : [ auth.requiresLogin , auth.hasAuthorization ]
			, render : function(req, res){
				var Article = Articles.model('Article')

				, perPage = 5
				, page = req.param('page') > 0 ? req.param('page') : 0

				Article
					.find({ user : req.user._id })
					.populate('user', 'name')
					.sort({'createdAt': -1}) // sort by date
					.limit(perPage)
					.skip(perPage * page)
					.exec(function(err, articles) {
						if (err) return res.render('500')
						Article.count().exec(function (err, count) {
							res.render(Articles.name() + '/index', {
								title: app.locals.__('List of Articles')
								, articles: articles
								, pageName: Articles.name() + "-index"
								, page: page
								, pages: count / perPage
							})
						})
				})
			}
		}
	}).apply({
		articlesId : function(req, res, next, id){
			var Article = Articles.model('Article'),
				User = Articles.model('User'),
				async = Articles.lib('async');

			Article
			.findOne({ _id : id })
			.populate('user', 'name')
			.populate('comments')
			.exec(function (err, article) {
				if (err) return next(err)
				if (!article) return next(new Error(app.locals.__('Failed to load article %s' , id)))
					req.article = article

				var populateComments = function (comment, cb) {
					User
					.findOne({ _id: comment._user })
					.select('name')
					.exec(function (err, user) {
						if (err) return next(err)
							comment.user = user
						cb(null, comment)
					})
				}

				if (article.comments.length) {
					async.map(req.article.comments, populateComments, function (err, results) {
						next(err)
					})
				}
				else
					next()
			})
		}
	}).create();
}

module.exports = ArticleController
