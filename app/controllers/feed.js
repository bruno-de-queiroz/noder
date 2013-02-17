module.exports = function(app,passport,auth){
	var controller = require("../abstracts/crudcontroller")
	, _ = require('lodash')
	, FeedsController = new controller("feed","Feed",app, {
		create : {
			render : function (req, res) {
				var Feed = FeedsController.model('Feed')
				, User = FeedsController.model('User')
				, feed = new Feed(req.body)
				, user = req.user

				console.log("Saving");

				feed.save(function (err) {
					if (err) throw new Error(app.locals.__('Error while saving feed'))

					User.findOne({ _id : req.user._id },function(err,user) {
						user.feeds.push(feed._id);

						user.save(function (err) {
							if (err) throw new Error(app.locals.__('Error while saving user'))
							res.redirect('/feeds/' + feed._id)
						})

						if(err)
							res.render('/feeds/add', {
								title: app.locals.__('New Feed')
								, feed: feed
								, pageName: "feeds-add"
								, errors: err.errors
							});
					});
				})
			}
		}
		, destroy : {
			render : function(req,res){
				var model = req[singular]
				model.remove(function(err){
					// req.flash('notice', 'Deleted successfully')
					res.redirect('/' + plural )
				})
			}
		}
	});
}