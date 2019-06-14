$( function () {
    const switchHero = $('.js-switch-hero')
    const switchUser = $('.js-switch-user')
    const switchInput = $('.js-switch-input')
    const popupUsers = $('.popup-users')
    const CLASS_SWITCH_WRAP = 'switch-wrap'
    const CLASS_POPUP_USER_SHOW_USER = 'popup-users_show-user'

    if (!switchHero.length) {
        return
    }

    function onInputChange() {
        popupUsers.toggleClass(CLASS_POPUP_USER_SHOW_USER)
    }

    function onLabelClick(event, checked) {
        const input = $(event.target).closest(`.${CLASS_SWITCH_WRAP}`).find('input')
        if (input.prop('checked') === checked) {
            return
        }
        input.prop('checked', checked)
        onInputChange()
    }

    switchHero.on('click', (e) => {
        onLabelClick(e, false)
    })

    switchUser.on('click', (e) => {
        onLabelClick(e, true)
    })

    switchInput.on('change', onInputChange)
});