(function () {

    if (!window.console) console = {
        log: function () {
        }
    };

    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function (fn, scope) {
            'use strict';
            var i, len;
            for (i = 0, len = this.length; i < len; ++i) {
                if (i in this) {
                    fn.call(scope, this[i], i, this);
                }
            }
        };
    }

    CKEDITOR.plugins.add('slideshow', {
        // Translations, available at the end of this file, without extra requests
        //lang : [ 'en', 'fr' ],
        requires: 'contextmenu,fakeobjects',
        lang: 'ru',

        getSlideShowDialogCss: function () {
            return 'img.cke_slideShow' +
                '{' +
                'background-image: url(' + CKEDITOR.getUrl(this.path + 'images/placeholder.png') + ');' +
                'background-position: center center;' +
                'background-repeat: no-repeat;' +
                'background-color:Azure;' +
                'border: 1px solid #a9a9a9;' +
                'width: 100px;' +
                'height:100px;' +
                'margin: 5px;' +
                '}';
        },

        // Register the icons.
        icons: 'slideshow',

        onLoad: function () {
            // v4
            if (CKEDITOR.addCss)
                CKEDITOR.addCss(this.getSlideShowDialogCss());

        },

        // The plugin initialization logic goes inside this method.
        init: function (editor) {
            var lang = editor.lang.slideshow;



            allowed = '';
            allowed += ' html head title; style [media,type]; body (*)[id]; meta link [*]',
                allowed += '; img[*]{*}(*)';
            allowed += '; div[*]{*}(*)';
            allowed += '; script[*]{*}(*)';
            allowed += '; ul[*]{*}(*)';
            allowed += '; li[*]{*}(*)';

            editor.addCommand('slideshow', new CKEDITOR.dialogCommand('slideshowDialog', {
                allowedContent: allowed,
                requires: ['fakeobjects']
            }));

            editor.ui.addButton('Slideshow', {
                label: lang.insertSlideShow,
                command: 'slideshow',
                toolbar: 'insert',
                icon: this.path + 'icons/slideshow.png'
            });

            editor.on('load', function (evt) {
            });

            editor.on('doubleclick', function (evt) {
                var element = evt.data.element;
                if (element.is('img') && element.data('cke-real-element-type') == 'slideShow')
                    evt.data.dialog = 'slideshowDialog';
            });

            editor.on('instanceReady', function () {
            });


            if (editor.contextMenu) {
                editor.addMenuGroup('slideshowGroup');
                editor.addMenuItem('slideshowItem', {
                    label: lang.editSlideShow,
                    icon: this.path + 'icons/slideshow.png',
                    command: 'slideshow',
                    group: 'slideshowGroup'
                });

                editor.contextMenu.addListener(function (element, selection) {
                    if (element && element.is('img') && !element.isReadOnly()
                        && element.data('cke-real-element-type') == 'slideShow') {
                        //if ( element && element.is( 'img' ) && element.data( 'cke-real-element-type' ) == 'slideShow' ) {
                        editor.contextMenu.removeAll(); // this line removes all entries from the context menu
                        return {slideshowItem: CKEDITOR.TRISTATE_OFF};
                    } else {
                        return null;
                    }
                });
            }

            CKEDITOR.dialog.add('slideshowDialog', this.path + 'dialogs/slideshow.js');
            if (editor.addCss)
                editor.addCss(this.getSlideShowDialogCss());
            CKEDITOR.dtd.$empty['cke:source'] = 1;
            CKEDITOR.dtd.$empty['source'] = 1;
            editor.lang.fakeobjects.slideShow = lang.fakeObject;
        },

        afterInit: function (editor) {
            var dataProcessor = editor.dataProcessor,
                htmlFilter = dataProcessor && dataProcessor.htmlFilter,
                dataFilter = dataProcessor && dataProcessor.dataFilter;

            if (dataFilter) {
                dataFilter.addRules({
                    elements: {
                        div: function (realElement) {
                            if (realElement.attributes['class'] == 'slideshowPlugin') {
                                var fakeElement = editor.createFakeParserElement(realElement, 'cke_slideShow', 'slideShow', false),
                                    fakeStyle = fakeElement.attributes.style || '';
                                var imgSrc = CKEDITOR.getUrl('plugins/slideshow/images/placeholder.png');
                                var foundOne = false;
                                Array.prototype.forEach.call(realElement, function (node) {
                                    if (node.name == 'img') {
                                        if (!foundOne) {
                                            imgSrc = node.attributes.src;
                                            foundOne = true;
                                        }
                                    }
                                });
                                fakeStyle = fakeElement.attributes.style = fakeStyle + ' background-image:url("' + imgSrc + '"); ';
                                fakeStyle = fakeElement.attributes.style = fakeStyle + ' background-size:contain; ';
                                fakeStyle = fakeElement.attributes.style = fakeStyle + ' background-repeat:no-repeat; ';
                                fakeStyle = fakeElement.attributes.style = fakeStyle + ' background-position:center; ';
                                fakeStyle = fakeElement.attributes.style = fakeStyle + ' width:64px; ';
                                fakeStyle = fakeElement.attributes.style = fakeStyle + ' height:64px; ';
                                fakeStyle = fakeElement.attributes.style = fakeStyle + ' display:block; ';
                                fakeStyle = fakeElement.attributes.style = fakeStyle + ' border:1px solid black; ';

                                return fakeElement;
                            }
                        }
                    }
                }, {priority: 5, applyToAll: true});
            }
            if (htmlFilter) {
                htmlFilter.addRules({
                    elements: {
                        $: function (realElement) {
                        }
                    }
                });
            }
        }
    });
    if (CKEDITOR.skins) {
        ru = {slideshow: ru};
    }
})();
