$( function () {
    const formReg = $('.form-reg')

    const btnStart = $('.themes-form-questions__btn_start')
    const btnQuestions = $('.themes-form-questions__btn_questions')

    const itemWrap = $('.themes-form-questions__item-wrap')
    const CLASS_ITEM_WRAP_START = 'themes-form-questions__item-wrap_start'
    const CLASS_ITEM_WRAP_QUESTIONS = 'themes-form-questions__item-wrap_questions'
    const CLASS_ITEM_WRAP_FINISH = 'themes-form-questions__item-wrap_finish'

    function scrollToTop(selector) {
        if ($(window).width() > 767) {
            return
        }
        $([document.documentElement, document.body]).animate({
            scrollTop: $(selector).offset().top - 10
        }, 0);
    }

    if (btnStart.length) {
        function onBtnStartClick(e) {
            e.preventDefault();
            const inputName = $('input[name="user[name]"]')
            if (!inputName.is(':valid')) {
                toastr.error('Необходимо указать имя');
            } else {
                itemWrap.removeClass(CLASS_ITEM_WRAP_START).addClass(CLASS_ITEM_WRAP_QUESTIONS)
                scrollToTop('.themes-form-questions__questions');
            }
        }

        btnStart.on('click', onBtnStartClick)
    }

    if (btnQuestions.length) {
        function onBtnQuestionsClick(e) {
            e.preventDefault();
            const item = $('.themes-form-questions__item')
            const CLASS_ITEM_ACTIVE = 'themes-form-questions__item_active'
            const itemActive = item.filter(`.${CLASS_ITEM_ACTIVE}`)

            const inputChecked = itemActive.find('input').filter(function() {
                return $(this).prop('checked');
            });
            if (!inputChecked.length) {
                toastr.error('Необходимо что-то выбрать');
                return;
            }

            const position = itemActive.data('position')
            const itemNext = item.filter(`[data-position="${position + 1}"]`)

            if (itemNext.length) {
                item.removeClass(CLASS_ITEM_ACTIVE)
                itemNext.addClass(CLASS_ITEM_ACTIVE)
                scrollToTop('.themes-form-questions__questions');
            } else {
                itemWrap.removeClass(CLASS_ITEM_WRAP_QUESTIONS).addClass(CLASS_ITEM_WRAP_FINISH)
                scrollToTop('.themes-form-questions__finish');
            }

        }
        btnQuestions.on('click', onBtnQuestionsClick)
    }

    if (formReg.length) {
        function onFormSubmit(e) {
            const inputEmail = $('input[name="user[email]"]')

            if (itemWrap.hasClass(CLASS_ITEM_WRAP_FINISH) && !inputEmail.is(':valid')) {
                e.preventDefault();
                toastr.error('Необходимо указать верный email');
                return;
            }
            if (!itemWrap.hasClass(CLASS_ITEM_WRAP_FINISH)) {
                onBtnStartClick(e);
            }
        }
        formReg.on('submit', onFormSubmit)
    }
});