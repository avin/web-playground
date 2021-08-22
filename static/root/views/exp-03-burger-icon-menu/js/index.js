// @process

import $ from 'jquery';

$('.menu').on('click', function (e) {
  e.preventDefault();
  $(this).toggleClass('menu_active');
});
