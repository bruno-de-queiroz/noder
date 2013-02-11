var CommentController = function(app,passport,auth){

	var controller = require("../abstracts/controller")
	, _ = require('lodash')
	, Comments = new controller("comments",app,passport,auth);

	Comments.extend({
		create : {
			mapping: '/articles/:articlesId/comments'
			, render : function (req, res) {
				var Comment = Comments.model('Comment')
				, comment = new Comment(req.body)
				, article = req.article

				comment._user = req.user

				comment.save(function (err) {
					if (err) throw new Error(app.locals.__('Error while saving comment'))
						article.comments.push(comment._id)
					article.save(function (err) {
						if (err) throw new Error(app.locals.__('Error while saving article'))
							res.redirect('/articles/'+article.id+'#comments')
					})
				})
			}
		}
	}).create();
}

module.exports = CommentController