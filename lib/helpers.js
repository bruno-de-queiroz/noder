var rules = [
	[/(m)an$/gi, '$1en'],
	[/(pe)rson$/gi, '$1ople'],
	[/(child)$/gi, '$1ren'],
	[/^(ox)$/gi, '$1en'],
	[/(ax|test)is$/gi, '$1es'],
	[/(octop|vir)us$/gi, '$1i'],
	[/(alias|status)$/gi, '$1es'],
	[/(bu)s$/gi, '$1ses'],
	[/(buffal|tomat|potat)o$/gi, '$1oes'],
	[/([ti])um$/gi, '$1a'],
	[/sis$/gi, 'ses'],
	[/(?:([^f])fe|([lr])f)$/gi, '$1$2ves'],
	[/(hive)$/gi, '$1s'],
	[/([^aeiouy]|qu)y$/gi, '$1ies'],
	[/(x|ch|ss|sh)$/gi, '$1es'],
	[/(matr|vert|ind)ix|ex$/gi, '$1ices'],
	[/([m|l])ouse$/gi, '$1ice'],
	[/(quiz)$/gi, '$1zes'],
	[/s$/gi, 's'],
	[/$/gi, 's']
]
, uncountables = [
	'advice',
	'energy',
	'excretion',
	'digestion',
	'cooperation',
	'health',
	'justice',
	'labour',
	'machinery',
	'equipment',
	'information',
	'pollution',
	'sewage',
	'paper',
	'money',
	'species',
	'series',
	'rain',
	'rice',
	'fish',
	'sheep',
	'moose',
	'deer',
	'news',
	'expertise',
	'status',
	'media'
]
, helpers = {
	capitalize : function(str){
		return str.charAt(0).toUpperCase() + str.substr(1,str.length-1)
	}
	, pluralize : function(str){
		var rule, found;
		if (!~uncountables.indexOf(str.toLowerCase())){
			found = rules.filter(function(rule){
				return str.match(rule[0]);
			});
			if (found[0]) return str.replace(found[0][0], found[0][1]);
		}
		return str;
	}
}

module.exports = helpers