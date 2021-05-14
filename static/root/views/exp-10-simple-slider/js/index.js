// @process

import merge from 'lodash/merge';
import $ from 'jquery';

class Slider {
    options = {
        containerEl: null,
        width: 200,
        minValue: 0,
        maxValue: 100,
        onChange: () => {},
    };

    $root = null;

    $mark = null;

    lastTranslate = 0;

    currentTranslate = 0;

    isDragging = false;

    startX = null;

    constructor(options = {}) {
        merge(this.options, options);

        this.$root = $(this.options.containerEl).empty();

        this.$root.css('width', this.options.width);

        this.init();
    }

    init() {
        this.$root.append(`\
<div class='Slider'>
    <div class='Slider--line'>
        <div class='Slider--mark' data-id='mark'></div>
    </div>

    <div class='Slider--labels'>
        <div class='Slider--label Slider--label_left' data-id='label-left'>-1</div>
        <div class='Slider--label Slider--label_right' data-id='label-right'>1</div>
    </div>
</div>
`);

        this.$mark = this.$root.find('[data-id="mark"]');
        this.$root.find('[data-id="label-left"]').text(this.options.minValue);
        this.$root.find('[data-id="label-right"]').text(this.options.maxValue);

        this.$mark.on('mousedown touchstart', (e) => {
            this.isDragging = true;
            this.startX = this.getClientX(e);
        });

        $('body').on('mouseup mouseleave touchend', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.currentTranslate = this.lastTranslate;
            }
        });

        $('body').on('mousemove touchmove', (e) => {
            if (this.isDragging) {
                const pos = this.calcPos(this.getClientX(e));
                this.$mark.css('transform', `translateX(${pos}px)`);
                this.lastTranslate = pos;

                const percentVal = pos / this.options.width;
                const val = (this.options.maxValue - this.options.minValue) * percentVal + this.options.minValue;
                this.options.onChange(Math.round(val));
            }
        });
    }

    getClientX(e) {
        if (e.touches && e.touches[0]) {
            return e.touches[0].pageX;
        }

        return e.clientX;
    }

    calcPos(clientX) {
        const xDiff = clientX - this.startX;
        return Math.max(0, Math.min(this.options.width, this.currentTranslate + xDiff));
    }
}

new Slider({
    containerEl: document.querySelector('#slider'),
    minValue: -100,
    maxValue: 100,
    width: 200,

    onChange: (val) => {
        $('#value').text(val);
    },
});
