/* global module, require */

var $ = require('./../libs/jquery-1.11.1.min'),
    nodes = $("body").children(":not('script, style')"), //$("body").children().not("script"),
    garbage,
    array,
    storage = require('./../modules/storage');

require('./../libs/highlightRegex');

function unwrapNodes(nodes) {
    nodes.forEach(function (n) {
        n.contents().unwrap();
    });
}

module.exports = {
    pricePoints: [],

    parse: function () {
        array = [];
        garbage = [];

        nodes.highlightRegex(/[$£€￥₠₡₢₣₤₥₦₧₨₩₪₫₭₮₯₰₱₲₳₴₵₶₷₸₹₺.\d]/ig, {
            tagType: 'ppnn'
        });

        $('ppnn').each(function (i, elm) {
            var t;
            elm = $(elm);

            if (elm.text() === '$') {
                array.push([elm]);
            } else if (array.length > 0) {
                t = array[array.length - 1];
                t.push(elm);
            } else {
                garbage.push(elm);
            }
        });

        unwrapNodes(garbage);

        array.forEach(function (elm) {
            var value = elm.map(function (e) { return e.text(); }).join(""),
                m = value.match(/^[$£€￥₠₡₢₣₤₥₦₧₨₩₪₫₭₮₯₰₱₲₳₴₵₶₷₸₹₺](\d+)((.|,)\d{2})?/ig);

            if (m) {
                console.log('match', m[0], '->', (parseFloat(m[0].replace(/[$£€￥₠₡₢₣₤₥₦₧₨₩₪₫₭₮₯₰₱₲₳₴₵₶₷₸₹₺]/, '')) % 1).toFixed(2), '||', value);
                //pricePoints.push(Object.create(pricePoint).init(m[0], elm));
            } else {
                console.log('garbage', value);
            }

            // release garbage nodes
            unwrapNodes(elm);
        });        
    },

    blah: function () {
        console.log('parser o', storage.options);
    }
};