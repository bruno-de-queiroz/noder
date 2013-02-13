module.exports = function(app,passport,auth){
	var controller = require("../abstracts/crudcontroller")
	, _ = require('lodash')
	, FeedsController = new controller("feed","Feed",app);
}