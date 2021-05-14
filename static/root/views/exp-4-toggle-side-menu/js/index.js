// @process

import $ from 'jquery';

$('.side-menu__btn').on('click', function () {
    $(this).closest('.side-menu').toggleClass('side-menu_active');

    $(this).toggleClass('side-menu__btn_close');
});

$('html, .side-menu__menu-item').on('click', function () {
    $('.side-menu__btn_close').click();
});

$('.side-menu').on('click', function (e) {
    e.stopPropagation();
});
