var ArticleController = function(app,passport,auth){

	var controller = require("../abstracts/controller")
	, _ = require('lodash')
	, Articles = new controller("articles",app,passport,auth);

	Articles.import([ 'imager' ]).extend({
		add : {
			render : function(req, res){
				var Article = Articles.model('Article');

				res.render( Articles.name() + '/add', {
					title: app.locals.__('New Article')
					, pageName: Articles.name() + "-add"
					, article: new Article({})
				})
			}
		}
		, create : {
			render : function (req, res) {
				var Article = Articles.model('Article')
				, Imager = Articles.lib('imager')
				, imagerConfig = Articles.config('imager')
				, article = new Article(req.body)
				, imager = new Imager(imagerConfig, 'S3')


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
								res.redirect(Articles.name() + '/' + article._id)
							}
						})
					}, 'article')
			}
		}
		, edit : {
			render : function (req, res) {
				res.render( Articles.name() + '/edit', {
					title: app.locals.__('Edit %s',req.article.title)
					, pageName: Articles.name() + "-edit"
					, article: req.article
				})
			}
		}
		, update : {
			render : function(req, res){
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
			render : function(req, res){
				var article = req.article
				article.remove(function(err){
					// req.flash('notice', 'Deleted successfully')
					res.redirect('/' + Articles.name())
				})
			}
		}
		, index : {
			render : function(req, res){
				var Article = Articles.model('Article')

				, perPage = 5
				, page = req.param('page') > 0 ? req.param('page') : 0

				Article
					.find({})
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
