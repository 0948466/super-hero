$ ->
  if $('.ckeditor').length
    CKEDITOR.editorConfig = (config) ->
      config.language = 'ru'
      config.startupOutlineBlocks = true
      config.forcePasteAsPlainText = true
      config.filebrowserBrowseUrl = '/ckeditor/attachment_files'
      config.filebrowserFlashBrowseUrl = '/ckeditor/attachment_files'
      config.filebrowserFlashUploadUrl = '/ckeditor/attachment_files'
      config.filebrowserImageBrowseLinkUrl = '/ckeditor/pictures'
      config.filebrowserImageBrowseUrl = '/ckeditor/pictures'
      config.filebrowserImageUploadUrl = '/ckeditor/pictures?'
      config.filebrowserUploadUrl = '/ckeditor/attachment_files'
      config.allowedContent = true
#      config.extraPlugins = 'youtube,html5audio,videodetector,slideshow,image2'
      config.extraPlugins = 'youtube,slideshow,image2'
      config.removePlugins = "removeformat,subscript,cut,copy,paste,undo,redo,anchor,strike,subscript,superscript,iframe,flash,specialchar,anchor,horizontalrule,div,find,table,tabletools,tableselection,wsc,scayt,bidi,language,forms,elementspath,save,font,print,smiley,pagebreak,stylescombo,about,preview,templates,newpage"
      config.format_tags = 'p;h2';
      config.removeButtons = 'Cut,Copy,Paste,Undo,Redo,Anchor,Strike,Subscript,Superscript,Iframe,Flash,SpecialChar,Anchor,HorizontalRule,Outdent,Indent,JustifyCenter,JustifyRight,JustifyBlock,NumberedList,PasteFromWord,Paste,SelectAll,RemoveFormat,CopyFormatting';
      config.clipboard_defaultContentType = 'text';

#      config.toolbarGroups = [
#        { name: 'document',	   groups: [ 'mode' ] },
#        { name: 'clipboard',   groups: [ 'clipboard'] },
#        { name: 'basicstyles'},
#        { name: 'styles' },
#        { name: 'colors' },
#        { name: 'paragraph'},
#        { name: 'links' },
#        { name: 'insert' },
#      ];

      config.image2_altRequired = true;
      config.image2_prefillDimensions = false;
