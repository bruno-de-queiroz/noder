var async = require('async')
, prefix = ''
, view_path = '/';

module.exports = function(app,passport,auth) {

	var index = function(req,res){
		res.redirect('/articles');
	};

	app.get("/"+prefix,index);

}