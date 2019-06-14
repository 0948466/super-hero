function removeDomainFromUrl(string) {
    "use strict";
    return string.replace(/^https?:\/\/[^\/]+/i, '');
}

var IMG_PARAM = {URL: 0, TITLE: 1, ALT: 2, WIDTH: 3, HEIGHT: 4},
    BASE_PATH = removeDomainFromUrl(CKEDITOR.basePath);


var iFrameItem = function (node) {
    "use strict";
    return node.type == CKEDITOR.NODE_ELEMENT && node.is('iframe');
};

Array.prototype.pushUnique = function (item) {
    "use strict";
    var i;
    for (i = 0; i < this.length; i += 1) {
        if (this[i][0] == item[0]) {
            return -1;
        }
    }
    this.push(item);
    return this.length - 1;
};

Array.prototype.updateVal = function (item, data) {
    "use strict";
    var i;
    for (i = 0; i < this.length; i += 1) {
        if (this[i][0] == item) {
            this[i] = [item, data];
            return true;
        }
    }
    this[i] = [item, data];
    return false;
};

Array.prototype.getVal = function (item) {
    "use strict";
    var i;
    for (i = 0; i < this.length; i += 1) {
        if (this[i][0] == item) {
            return this[i][1];
        }
    }
    return null;
};


// Our dialog definition.
CKEDITOR.dialog.add('slideshowDialog', function (editor) {
    "use strict";
    var lang = editor.lang.slideshow;

//----------------------------------------------------------------------------------------------------
// COMBO STUFF
//----------------------------------------------------------------------------------------------------
    // Add a new option to a CHKBOX object (combo or list).
    function addOption(combo, optionText, optionValue, documentObject, index) {
        combo = getSelect(combo);
        var oOption;
        if (documentObject) {
            oOption = documentObject.createElement("OPTION");
        } else {
            oOption = document.createElement("OPTION");
        }

        if (combo && oOption && oOption.getName() == 'option') {
            if (CKEDITOR.env.ie) {
                if (!isNaN(parseInt(index, 10))) {
                    combo.$.options.add(oOption.$, index);
                } else {
                    combo.$.options.add(oOption.$);
                }

                oOption.$.innerHTML = optionText.length > 0 ? optionText : '';
                oOption.$.value = optionValue;
            } else {
                if (index !== null && index < combo.getChildCount()) {
                    combo.getChild(index < 0 ? 0 : index).insertBeforeMe(oOption);
                } else {
                    combo.append(oOption);
                }

                oOption.setText(optionText.length > 0 ? optionText : '');
                oOption.setValue(optionValue);
            }
        } else {
            return false;
        }
        return oOption;
    }


    //Modify option  from a CHKBOX object.
    function modifyOption(combo, index, title, value) {
        combo = getSelect(combo);
        if (index < 0) {
            return false;
        }
        var child = combo.getChild(index);
        child.setText(title);
        child.setValue(value);
        return child;
    }

    function removeAllOptions(combo) {
        combo = getSelect(combo);
        while (combo.getChild(0) && combo.getChild(0).remove()) { /*jsl:pass*/
        }
    }

    // Moves the selected option by a number of steps (also negative).
    function changeOptionPosition(combo, steps, documentObject, dialog) {
        combo = getSelect(combo);
        var iActualIndex = getSelectedIndex(combo);
        if (iActualIndex < 0) {
            return false;
        }

        var iFinalIndex = iActualIndex + steps;
        iFinalIndex = ( iFinalIndex < 0 ) ? 0 : iFinalIndex;
        iFinalIndex = ( iFinalIndex >= combo.getChildCount() ) ? combo.getChildCount() - 1 : iFinalIndex;

        if (iActualIndex == iFinalIndex) {
            return false;
        }

        var re = /(^IMG_\d+)/;
        // Modify sText in final index
        var oOption = combo.getChild(iFinalIndex),
            sText = oOption.getText(),
            sValue = oOption.getValue();
        sText = sText.replace(re, "IMG_" + iActualIndex);
        modifyOption(combo, iFinalIndex, sText, sValue);

        // do the move
        oOption = combo.getChild(iActualIndex);
        sText = oOption.getText();
        sValue = oOption.getValue();
        oOption.remove();
        sText = sText.replace(re, "IMG_" + iFinalIndex);
        oOption = addOption(combo, sText, sValue, ( !documentObject ) ? null : documentObject, iFinalIndex);
        setSelectedIndex(combo, iFinalIndex);

        // update dialog.imagesList
        var valueActual = dialog.imagesList[iActualIndex];
        var valueFinal = dialog.imagesList[iFinalIndex];
        dialog.imagesList[iActualIndex] = valueFinal;
        dialog.imagesList[iFinalIndex] = valueActual;

        return oOption;
    }

    function getSelectedIndex(combo) {
        combo = getSelect(combo);
        return combo ? combo.$.selectedIndex : -1;
    }

    function setSelectedIndex(combo, index) {
        combo = getSelect(combo);
        if (index < 0) {
            return null;
        }

        var count = combo.getChildren().count();
        combo.$.selectedIndex = ( index >= count ) ? ( count - 1 ) : index;
        return combo;
    }

    function getOptions(combo) {
        combo = getSelect(combo);
        return combo ? combo.getChildren() : false;
    }

    function getSelect(obj) {
        if (obj && obj.domId && obj.getInputElement().$) {
            return obj.getInputElement();
        } else if (obj && obj.$) {
            return obj;
        }
        return false;
    }

    function unselectAll(dialog) {
        var editBtn = dialog.getContentElement('slideshowinfoid', 'editselectedbtn');
        var deleteBtn = dialog.getContentElement('slideshowinfoid', 'removeselectedbtn');
        editBtn = getSelect(editBtn);
        editBtn.hide();
        deleteBtn = getSelect(deleteBtn);
        deleteBtn.hide();
        var comboList = dialog.getContentElement('slideshowinfoid', 'imglistitemsid');
        comboList = getSelect(comboList);
        var i;
        for (i = comboList.getChildren().count() - 1; i >= 0; i -= 1) {
            comboList.getChild(i).$.selected = false;
        }
    }

    function unselectIfNotUnique(combo) {
        var dialog = combo.getDialog();
        var selectefItem = null;
        combo = getSelect(combo);
        var cnt = 0;
        var editBtn = dialog.getContentElement('slideshowinfoid', 'editselectedbtn');
        var deleteBtn = dialog.getContentElement('slideshowinfoid', 'removeselectedbtn');
        var i, child;
        for (i = combo.getChildren().count() - 1; i >= 0; i -= 1) {
            child = combo.getChild(i);
            if (child.$.selected) {
                cnt++;
                selectefItem = child;
            }
        }
        if (cnt > 1) {
            unselectAll(dialog);
            return null;
        } else if (cnt == 1) {
            editBtn = getSelect(editBtn);
            editBtn.show();
            deleteBtn = getSelect(deleteBtn);
            deleteBtn.show();
            displaySelected(dialog);
            return selectefItem;
        }
        return null;
    }

    function displaySelected(dialog) {
        if (dialog.openCloseStep == true) {
            return;
        }
        var previewCombo = dialog.getContentElement('slideshowinfoid', 'framepreviewid');
        if (previewCombo.isVisible()) {
            previewSlideShow(dialog);
        } else {
            editeSelected(dialog);
        }
    }

    function selectFirstIfNotUnique(combo) {
        var dialog = combo.getDialog();
        combo = getSelect(combo);
        var firstSelectedInd = 0;
        var i, child, selectefItem;
        for (i = 0; i < combo.getChildren().count(); i += 1) {
            child = combo.getChild(i);
            if (child.$.selected) {
                selectefItem = child;
                firstSelectedInd = i;
                break;
            }
        }
        setSelectedIndex(combo, firstSelectedInd);
        displaySelected(dialog);
    }

    function getSlectedIndex(dialog) {
        var combo = dialog.getContentElement('slideshowinfoid', 'imglistitemsid');
        return getSelectedIndex(combo);
    }

//----------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------

    function removePlaceHolderImg(dialog) {
        var urlPlaceHolder = BASE_PATH + 'plugins/slideshow/images/placeholder.png';
        if ((dialog.imagesList.length == 1) && (dialog.imagesList[0][IMG_PARAM.URL] == urlPlaceHolder)) {
            // Remove the place Holder Image
            var combo = dialog.getContentElement('slideshowinfoid', 'imglistitemsid');
            combo = getSelect(combo);
            var i = 0;
            // Remove image from image Array
            dialog.imagesList.splice(i, 1);
            // Remove image from combo image list
            combo.getChild(i).remove();
        }
    }

    function updateImgList(dialog) {
        removePlaceHolderImg(dialog);
        var preview = dialog.previewImage;
        var url = preview.$.src;
        var ratio = preview.$.width / preview.$.height;
        var w = 50;
        var h = 50;
        if (ratio > 1) {
            h = h / ratio;
        } else {
            w = w * ratio;
        }
        var oOption;
        var combo = dialog.getContentElement('slideshowinfoid', 'imglistitemsid');
        var ind = dialog.imagesList.pushUnique([url, '', '', w.toFixed(0), h.toFixed(0)]);
        if (ind >= 0) {
            oOption = addOption(combo, 'IMG_' + ind + ' : ' + url.substring(url.lastIndexOf('/') + 1), url, dialog.getParentEditor().document);
            // select index 0
            setSelectedIndex(combo, ind);
            // Update dialog
            displaySelected(dialog);
        }
    }

    function editeSelected(dialog) {
        var combo = dialog.getContentElement('slideshowinfoid', 'imglistitemsid');
        var iSelectedIndex = getSelectedIndex(combo);
        var value = dialog.imagesList[iSelectedIndex];

        combo = dialog.getContentElement('slideshowinfoid', 'imgtitleid');
        combo = getSelect(combo);
        combo.setValue(value[1]);
        combo = dialog.getContentElement('slideshowinfoid', 'imgdescid');
        combo = getSelect(combo);
        combo.setValue(value[2]);
        combo = dialog.getContentElement('slideshowinfoid', 'imgpreviewid');
        combo = getSelect(combo);
        //console.log( "VALUE IMG -> " +  value[iSelectedIndex] );
        var imgHtml = '<div style="text-align:center;"> <img src="' + value[0] +
            '" title="' + value[1] +
            '" alt="' + value[2] +
            '" style=" max-height: 200px;  max-width: 350px;' + '"> </div>';
        combo.setHtml(imgHtml);
        var previewCombo = dialog.getContentElement('slideshowinfoid', 'framepreviewid');
        var imgCombo = dialog.getContentElement('slideshowinfoid', 'imgparamsid');
        previewCombo = getSelect(previewCombo);
        previewCombo.hide();
        imgCombo = getSelect(imgCombo);
        imgCombo.show();
    }

    function removeSelected(dialog) {
        var combo = dialog.getContentElement('slideshowinfoid', 'imglistitemsid');
        combo = getSelect(combo);
        var someRemoved = false;
        // Remove all selected options.
        var i;
        for (i = combo.getChildren().count() - 1; i >= 0; i--) {
            if (combo.getChild(i).$.selected) {
                // Remove image from image Array
                dialog.imagesList.splice(i, 1);
                // Remove image from combo image list
                combo.getChild(i).remove();
                someRemoved = true;
            }
        }
        if (someRemoved) {
            if (dialog.imagesList.length == 0) {
                var url = BASE_PATH + 'plugins/slideshow/images/placeholder.png';
                var oOption = addOption(combo, 'IMG_0' + ' : ' + url.substring(url.lastIndexOf('/') + 1), url, dialog.getParentEditor().document);
                dialog.imagesList.pushUnique([url, lang.imgTitle, lang.imgDesc, '50', '50']);
            }
            // select index 0
            setSelectedIndex(combo, 0);
            // Update dialog
            displaySelected(dialog);
        }
    }

    function upDownSelected(dialog, offset) {
        var combo = dialog.getContentElement('slideshowinfoid', 'imglistitemsid');
        combo = getSelect(combo);
        var iSelectedIndex = getSelectedIndex(combo);
        if (combo.getChildren().count() == 1) {
            return;
        }
        if ((offset == -1) && (iSelectedIndex == 0)) {
            return;
        }
        if ((offset == 1) && (iSelectedIndex == combo.getChildren().count() - 1)) {
            return;
        }
        //alert(iSelectedIndex+" / "+combo.getChildren().count() + " / "+ offset);
        changeOptionPosition(combo, offset, dialog.getParentEditor().document, dialog);

        updateFramePreview(dialog);
    }

    // To automatically get the dimensions of the poster image
    var onImgLoadEvent = function () {
        // Image is ready.
        var preview = this.previewImage;
        preview.removeListener('load', onImgLoadEvent);
        preview.removeListener('error', onImgLoadErrorEvent);
        preview.removeListener('abort', onImgLoadErrorEvent);
        //console.log( "previewImage -> " + preview );
        updateImgList(this);
    };

    var onImgLoadErrorEvent = function () {
        // Error. Image is not loaded.
        var preview = this.previewImage;
        preview.removeListener('load', onImgLoadEvent);
        preview.removeListener('error', onImgLoadErrorEvent);
        preview.removeListener('abort', onImgLoadErrorEvent);
    };

    function updateTitle(dialog, val) {
        dialog.imagesList[getSlectedIndex(dialog)][IMG_PARAM.TITLE] = val;
        editeSelected(dialog);
    }

    function updateDescription(dialog, val) {
        dialog.imagesList[getSlectedIndex(dialog)][IMG_PARAM.ALT] = val;
        editeSelected(dialog);
    }

    function previewSlideShow(dialog) {
        var previewCombo = dialog.getContentElement('slideshowinfoid', 'framepreviewid');
        var imgCombo = dialog.getContentElement('slideshowinfoid', 'imgparamsid');
        imgCombo = getSelect(imgCombo);
        imgCombo.hide();
        previewCombo = getSelect(previewCombo);
        previewCombo.show();
        updateFramePreview(dialog);
    }

    function feedFrame(frame, data) {
        frame.open();
        frame.writeln(data);
        frame.close();
    }


    function updateFramePreview(dialog) {
        var width = 436;
        var height = 300;
        if (dialog.params.getVal('showthumbid') == true) {
            height -= 120;
        } else if (dialog.params.getVal('showcontrolid') == true) {
            height -= 30;
        }
        if (dialog.imagesList.length == 0) {
            return;
        }
        var combo = dialog.getContentElement('slideshowinfoid', 'imglistitemsid');
        var iSelectedIndex = getSelectedIndex(combo);
        if (iSelectedIndex < 0) {
            iSelectedIndex = 0;
        }

        combo = dialog.getContentElement('slideshowinfoid', 'framepreviewid');

        var strVar = "";
        strVar += "<body>";
        var domGallery = createDOMdGalleryRun(dialog);
        strVar += domGallery.getOuterHtml();
        strVar += "<\/body>";
        strVar += "";

        combo = getSelect(combo);
        var theFrame = combo.getFirst(iFrameItem);
        if (theFrame) {
            theFrame.remove();
        }
        var ifr = null;

        var w = width + 60;
        var h = height;

        if (dialog.params.getVal('showthumbid') == true) {
            h += 120;
        } else if (dialog.params.getVal('showcontrolid') == true) {
            h += 30;
        }
        var iframe = CKEDITOR.dom.element.createFromHtml('<iframe' +
            ' style="width:' + w + 'px;height:' + h + 'px;background:azure; "' +
            ' class="cke_pasteframe"' +
            ' frameborder="10" ' +
            ' allowTransparency="false"' +
            ' role="region"' +
            ' scrolling="no"' +
            '></iframe>');

        iframe.setAttribute('name', 'totoFrame');
        iframe.setAttribute('id', 'totoFrame');
        iframe.on('load', function (event) {
            if (ifr != null) {
                return;
            }
            ifr = this.$;
            var iframedoc;
            if (ifr.contentDocument) {
                iframedoc = ifr.contentDocument;
            } else if (ifr.contentWindow) {
                iframedoc = ifr.contentWindow.document;
            }

            if (iframedoc) {
                feedFrame(iframedoc, strVar);
            } else {
                alert('Cannot inject dynamic contents into iframe.');
            }
        });
        combo.append(iframe);
    }

    function initImgListFromDOM(dialog, slideShowContainer) {
        var i, image, src;
        var imgW, imgH;
        var ratio, w, h, ind;
        var arr = slideShowContainer.$.getElementsByTagName("img");
        var combo = dialog.getContentElement('slideshowinfoid', 'imglistitemsid');
        for (i = 0; i < arr.length; i += 1) {
            image = arr[i];
            src = image.src;
            imgW = image.width;
            if (imgW == 0) {
                imgW = image.naturalWidth;
            }
            if (imgW == 0) {
                imgW = 50;
                imgH = 50;
            } else {
                imgH = image.height;
                if (imgH == 0) {
                    imgH = image.naturalHeight;
                }
                if (imgH == 0) {
                    imgW = 50;
                    imgH = 50;
                }
            }
            ratio = imgW / imgH;
            w = 50;
            h = 50;
            if (ratio > 1) {
                h = h / ratio;
            } else {
                w = w * ratio;
            }
            ind = dialog.imagesList.pushUnique([src, image.title, image.alt, w, h]);
            var oOption;
            if (ind >= 0) {
                oOption = addOption(combo, 'IMG_' + ind + ' : ' + src.substring(src.lastIndexOf('/') + 1), src, dialog.getParentEditor().document);
            }
        }
        setSelectedIndex(combo, 0);
        displaySelected(dialog);
    }

    function initImgListFromFresh(dialog) {
        var combo = dialog.getContentElement('slideshowinfoid', 'imglistitemsid');
        var url = BASE_PATH + 'plugins/slideshow/images/placeholder.png';
        var oOption = addOption(combo, 'IMG_0' + ' : ' + url.substring(url.lastIndexOf('/') + 1), url, dialog.getParentEditor().document);
        dialog.imagesList.pushUnique([url, lang.imgTitle, lang.imgDesc, '50', '50']);
        setSelectedIndex(combo, 0);
        displaySelected(dialog);
    }


    function commitSlideShow(dialog) {
        dialog.slideshowDOM.setAttribute('data-' + this.id, this.getValue());
    }

    function loadValue() {
        var dialog = this.getDialog();
        if (dialog.newSlideShowMode) {
            dialog.slideshowDOM.setAttribute('data-' + this.id, this.getValue());
            switch (this.type) {
                case 'checkbox':
                    break;
                case 'text':
                    break;
                case 'select':
                    break;
                default:
                    break;
            }
        } else {
            switch (this.type) {
                case 'checkbox':
                    this.setValue(dialog.slideshowDOM.getAttribute('data-' + this.id) == 'true');
                    break;
                case 'text':
                    this.setValue(dialog.slideshowDOM.getAttribute('data-' + this.id));
                    break;
                case 'select':
                    this.setValue(dialog.slideshowDOM.getAttribute('data-' + this.id));
                    break;
                default:
                    break;
            }
        }
    }

    function cleanAll(dialog) {
        if (dialog.previewImage) {
            dialog.previewImage.removeListener('load', onImgLoadEvent);
            dialog.previewImage.removeListener('error', onImgLoadErrorEvent);
            dialog.previewImage.removeListener('abort', onImgLoadErrorEvent);
            dialog.previewImage.remove();
            dialog.previewImage = null;		// Dialog is closed.
        }
        dialog.imagesList = null;
        dialog.params = null;
        dialog.slideshowDOM = null;
        var combo = dialog.getContentElement('slideshowinfoid', 'imglistitemsid');
        removeAllOptions(combo);
        dialog.openCloseStep = false;

    }

    function randomChars(len) {
        var chars = '';
        while (chars.length < len) {
            chars += Math.random().toString(36).substring(2);
        }
        return chars.substring(0, len);
    }

    var numbering = function (id) {
        return 'cke_' + randomChars(8) + '_' + id;
    };

    function getImagesContainerBlock(dialog, dom) {
        var obj = dom.getElementsByTag("ul");
        if (obj == null) {
            return null;
        }
        if (obj.count() == 1) {
            return obj.getItem(0);
        }
        return null;
    }


    function feedUlWithImages(dialog, ulObj) {
        var i, liObj, aObj, newImgDOM;
        for (i = 0; i < dialog.imagesList.length; i += 1) {
            liObj = ulObj.append('li');
            liObj.setAttribute('contenteditable', 'false');
            aObj = liObj.append('a');
            aObj.setAttribute('href', removeDomainFromUrl(dialog.imagesList[i][IMG_PARAM.URL]));
            aObj.setAttribute('contenteditable', 'false');
            newImgDOM = aObj.append('img');
            newImgDOM.setAttribute('src', removeDomainFromUrl(dialog.imagesList[i][IMG_PARAM.URL]));
            newImgDOM.setAttribute('title', dialog.imagesList[i][IMG_PARAM.TITLE]);
            newImgDOM.setAttribute('alt', dialog.imagesList[i][IMG_PARAM.ALT]);
            newImgDOM.setAttribute('contenteditable', 'false');
            newImgDOM.setAttribute('width', dialog.imagesList[i][IMG_PARAM.WIDTH]);
            newImgDOM.setAttribute('height', dialog.imagesList[i][IMG_PARAM.HEIGHT]);
        }
    }

    function createDOMdGalleryRun(dialog) {
        var slideshowid = dialog.params.getVal('slideshowid');
        var galleryId = 'ad-gallery_' + slideshowid;
        var displayThumbs = 'display: block;';
        var displayControls = 'display: block;';
        if (dialog.params.getVal('showthumbid') == false) {
            displayThumbs = 'display: none;';
        }
        if (dialog.params.getVal('showcontrolid') == false) {
            displayControls = 'visibility: hidden;';
        }
        var slideshowDOM = editor.document.createElement('div');
        slideshowDOM.setAttribute('id', slideshowid);
        slideshowDOM.setAttribute('class', 'slideshowPlugin');
        slideshowDOM.setAttribute('contenteditable', 'false');

        var galleryDiv = slideshowDOM.append('div');
        galleryDiv.setAttribute('class', 'ad-gallery');
        galleryDiv.setAttribute('contenteditable', 'false');
        galleryDiv.setAttribute('id', galleryId);

        var wrapperObj = galleryDiv.append('div');
        wrapperObj.setAttribute('class', 'ad-image-wrapper');
        wrapperObj.setAttribute('contenteditable', 'false');

        var controlObj = galleryDiv.append('div');
        controlObj.setAttribute('class', 'ad-controls');
        controlObj.setAttribute('contenteditable', 'false');
        controlObj.setAttribute('style', displayControls);

        var navObj = galleryDiv.append('div');
        navObj.setAttribute('class', 'ad-nav');
        navObj.setAttribute('style', displayThumbs);
        navObj.setAttribute('contenteditable', 'false');

        var thumbsObj = navObj.append('div');
        thumbsObj.setAttribute('class', 'ad-thumbs');
        thumbsObj.setAttribute('contenteditable', 'false');

        var ulObj = thumbsObj.append('ul');
        ulObj.setAttribute('class', 'ad-thumb-list');
        ulObj.setAttribute('contenteditable', 'false');

        feedUlWithImages(dialog, ulObj);
        return slideshowDOM;
    }

    function ClickOkBtn(dialog) {
        var extraStyles = {},
            extraAttributes = {};
        dialog.openCloseStep = true;
        dialog.commitContent(dialog);
        var slideshowDOM = createDOMdGalleryRun(dialog);
        var i;
        for (i = 0; i < dialog.params.length; i += 1) {
            slideshowDOM.data(dialog.params[i][0], dialog.params[i][1]);
        }
        if (dialog.imagesList.length) {
            extraStyles.backgroundImage = 'url("' + dialog.imagesList[0][IMG_PARAM.URL] + '")';
        }
        extraStyles.backgroundSize = 'contain';
        extraStyles.backgroundRepeat = 'no-repeat';
        extraStyles.backgroundPosition = 'center';
        extraStyles.display = 'block';
        extraStyles.width = '64px';
        extraStyles.height = '64px';
        extraStyles.border = '1px solid black';
        // Create a new Fake Image
        var newFakeImage = editor.createFakeElement(slideshowDOM, 'cke_slideShow', 'slideShow', false);
        newFakeImage.setAttributes(extraAttributes);
        newFakeImage.setStyles(extraStyles);

        if (dialog.fakeImage) {
            newFakeImage.replace(dialog.fakeImage);
            editor.getSelection().selectElement(newFakeImage);
        }
        else {
            editor.insertElement(newFakeImage);
        }

        cleanAll(dialog);
        dialog.hide();
        return true;
    }

    return {
        title: lang.dialogTitle,
        width: 500,
        height: 600,
        resizable: CKEDITOR.DIALOG_RESIZE_NONE,
        buttons: [
            CKEDITOR.dialog.okButton(editor, {
                label: 'OkCK',
                style: 'display:none;'
            }),
            CKEDITOR.dialog.cancelButton,

            {
                id: 'myokbtnid',
                type: 'button',
                label: 'OK',
                title: lang.validModif,
                accessKey: 'C',
                disabled: false,
                onClick: function () {
                    ClickOkBtn(this.getDialog());
                }
            }
        ],
        contents: [
            {
                id: 'slideshowinfoid',
                label: 'Basic Settings',
                align: 'center',
                elements: [
                    {
                        type: 'text',
                        id: 'id',
                        style: 'display:none;',
                        onLoad: function () {
                            this.getInputElement().setAttribute('readOnly', true);
                        }
                    },
                    {
                        type: 'text',
                        id: 'txturlid',
                        style: 'display:none;',
                        label: lang.imgList,
                        onChange: function () {
                            var dialog = this.getDialog(),
                                newUrl = this.getValue();
                            if (newUrl.length > 0) { //Prevent from load before onShow
                                var preview = dialog.previewImage;
                                preview.on('load', onImgLoadEvent, dialog);
                                preview.on('error', onImgLoadErrorEvent, dialog);
                                preview.on('abort', onImgLoadErrorEvent, dialog);
                                preview.setAttribute('src', newUrl);
                            }
                        }
                    },
                    {
                        type: 'button',
                        id: 'browse',
                        hidden: 'true',
                        style: 'display:inline-block;margin-top:0px;',
                        filebrowser:
                            {
                                action: 'Browse',
                                target: 'slideshowinfoid:txturlid',
                                url: editor.config.filebrowserImageBrowseUrl || editor.config.filebrowserBrowseUrl
                            },
                        label: lang.imgAdd
                    },
                    {
                        type: 'vbox',
                        align: 'center',
                        children: [
                            {
                                type: 'html',
                                align: 'center',
                                id: 'framepreviewtitleid',
                                style: 'font-family: Amaranth; color: #1E66EB;	font-size: 20px; font-weight: bold;',
                                html: lang.previewMode
                            },
                            {
                                type: 'html',
                                id: 'framepreviewid',
                                align: 'center',
                                style: 'width:500px;height:320px',
                                html: ''
                            },
                            {
                                type: 'hbox',
                                id: 'imgparamsid',
                                style: 'display:none;width:500px;',
                                height: '325px',
                                children:
                                    [
                                        {
                                            type: 'vbox',
                                            align: 'center',
                                            width: '400px',
                                            children:
                                                [
                                                    {
                                                        type: 'text',
                                                        id: 'imgtitleid',
                                                        label: lang.imgTitle,
                                                        onChange: function () {
                                                            updateTitle(this.getDialog(), this.getValue());
                                                        },
                                                        onBlur: function () {
                                                            updateTitle(this.getDialog(), this.getValue());
                                                        }
                                                    },
                                                    {
                                                        type: 'text',
                                                        id: 'imgdescid',
                                                        label: lang.imgDesc,
                                                        onChange: function () {
                                                            updateDescription(this.getDialog(), this.getValue());
                                                        },
                                                        onBlur: function () {
                                                            updateDescription(this.getDialog(), this.getValue());
                                                        }
                                                    },
                                                    {
                                                        type: 'html',
                                                        id: 'imgpreviewid',
                                                        style: 'width:400px;height:200px;',
                                                        html: '<div>xx</div>'
                                                    }
                                                ]
                                        }
                                    ]
                            },
                            {
                                type: 'hbox',
                                align: 'center',
                                height: 125,
                                children:
                                    [
                                        {
                                            type: 'select',
                                            id: 'imglistitemsid',
                                            label: lang.picturesList,
                                            multiple: false,
                                            style: 'height:125px',
                                            items: [],
                                            onChange: function (api) {
                                                selectFirstIfNotUnique(this);
                                            }
                                        },
                                        {
                                            type: 'vbox',
                                            children:
                                                [
                                                    {
                                                        type: 'button',
                                                        id: 'removeselectedbtn',
                                                        style: 'width:100%;margin-top:15px',
                                                        label: lang.imgDelete,
                                                        onClick: function () {
                                                            removeSelected(this.getDialog());
                                                        }
                                                    },
                                                    {
                                                        type: 'button',
                                                        id: 'editselectedbtn',
                                                        style: 'width:100%',
                                                        label: lang.imgEdit,
                                                        onClick: function () {
                                                            editeSelected(this.getDialog());
                                                        }
                                                    },
                                                    {
                                                        type: 'hbox',
                                                        children:
                                                            [
                                                                {
                                                                    type: 'button',
                                                                    id: 'upselectedbtn',
                                                                    style: 'width:100%;',
                                                                    label: lang.arrowUp,
                                                                    onClick: function () {
                                                                        upDownSelected(this.getDialog(), -1);
                                                                    }
                                                                },
                                                                {
                                                                    type: 'button',
                                                                    id: 'downselectedbtn',
                                                                    style: 'margin:0;width:100%',
                                                                    label: lang.arrowDown,
                                                                    onClick: function () {
                                                                        upDownSelected(this.getDialog(), 1);
                                                                    }
                                                                }
                                                            ]
                                                    }
                                                ]
                                        }
                                    ]
                            }
                        ]
                    }
                ]
            }
        ],


        onLoad: function () {
        },
        // Invoked when the dialog is loaded.
        onShow: function () {
            this.dialog = this;
            this.slideshowDOM = null;
            this.openCloseStep = true;
            this.fakeImage = null;
            var slideshowDOM = null;
            this.imagesList = [];
            this.params = [];
            this.previewImage = editor.document.createElement('img');
            this.okRefresh = true;

            var fakeImage = this.getSelectedElement();
            if (fakeImage && fakeImage.data('cke-real-element-type') && fakeImage.data('cke-real-element-type') == 'slideShow') {
                this.fakeImage = fakeImage;
                slideshowDOM = editor.restoreRealElement(fakeImage);
            }
            if (!slideshowDOM) {
                this.params.push(['slideshowid', numbering('slideShow')]);
                initImgListFromFresh(this);
                this.commitContent(this);
            } else {
                this.slideshowDOM = slideshowDOM;
                // Get the  reference of the slideSjow Images Container
                var slideShowContainer = getImagesContainerBlock(this, slideshowDOM);
                if (slideShowContainer == null) {
                    alert("BIG Problem slideShowContainer !!");
                    return false;
                }
                var slideshowid = slideshowDOM.getAttribute('id');
                if (slideshowid == null) {
                    alert("BIG Problem slideshowid !!");
                    return false;
                }
                this.params.push(['slideshowid', slideshowid]);
                // a DOM has been found updatet images List and Dialog box from this DOM
                initImgListFromDOM(this, slideShowContainer);
                // Init params Array from DOM
                // Copy all attributes to an array.
                var domDatas = slideshowDOM.$.dataset;
                var param;
                for (param in  domDatas) {
                    this.params.push([param, domDatas[param]]);
                }
                this.setupContent(this, true);
                this.newSlideShowMode = false;
            }
            this.openCloseStep = false;
            previewSlideShow(this);
        },

        onOk: function () {

            return false;
        },

        onHide: function () {
            cleanAll(this);
        }
    };
});
