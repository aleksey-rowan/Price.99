/* global module, require */

var $ = require('./../libs/jquery-1.11.1.min'),
    pricePoint = require('./../modules/pricepoint'),
    nodes = $("body").children(":not('script, style')"), //$("body").children().not("script"),
    garbage,
    array,
    pricePoints = [],
    storage = require('./../modules/storage');

require('./../libs/highlightRegex');

function unwrapNodes(nodes) {
    nodes.forEach(function (n) {
        n.contents().unwrap();
    });
}

module.exports = {
    
    parse: function () {
        garbage = [];
        array = [];
        
        nodes.highlightRegex(/[$£€￥₠₡₢₣₤₥₦₧₨₩₪₫₭₮₯₰₱₲₳₴₵₶₷₸₹₺.\d]/ig, {
            tagType: 'ppnn'
        });
        
        nodes.find('ppnn:not(.ppnn-parsed)').each(function (i, elm) {
            var t;
            elm = $(elm).addClass('ppnn-parsed');
            
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
                
                pricePoints.push(pricePoint.create(m[0], elm));
                //pricePoints.push(Object.create(pricePoint).init(m[0], elm));
            } else {
                console.log('garbage', value);
            }
            
            // release garbage nodes
            unwrapNodes(elm);
        });
        
        console.log('Price points length', pricePoints.length);
    },
    
    updatePrices: function () {
        pricePoints.forEach(function (pp) {
            pp.update();
            //count += pp.isChanged ? 1 : 0;
        });
    },
    
    blah: function () {
        console.log('parser o', storage.options);
    }
};