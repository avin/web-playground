import $ from 'jquery';
import '../styles/main.scss';

$('.menu').on('click', function(e) {
    e.preventDefault();
    $(this).toggleClass('menu_active');
});
