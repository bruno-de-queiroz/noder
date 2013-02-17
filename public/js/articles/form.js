(function($) {
	$(document).ready(function() {
		$('#desc').wysiwyg({
			rmUnusedControls: true,
			placeholder : "START WRITING HERE",
			css : "http://localhost:3000/css/libs/jwysiwyg/jquery.wysiwyg.content.css",
			controls: {
				bold: { visible : true },
				italic: { visible : true },
				underline: { visible : true },
				strikeThrough: { visible : true },
				h1: { visible : true },
				h2: { visible : true },
				h3: { visible : true },
				justifyLeft: { visible : true },
				justifyCenter: { visible : true },
				justifyRight: { visible : true },
				justifyFull: { visible: true },
				insertUnorderedList: { visible: true },
				insertOrderedList: { visible: true },
				createLink: { visible: true },
				insertImage: { visible: true },
				removeFormat: { visible : true },
				html : { visible: true }
			}
		});
	});
})(jQuery);