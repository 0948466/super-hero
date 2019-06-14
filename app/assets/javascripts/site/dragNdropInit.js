$( function () {
    const dragNdrop = () => {

        const editPhotoLink = document.querySelector('.edit-photo-link')
        editPhotoLink.addEventListener('click', () => {
            const fileElemInput = document.getElementById('fileElem')
            fileElemInput.addEventListener('change', (e) => {
                handleFiles(e.target.files)
            })
        })

        // ************************ Drag and drop ***************** //
        let dropArea = document.getElementById('drop-area')
            // Prevent default drag behaviors
        ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false)
            document.body.addEventListener(eventName, preventDefaults, false)
        })

        // Highlight drop area when item is dragged over it
        ;['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false)
        })

        ;['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false)
        })

        // Handle dropped files
        dropArea.addEventListener('drop', handleDrop, false)

        function preventDefaults(e) {
            e.preventDefault()
            e.stopPropagation()
        }

        function highlight() {
            dropArea.classList.add('highlight')
        }

        function unhighlight() {
            dropArea.classList.remove('highlight')
        }

        function handleDrop(e) {
            var dt = e.dataTransfer
            var files = dt.files
            handleFiles(files)
        }


        function handleFiles(files) {
            files = [...files]
            files.forEach(previewFile)
        }

        function previewFile(file) {
            let reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onloadend = function() {
                let img = document.createElement('img')
                img.setAttribute('id', 'image')
                img.src = reader.result
                document.getElementById('gallery').innerHTML = ''
                document.getElementById('gallery').appendChild(img)

                const image = document.getElementById('image')
                const btnGetCropped = document.querySelector('#btnGetCropped')
                // const imageForm = document.querySelector('.my-form')
                const inputBase64 = document.querySelector('#getBase64')
                const popoverCloseBtn = document.querySelector('.mfp-close')
                const popupList = document.querySelector('.edit-photo-popup-list')
                const hiddenTxt = document.querySelector('.edit-photo-popup-hidden-txt')

                btnGetCropped.classList.remove('hidden')
                btnGetCropped.classList.add('b-green')
                btnGetCropped.removeAttribute('disabled')

                popupList.classList.add('hidden')
                hiddenTxt.classList.remove('hidden')

                popoverCloseBtn.addEventListener('click', () => {
                    cropper.destroy()
                    image.remove()
                    btnGetCropped.classList.remove('b-green')
                    btnGetCropped.classList.add('b-gray')
                    btnGetCropped.setAttribute('disabled', 'disabled')
                })

                btnGetCropped.addEventListener('click', () => {
                    //e.preventDefault();
                    const canvasImage = cropper.getCroppedCanvas({
                        width: 240 * 2,
                        height: 430 * 2,
                    })
                    inputBase64.value = canvasImage.toDataURL('base64')
                    editPhotoLink.textContent = 'Изменить своё фото'
                    $('.js-text-load-img').text('Фотография успешно загружена.')
                    $.magnificPopup.close()
                })
                var minAspectRatio = 0.5
                var maxAspectRatio = 1.5

                var cropper = new Cropper(image, {
                    aspectRatio: 240 / 430,
                    viewMode: 1,
                    ready: function() {
                        var cropper = this.cropper
                        var containerData = cropper.getContainerData()
                        var cropBoxData = cropper.getCropBoxData()
                        var aspectRatio = cropBoxData.width / cropBoxData.height
                        var newCropBoxWidth

                        if (aspectRatio < minAspectRatio || aspectRatio > maxAspectRatio) {
                            newCropBoxWidth = cropBoxData.height * ((minAspectRatio + maxAspectRatio) / 2)

                            cropper.setCropBoxData({
                                left: (containerData.width - newCropBoxWidth) / 2,
                                width: newCropBoxWidth,
                            })
                        }
                    },

                    cropmove: function() {
                        var cropper = this.cropper
                        var cropBoxData = cropper.getCropBoxData()
                        var aspectRatio = cropBoxData.width / cropBoxData.height

                        if (aspectRatio < minAspectRatio) {
                            cropper.setCropBoxData({
                                width: cropBoxData.height * minAspectRatio,
                            })
                        } else if (aspectRatio > maxAspectRatio) {
                            cropper.setCropBoxData({
                                width: cropBoxData.height * maxAspectRatio,
                            })
                        }
                    },
                })
            }
        }
    }

    const dragNdropInit = () => {
        const popupEditPhoto = document.querySelector('.edit-photo-popup')
        console.log(popupEditPhoto)
        if (popupEditPhoto) {
            dragNdrop()
        }
    }

    dragNdropInit();
});

