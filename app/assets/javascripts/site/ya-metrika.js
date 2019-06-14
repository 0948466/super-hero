$(function () {
    const btnGoal = $('.js-btn-goal');
    if (btnGoal.length) {
        btnGoal.on('click', () => {
            ym(53867728, 'reachGoal', 'click_by_button')
        })
    }
});