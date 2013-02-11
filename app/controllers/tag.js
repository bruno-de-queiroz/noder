var TagController = function(app,passport,auth){

	var controller = require("../abstracts/controller")
	, _ = require('lodash')
	, Tags = new controller("tags",app,passport,auth);

	Tags.extend({
		index : {
			mapping: '/tags/:tag'
			, render : function (req, res) {
				var Article = Tags.model('Article')
				, perPage = 5
				, page = req.param('page') > 0 ? req.param('page') : 0

				Article
					.find({ tags: req.param('tag') })
					.populate('user', 'name')
					.sort({'createdAt': -1}) // sort by date
					.limit(perPage)
					.skip(perPage * page)
					.exec(function(err, articles) {
						if (err) return res.render('500')
						Article.count({ tags: req.param('tag') }).exec(function (err, count) {
							res.render('articles/index', {
								title: app.locals.__('List of Articles')
								, articles: articles
								, page: page
								, pages: count / perPage
							})
						})
					});
			}
		}
	}).create();
}

module.exports = TagController