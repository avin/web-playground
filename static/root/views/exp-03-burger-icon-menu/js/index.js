// @process

import $ from 'jquery';

console.log(2);

$('.menu').on('click', function (e) {
  e.preventDefault();
  $(this).toggleClass('menu_active');
});
