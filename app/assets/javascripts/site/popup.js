$( function () {
    $('.btn-popup').magnificPopup({
        type: 'inline',
        closeOnBgClick: true,
        callbacks: {
            beforeOpen() {
                $('body').addClass('mfp-active')
            },
            beforeClose() {
                $('body').removeClass('mfp-active')
            },
        },
    })
});
