/* global module, require, document */

var $ = require('./../libs/jquery-1.11.1.min'),
    pricePoint = require('./../modules/pricepoint'),
    nodes,
    //nodes = $("body").children(":not('script, style')"), //$("body").children().not("script"),
    garbage,
    array,
    pricePoints = [],
    util = require('../modules/util.js'),
    storage = require('./../modules/storage'),
    highlightRegex = require('./../libs/highlightRegex');

function unwrapNodes(nodes) {
    nodes.forEach(function (n) {
        n.contents().unwrap();
    });
}

function peekPricesHelper(node) {
    var text,
        re,
        flag = false;

    if (node.nodeType === 3) {
        text = node.textContent || node.innerText || "";

        if (text !== "") {
            re = new RegExp(/[$£€￥₠₡₢₣₤₥₦₧₨₩₪₫₭₮₯₰₱₲₳₴₵₶₷₸₹₺](\d{1,5})((\.)\d{1,2})?/ig);
            flag = re.test(text);
        }

    }

    return !flag;
}

function peekPrices(nodes) {
    var flag,
        i, node;

    for (i = 0; i < nodes.length; i++) {
        node = nodes[i];

        flag = util.walk(node, peekPricesHelper);

        if (!flag) {
            return true;
        }
    }

    return false;
}

module.exports = {

    testHook: function (j, d) {
        $ = j;
        highlightRegex.testHook($, d);
        pricePoint.testHook($);
        util.testHook(d);
    },

    init: function () {
        highlightRegex.main($, document);
        nodes = $("body").children(":not('script, style')");
    },

    parse: function (n) {
        garbage = [];
        array = [];

        // do not parse the page if the extension is paused
        /*if (!storage.options.otherRules.enabled) {
            return this;
        }*/

        nodes = n || nodes;

        if (!peekPrices(nodes)) {
            console.log("No prices found");
            return this;
        } else {
            console.log("Found at least one price. Run the full parser.");
        }

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
                /// console.log('match', m[0], '->', (parseFloat(m[0].replace(/[$£€￥₠₡₢₣₤₥₦₧₨₩₪₫₭₮₯₰₱₲₳₴₵₶₷₸₹₺]/, '')) % 1).toFixed(2), '||', value);

                pricePoints.push(pricePoint.create(m[0], elm));
            } else {
                /// console.log('garbage', value);
            }

            // release garbage nodes
            unwrapNodes(elm);
        });

        console.log('Price points length', pricePoints.length);

        return this;
    },

    purge: function () {
        var array = [];

        pricePoints.forEach(function (pp) {
            if (!util.containsInDom(pp.parts.currencySign[0])) {
                array.push(pp);
            }
        });

        array.forEach(function (pp) {
            util.removeFromArray(pricePoints, pp);
        });

        return this;
    },

    getPricePoints: function () {
        return pricePoints;
    },

    updatePrices: function () {
        // do not update prices if the extension is paused
        /*if (!storage.options.otherRules.enabled) {
            return this;
        }*/

        pricePoints.forEach(function (pp) {
            pp.update();
            //count += pp.isChanged ? 1 : 0;
        });
        console.log('CT-Parser : Prices updated');

        return this;
    },

    blah: function () {
        console.log('parser o', storage.options);
    }
};