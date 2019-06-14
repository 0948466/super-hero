$ ->
  toastr.clear()
  toastr.options =
    "closeButton": true
    "debug": false
    "progressBar": true
    "preventDuplicates": true
    "positionClass": "toast-top-right"
    "onclick": null
    "showDuration": "400"
    "hideDuration": "1000"
    "timeOut": "7000"
    "extendedTimeOut": "1000"
    "showEasing": "swing"
    "hideEasing": "linear"
    "showMethod": "fadeIn"
    "hideMethod": "fadeOut"


  $(".flash_error, .flash_notice, .flash_alert, .flash_success, .flash_info").each ->
    $flash = $(@)
    console.log($flash)
    type = $flash.data("type")
    message = $flash.text()
    type = 'success' if type == 'notice'
    type = 'success' if type == 'alert'
    toastr[type](message)
    $(@).remove()