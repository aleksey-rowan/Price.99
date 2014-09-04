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

module.exports.testHook = function (j) {
    $ = j;
};

module.exports = {
    
    parse: function (n) {
        garbage = [];
        array = [];
        
        nodes = n || nodes;

        nodes.highlightRegex(/[$£€￥₠₡₢₣₤₥₦₧₨₩₪₫₭₮₯₰₱₲₳₴₵₶₷₸₹₺.()a\d]/ig, {
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
                //[$](\d{1,5})((\.|,)\d{1,2})?


                m = value.match(/^[$£€￥₠₡₢₣₤₥₦₧₨₩₪₫₭₮₯₰₱₲₳₴₵₶₷₸₹₺](\d{1,5})((\.)\d{1,2})?/ig);
            
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

        return this;
    },
    
    getPricePoints: function () {
        return pricePoints;
    },

    updatePrices: function () {
        pricePoints.forEach(function (pp) {
            pp.update();
            //count += pp.isChanged ? 1 : 0;
        });
        console.log('CT-Parser : Prices updated');
    },
    
    blah: function () {
        console.log('parser o', storage.options);
    }
};