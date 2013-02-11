var moment = require("moment"),
	helpers = {
		locale: "en",
		setLocale : function(value) {
			locale = value;
  			moment.lang(locale);
		},
		getLocale : function() {
			return locale;
		},
		floatToMoney : function(num) {
			x = 0;
			if(num<0){
				num = Math.abs(num);
				x = 1;
			}
			if(isNaN(num)) num = "0";
			cents = Math.floor((num*100+0.5)%100);
			num = Math.floor((num*100+0.5)/100).toString();
			if(cents < 10) cents = "0" + cents;
			for(var i = 0; i < Math.floor((num.length-(1+i))/3); i++) num = num.substring(0,num.length-(4*i+3))+'.'+num.substring(num.length-(4*i+3));
			ret = num + ',' + cents;
			if (x == 1) ret = ' - ' + ret;
			return ret;
		},
		moneyToFloat : function(str) {
			return parseFloat(str.replace(/\./gm,'').replace(',','.'));
		},
		removeSpecialChars : function(value){
			var blackList = 'áàãâäéèêëíìîïóòõôöúùûüç',
			whiteList = 'aaaaaeeeeiiiiooooouuuuc',
			result = '';
			for (var i=0; i < value.length;i++) {
				if (blackList.indexOf(value.charAt(i))!=-1) {
					result += whiteList.substr(blackList.search(value.substr(i,1)),1);
				} else {
					result += value.substr(i,1);
				}
			}
			return result;
		},
		dateFormat: function(date){
			return moment(date).fromNow();
		}
}

/**
 * Pagination helper
 *
 * @param {Number} pages
 * @param {Number} page
 * @return {String}
 * @api private
 */

function createPagination (req) {
  return function createPagination (pages, page) {
    var url = require('url')
      , qs = require('querystring')
      , params = qs.parse(url.parse(req.url).query)
      , str = ''

    params.page = 0
    var clas = page == 0 ? "active" : "no"
    str += '<li class="'+clas+'"><a href="?'+qs.stringify(params)+'">First</a></li>'
    for (var p = 1; p < pages; p++) {
      params.page = p
      clas = page == p ? "active" : "no"
      str += '<li class="'+clas+'"><a href="?'+qs.stringify(params)+'">'+ p +'</a></li>'
    }
    params.page = --p
    clas = page == params.page ? "active" : "no"
    str += '<li class="'+clas+'"><a href="?'+qs.stringify(params)+'">Last</a></li>'

    return str
  }
}

/**
 * Strip script tags
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function stripScript (str) {
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}

module.exports = function (config,i18n) {
	
  return function (req, res, next) {
  	helpers.setLocale(i18n.getLocale());

	res.locals.appName = config.app.name;
	res.locals.title = 'Noder';
	res.locals.req = req;
	res.locals.helpers = helpers;
    res.locals.isActive = function (link) {
      return req.url === link ? 'active' : ''
    }
    res.locals.stripScript = stripScript
    res.locals.createPagination = createPagination(req)
    res.locals.__d = helpers.dateFormat
	next();
  }
}