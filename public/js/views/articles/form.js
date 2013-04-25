(function($) {
	$('#desc').wysiwyg({
		rmUnusedControls: true,
		iframeClass: 'scrolable',
		html: '<!DOCTYPE html><html><head><link href="/css/libs/jwysiwyg/jquery.wysiwyg.content.css" media="all" rel="stylesheet" type="text/css"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head><body style="margin:0;">INITIAL_CONTENT</body></html>',
		initialContent: "<h1 class='placeholder'>"+$('#desc').attr("placeholder")+"</h1>",
		css : "/css/libs/mCustomScrollbar/jquery.mCustomScrollbar.css",
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
	$("button[type=submit]").bind("click",function(e){
		e.preventDefault();
		var form = $(this).parents("form"),
			fieldset = form.find("fieldset#hidden");

		fieldset.show("fast",function() {
			fieldset.find("button[type=button]").click(function(e){
				e.preventDefault();
				form.submit();
			})
		})
	})
})(jQuery);

