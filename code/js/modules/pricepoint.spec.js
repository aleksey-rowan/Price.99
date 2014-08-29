var assert = require('assert');
var p,
    pricepoint = require('./pricepoint'),
    storage = require('./../modules/storage'),
    jsdom = require('jsdom'),
    window = jsdom.jsdom().parentWindow;

storage.options = {
    roundRules: {
        cents: {
            value: 79,
            enabled: true
        },
        dollars: {
            value: 9,
            enabled: false
        },
        tens: {
            value: 9,
            enabled: false
        },
        hundreds: {
            value: 1,
            enabled: false
        }
    },
    otherRules: {
        hideAllCents: false,
        hideZeroCents: true
    }
};

describe('pricepoint module', function () {

    it('should hook jquery to module without error', function (done) {
        jsdom.jQueryify(window, './../libs/jquery-1.11.1.min.js', function () {
            var $ = window.$;
            //$("body").prepend("<h1>The title</h1>");

            pricepoint.testHook($);

            done();
        });
    });

    it('should export create() function', function () {
        assert.strictEqual(pricepoint && typeof (pricepoint.create), 'function');
    });

    it('should create() pricepoint object with 11 commands', function () {
        p = pricepoint.create('$0.00', []);
        assert('object' === typeof (p));
        assert(11 === Object.keys(p).length);
        assert.deepEqual(['init', 'isChanged', 'newPrice', 'nodes', 'oldPrice', 'parts', 'recalculatePrice', 'reset', 'setPrice', 'synchronize', 'update'],
            Object.keys(p).sort());
    });

    it('should correctly round the price $9.99 -> $10.00', function () {
        p = pricepoint.create('$9.79', []);
        p.recalculatePrice();

        //console.log(p.oldPrice, p.newPrice);
        assert(10 === p.newPrice.value);
        assert('10.00' === p.newPrice.valueString);
        assert(10 === p.newPrice.whole);
        assert(0 === p.newPrice.fraction);
        assert(2 === p.newPrice.decimalMarkIndex);
    });


    /*it('should create() handler object with 3 commands', function () {
        h = handlers.create('test');
        assert('object' === typeof (h));
        assert(3 === Object.keys(h).length);
        assert.deepEqual(['echo','random','randomAsync'], Object.keys(h).sort());
    });
    
    it('should "return" random number 0 - 999', function () {
        h.random(function (i) {
            assert('number' === typeof (i));
            assert(0 <= i);
            assert(i <= 999);
        });
    });*/

});

