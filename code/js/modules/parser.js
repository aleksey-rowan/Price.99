/* global module, require, document */

var $ = require('./../libs/jquery-1.11.1.min'),
    pricePoint = require('./../modules/pricepoint'),
    //nodes,
    //nodes = $("body").children(":not('script, style')"), //$("body").children().not("script"),
    garbage,
    array,
    pricePoints = [],

    // tags to ignore when peeking and parsing
    ignoreTags = ['STYLE', 'SCRIPT', 'NOSCRIPT', 'TEXTAREA'],

    util = require('../modules/util.js'),
    storage = require('./../modules/storage'),
    highlightRegex = require('./../libs/highlightRegex');

function unwrapNodes(nodes) {
    nodes.forEach(function (n) {
        n.contents().unwrap();
    });
}

function peekHelper(node) {
    var text,
        re,
        flag = false;

    if (node.nodeType === 3) {

        text = (node.data || node.textContent || node.innerText || "").trim();

        if (text !== "") {
            re = new RegExp(/[$£€￥₠₡₢₣₤₥₦₧₨₩₪₫₭₮₯₰₱₲₳₴₵₶₷₸₹₺]/ig);
            flag = re.test(text);
        }

        if (flag) {
            console.log('PPNN - CT-Parser: First price found', node, text);
        }
    }
    
    // true - continue; false - stop
    return !flag;
}

function getPeekingNodes() {
    return $("body > :not('script, style'):not([data-ppnn='peeked'])");
}

function getParsingNodes() {
    return $("body > :not('script, style')[data-ppnn='peeked']:not([data-ppnn='parsed'])");
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
        //nodes = $("body").children(":not('script, style')");
    },

    /**
     * Peek at the page and try to find a money sign. If found, assume the page has prices - can parse. If not found, don't parse.
     */
    peek: function (n) {
        var nodes = n || getPeekingNodes(),
            flag,
            i, node;

        console.log('PPNN - CT-Parser: Peeking at the page;', nodes.length, 'nodes to peek at');

        for (i = 0; i < nodes.length; i++) {
            node = nodes[i];

            //TODO: imporove ignoring stuff; for example google images have loads of metadata in some divs that might have money signs in it; need to ignore as well. or maybe ignore that using whitelisting/blacklisting later.
            // peekHelper returns false when it finds a price
            flag = util.walk(node, peekHelper, ignoreTags);

            // price found
            if (!flag) {
                // TODO: peek into each node and mark it separatelly, not all together.
                // marked this set of nodes as peeked, to be parsed
                nodes.attr('data-ppnn', 'peeked');
                
                console.log('PPNN - CT-Parser: Prices detected');
                return true;
            }
        }

        console.log('PPNN - CT-Parser: No prices detected');
        return false;

    },

    parse: function (n) {
        var nodes;

        garbage = [];
        array = [];

        // do not parse the page if the extension is paused
        if (!storage.options.otherRules.enabled) {
            console.log('PPNN - CT-Parser: Extension paused.');
            return this;
        }

        //if (!this.peek()) {
        //    console.log("No prices found");
        //    return this;
        //} else {
        //    console.log("Found at least one price. Run the full parser.");
        //}

        nodes = n || getParsingNodes();

        console.log('PPNN - CT-Parser: Start parsing;', nodes.length, 'new nodes to parse');

        nodes
            .highlightRegex(/[$£€￥₠₡₢₣₤₥₦₧₨₩₪₫₭₮₯₰₱₲₳₴₵₶₷₸₹₺.()a\d]/ig, {
                tagType: 'ppnn'
            })
            .attr('data-ppnn', 'parsed')
        ;

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

        console.log('PPNN - CT-Parser: Total price points catalogued', pricePoints.length);

        return this;
    },

    /**
     * Check if any of the stored price points are no longer present in the dom and remove them from memory.
     */
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
        console.log('PPNN - CT-Parser : Prices updated');

        return this;
    },

    blah: function () {
        console.log('parser o', storage.options);
    }
};